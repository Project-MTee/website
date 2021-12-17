import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TldCloseButtonComponent } from '../../tld-common/components';
import { IFileMeta } from '../../tld-common/models';
import { TldTranslateConfigService } from '../../tld-common/services';
import { ITranslationFile, TranslationStatuss } from '../models';
import { TldTranslateFileService } from '../services/tld-translate-file.service';

@Component({
  selector: 'tld-translate-file',
  templateUrl: './tld-translate-file.component.html',
  styleUrls: ['./tld-translate-file.component.scss']
})
export class TldTranslateFileComponent implements AfterViewInit, OnDestroy {

  constructor(private translateFile: TldTranslateFileService) {
  }

  @Input() translationFile: ITranslationFile;
  @ViewChild(TldCloseButtonComponent) clearButton: TldCloseButtonComponent;

  get downloading() { return this.translationFile?.isDownloading; }
  get filePreview() { return this.translationFile?.sourcePreview; }
  get isFilePreviewLoaded() { return this.translationFile?.isFilePreviewLoaded; };
  get progress() { return this.translationFile?.progress; }
  get translatedPreview() { return this.translationFile?.translatedPreview; }
  get translating() { return this.translationFile?.translating; }
  get showPreview() { return this.translationFile?.downloadAvailable; }
  get extensions() { return this.translationFile?.availableExtensions || []; }
  get translationStatuss() { return this.translationFile?.translationStatuss }
  get sourcePreviewHasHtml() { return this.translationFile?.sourcePreviewHasHtml; }
  get loadedFileName() { return this.translationFile?.name; }

  readonly translatingStatus = TranslationStatuss.TRANSLATING;
  readonly clearButtonAriaCode = "CLEAR_FILES";

  ngAfterViewInit(){
    this.clearButton.clearButton.focus();
  }

  cancel() {
    this.translateFile.clear();
  }

  clearPreview() {
    this.translateFile.clear();
  }

  download(fileMeta?: IFileMeta) {
    this.translateFile.downloadTarget(this.translationFile, fileMeta);
  }

  ngOnDestroy() {
    this.clearPreview();
  }
}
