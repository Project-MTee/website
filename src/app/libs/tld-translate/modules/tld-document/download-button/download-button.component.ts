import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IFileMeta } from '../../tld-common/models';
import { TldTranslateConfigService } from '../../tld-common/services';
import { ITranslationFile } from '../models/translate-file.model';
import { TldTranslateFileService } from '../services/tld-translate-file.service';

@Component({
  selector: 'tld-translate-file-download-button',
  templateUrl: './download-button.component.html',
  styleUrls: ['./download-button.component.scss']
})
export class TldTranslateFileDownloadButtonComponent implements OnInit {

  constructor(
    private readonly fileService: TldTranslateFileService,
    private readonly config: TldTranslateConfigService) {
  }

  allowTmxAuth: boolean;
  allowTmxUnauth: boolean;
  isAuth: boolean;
  get extensions() { return this.file?.availableExtensions || []; }

  @Output() tldClick: EventEmitter<IFileMeta> = new EventEmitter();
  @Input() file: ITranslationFile;
  //@Input() extensions: ITranslationExtensionMeta[];
  @Input() disabled: boolean;
  @Input() sourceDownload: boolean;
  @Input() mobileVersion: boolean = false;

  ngOnInit(): void {
    this.allowTmxAuth = this.config.fileConfig.allowTmxAuth;
    this.allowTmxUnauth = this.config.fileConfig.allowTmxUnauth;
    this.isAuth = this.config.coreConfig.isAuth;
  }

  onClick(meta?: IFileMeta) {
    if (!meta && this.extensions) {
      meta = this.extensions[0];
    }
    this.tldClick.emit(meta)
  }

  onSourceClick() {
    const fileName = this.fileService.convertedSourceFileName(this.file.name);
    this.onClick({fileName: fileName});
  }

  canDownload(extension: string) {
    // some extensions should be allowed to download based on config
    const specialExtensions = ["tmx"];

    if (!specialExtensions.includes(extension.toLowerCase())) {
      return true;
    }

    if ((this.allowTmxUnauth && !this.isAuth) || (this.allowTmxAuth && this.isAuth))
      return true;

    return false;
  }
}
