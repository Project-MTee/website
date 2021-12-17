import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { ITranslationFile } from '../modules/tld-document/models/translate-file.model';
import { TldTranslateFileService } from '../modules/tld-document/services/tld-translate-file.service';

@Component({
  selector: 'tld-translate-body',
  templateUrl: './tld-translate-body.component.html',
  styleUrls: ['./tld-translate-body.component.scss']
})
export class TldTranslateBodyComponent implements OnDestroy {

  constructor(
    private readonly fileTranslateService: TldTranslateFileService) {
  }

  get files(): ITranslationFile[] {
    return this.fileTranslateService?.translationFiles;
  };
  get file(): ITranslationFile {
    return this.fileTranslateService?.translationFiles?.[0];
  }
  get isFilePreviewLoaded() {
    return this.file?.isFilePreviewLoaded;
  }
  get filePreviewProgress() { return this.file?.filePreviewProgress };

  private readonly destroy$ = new Subject();


  fileUpload(files: FileList) {
    for (var i = 0; i < files.length; i++) {
      this.fileTranslateService.loadFilePreview(files.item(i));
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
