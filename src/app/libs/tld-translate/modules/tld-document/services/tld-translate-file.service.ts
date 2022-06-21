import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { saveAs } from 'file-saver';
import { Observable, Subject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Common, ErrorCode, IDownloadFileParams, IFileMeta, IGetFileStatusParams, IGetFileTranslationStatusResponse, IRemoveFileParams, ISourceFilePreviewResponse, IStartFileTranslationParams, ISystem, ITldError, ITranslatedDocumentPreviewParams } from '../../tld-common/models';
import { TldAlertService, TldTranslateConfigService } from '../../tld-common/services';
import { IActiveData } from '../../tld-tooltip/models';
import { TldSystemService } from '../../tld-tooltip/services';
import { TranslationStatuss } from '../models';
import { ITranslationFile } from '../models/translate-file.model';
import { FileApiV2Service } from './api-v2/file-api-v2.service';

@Injectable({
  providedIn: 'root'
})
export class TldTranslateFileService {

  translationStarted: boolean;
  /** Value to be set to true while loading source preview. At that time, translate button should be disabled. */
  isUploadingFile: boolean;
  translationFiles: ITranslationFile[] = [];
  fileNames: string[] = [];
  filesAdded: number;
  //for multiple file component
  translatedCount: number = 0;

  private activeSystem: ISystem;
  // TODO. Configurable?
  private readonly _defaultStatusCheckTimeout = 1000;
  private readonly _statusTimeouts = {};
  private readonly _onClear = new Subject<any>();
  
  constructor(
    private readonly fileApi: FileApiV2Service,
    private readonly alerts: TldAlertService,
    private sanitizer: DomSanitizer,
    private config: TldTranslateConfigService,
    private readonly tldSystem: TldSystemService) {
    this._statusTimeouts[TranslationStatuss.EXTRACTING] = 1000;
    this._statusTimeouts[TranslationStatuss.EXTRACTING] = 1000;
    this._statusTimeouts[TranslationStatuss.INITIALIZING] = 1000;
    this._statusTimeouts[TranslationStatuss.QUEUING] = 1000;
    this._statusTimeouts[TranslationStatuss.SAVING] = 1000;
    this._statusTimeouts[TranslationStatuss.TRANSLATING] = 1000;
    this._statusTimeouts[TranslationStatuss.WAITING] = 10000;
  }

  // clears all loaded data
  clear() {
    const fileArr = this.translationFiles;
    fileArr.forEach((file) => {
      file.translating = false;
      const params: IRemoveFileParams = {
        file: file
      };
      this.fileApi.remove(params).subscribe();
    });

    this.translationStarted = false;
    this.translationFiles = [];
    this.fileNames = [];
    this.translatedCount = 0;
    this._onClear.next();
  }

  onClear(): Observable<any> {
    return this._onClear.asObservable();
  }

  remove(file: ITranslationFile) {
    const ix = this.translationFiles.indexOf(file);
    if (ix < 0) {
      throw "Can't remove file";
    }

    this.translationFiles.splice(ix, 1);
    if (this.translationFiles.length == 0) {
      this.clear();
    }
  }



  downloadTarget(translationFile: ITranslationFile, fileMeta: IFileMeta) {
    if (translationFile.isDownloading) {
      return;
    }

    translationFile.isDownloading = true;
    const downloadParams: IDownloadFileParams = {
      id: translationFile.id,
      fileMeta: fileMeta
    };
    this.fileApi.download(downloadParams).subscribe((response) => {
      translationFile.isDownloading = false;
      saveAs(response, fileMeta ? fileMeta.fileName : translationFile.name);
    }, () => { translationFile.isDownloading = false; });
  }

  loadFilePreview(file: File): ITranslationFile {
    if (this.fileNames.includes(file.name)) {
      this.alerts.error("ERRORS.FILE_ALREADY_ADDED", null, { fileName: file.name });
      return null;
    }

    this.isUploadingFile = true;
    const translationFile: ITranslationFile = {
      name: file.name,
    }

    this.translationFiles.push(translationFile);
    this.fileNames.push(file.name);

    this.fileApi.sourceFilePreview(file).subscribe((resp) => {
      if (resp.isFilePreviewLoaded) {
        this.isUploadingFile = false;
      }
      this.onFilePreviewLoad(resp, translationFile);
    })
    return translationFile;
  }

  translateButtonClick(active: IActiveData) {
    this.translationStarted = true;
    this.translationFiles.forEach((file) => {
      this.startFileTranslation(active, file);
    })
  }

  startFileTranslation(activeSystem: IActiveData, translationFile: ITranslationFile) {
    if (!this.canStartTranslation(translationFile)) {
      console.error("Could not start file translation!");
      return;
    }
    this.activeSystem = this.tldSystem.getActiveSystemObj();
    translationFile.translationStarted = true;
    translationFile.translating = true;
    // quite weird. Response can be structure with success and error params and it can also be plain string in success.
    const params: IStartFileTranslationParams = {
      fileName: translationFile.name,
      tmpName: translationFile.tmpName,
      system: activeSystem.system
    };
    this.fileApi.startTranslation(params).pipe(
      catchError((error) => {
        this.fileApiError(translationFile, error);
        throw error;
      })
    ).subscribe((response: string) => {
      translationFile.id = response;
      translationFile.translationStartedOnServer = true;

      this.checkTranslationProgress(translationFile);
    });
  }

  convertedSourceFileName(fileName: string): string {
    const postFix = "_converted.docx";
    fileName = fileName.slice(0, fileName.lastIndexOf("."));
    const convertedFileName = fileName + postFix;
    return convertedFileName;
  }

  // checks all necessary params that are responsible wheter it is allowed to start new translation.
  private canStartTranslation(translationFile: ITranslationFile) {
    return translationFile.tmpName && !translationFile.translating;
  }

  private checkTranslationProgress(translationFile: ITranslationFile) {
    const finishedStatus = TranslationStatuss.COMPLETED;
    const params: IGetFileStatusParams = {
      id: translationFile.id,
      srcLang: this.activeSystem.sourceLanguage,
      trgLang: this.activeSystem.targetLanguage
    };
    this.fileApi.getStatus(params)
      .pipe(
        map(
          (value: any) => {
            if (value && value.status) {
              value.status = value.status.toUpperCase();
            }
            return value;
          }),
        catchError((response) => {
          this.fileApiError(response, response);
          const error: ITldError = { ErrorCode: response.error };
          throw error;
        })
      )
      .subscribe(
        (response: IGetFileTranslationStatusResponse) => {
          if(response.systemId && response.systemId!==this.activeSystem.id){
            this.tldSystem.changeSystem(response.systemId, false);
            this.activeSystem = this.tldSystem.getActiveSystemObj();
          }

          translationFile.translationStatuss = response.translationStatuss;
          translationFile.sourceDownloadAvailable = response.sourceDownloadAvailable;
          translationFile.progress = response.progress;
          translationFile.availableExtensions = response.extensions;
          if (translationFile.translationStatuss == TranslationStatuss.ERROR) {
            const error: ITldError = { ErrorCode: response.substatus ?? ErrorCode.E_FAILED_IN_TRANSLATION };
            this.fileApiError(translationFile, error);
            throw error;
          }
          else if (translationFile.translationStatuss === finishedStatus) {
            this.translatedCount += 1;
            translationFile.downloadAvailable = true;

            this.translatedDocPreview(translationFile);
            //translationFile.availableExtensions = this.getExtensionArray(response.translations, translationFile.name);
          }
          else {
            let timeout = this._defaultStatusCheckTimeout;
            if (this.config.fileConfig.fileDownloadTimeouts && this.config.fileConfig.fileDownloadTimeouts[translationFile.translationStatuss]) {
              timeout = this.config.fileConfig.fileDownloadTimeouts[translationFile.translationStatuss];
            }
            else if (this._statusTimeouts && this._statusTimeouts[translationFile.translationStatuss]) {
              timeout = this._statusTimeouts[translationFile.translationStatuss];
            }

            setTimeout(() => {
              if (!translationFile.translating) {
                return;
              }
              this.checkTranslationProgress(translationFile)
            }, timeout)
          }
        })
  }


  private onFilePreviewLoad(data: ISourceFilePreviewResponse, translationFile: ITranslationFile) {
    translationFile.isFilePreviewLoaded = data.isFilePreviewLoaded;
    translationFile.tmpName = data.tmpName;
    translationFile.sourcePreviewHasHtml = data.sourcePreviewHasHtml;
    translationFile.sourcePreview = this.sanitizer.bypassSecurityTrustHtml(data.sourcePreview);
    translationFile.filePreviewProgress = data.percentDone;

  }

  private translatedDocPreview(translationFile: ITranslationFile) {
    const params: ITranslatedDocumentPreviewParams = {
      fileName: translationFile.name,
      translationDocId: translationFile.id
    };
    this.fileApi.translatedDocumentPreview(params)
      .subscribe((response: { success: boolean, error?: string, status: string, preview: string }) => {
        translationFile.translating = false;
        if (!response.success) {
          console.error(response.error);
          throw response.error;
        }

        if (response.preview) {
          translationFile.translatedPreview = this.sanitizer.bypassSecurityTrustHtml(response.preview);
        }
        else {
          translationFile.translatedPreview = null;
        }
      })
  }

  private fileApiError(translationFile: ITranslationFile, error: any) {
    console.error(error);
    translationFile.translating = false;
    translationFile.translationStatuss = TranslationStatuss.ERROR;
  }
}
