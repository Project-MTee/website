import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ErrorCode, IDownloadFileParams, IGetFileStatusParams, IGetFileTranslationStatusResponse, IRemoveFileParams, ISourceFilePreviewResponse, IStartFileTranslationParams, ITldError, ITranslatedDocumentPreviewParams, IFileMeta, Common, FileTranslationSubstatus } from '../../../tld-common/models';
import { TldTranslateConfigService } from '../../../tld-common/services';
import { TranslationStatuss } from '../../models/translation-statuss.model';
import { FileV2Category } from './models/file-category-v2.model';
import { IFileTranslationStatusV2Response } from './models/file-translation-status-v2-response.model';

@Injectable({
  providedIn: 'root'
})
export class FileApiV2Service {

  private get url() {
    return this.config.apiV2Config.fileTranslationUrl;
  }

  private uploadedFile: File;
  constructor(private readonly http: HttpClient,
    private readonly config: TldTranslateConfigService) { }


  translatedDocumentPreview(properties: ITranslatedDocumentPreviewParams) {
    properties;
    return of({ success: true });
  }

  download(properties: IDownloadFileParams) {
    return this.http.get(`${this.url}/${properties.id}/${properties.fileMeta.id}`, { responseType: "blob" });
  }

  startTranslation(properties: IStartFileTranslationParams): Observable<string> {
    if (!this.uploadedFile) {
      throw { ErrorCode: ErrorCode.NO_FILE_ADDED } as ITldError;
    }
    const formData: FormData = new FormData();
    formData.append("file", this.uploadedFile);
    formData.append("fileName", properties.fileName);
    formData.append("sourceLanguage", properties.system.sourceLanguage);
    formData.append("targetLanguage", properties.system.targetLanguage);

    if (properties.system.domain) {
      formData.append("domain", properties.system.domain);
    }

    return this.http.post<IFileTranslationStatusV2Response>(this.url, formData).pipe(
      map(response => response.id)
    );
  }

  remove(properties: IRemoveFileParams): Observable<any> {
    if (properties.file.translationStartedOnServer) {
      return this.http.delete(`${this.url}/${properties.file.id}`);
    }
    return of();
  }

  sourceFilePreview(file: File): Observable<ISourceFilePreviewResponse> {
    this.uploadedFile = file;
    const extension = file.name.slice(file.name.lastIndexOf(".") + 1).toLowerCase();
    const sourcePreview = `<div id="docPreviewContent" class="no-preview type-${extension}"><div class="type">${extension.toUpperCase()}</div></div>`;
    return of({
      isFilePreviewLoaded: true,
      sourcePreviewHasHtml: false,
      tmpName: file.name,
      name: file.name,
      sourcePreview: sourcePreview
    })
  }

  getStatus(properties: IGetFileStatusParams): Observable<IGetFileTranslationStatusResponse> {
    return this.http.get<IFileTranslationStatusV2Response>(`${this.url}/${properties.id}`).pipe(
      map((response) => {
        const extensions: IFileMeta[] = [];
        response.files.forEach((file) => {
          if (file.category.toUpperCase() === FileV2Category.TRANSLATED) {
            const fileName = `${this.uploadedFile.name.slice(0, this.uploadedFile.name.lastIndexOf("."))}${file.extension}`;
            extensions.push({ extension: file.extension, fileName: fileName, id: file.id });
          }
        })
        const returnValue: IGetFileTranslationStatusResponse = {
          name: response.fileName,
          progress: Math.floor(response.translatedSegments / response.segments * 100),
          translationStatuss: response.status.toUpperCase() as TranslationStatuss,
          sourceDownloadAvailable: false,
          extensions: extensions,
        };

        if(response.substatus){
          returnValue.substatus = Common.pascalCaseToEnum(response.substatus) as FileTranslationSubstatus;
        }

        if(response.domain){
          returnValue.systemId = `${properties.srcLang}-${properties.trgLang}-${response.domain}`;
        }
        return returnValue;
      })
    );
  }
}
