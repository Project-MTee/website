import { Component, OnInit } from '@angular/core';
import { ITldTranslateCoreConfig, ITldTranslateFileConfig, ITldTranslateTextConfig } from 'tld-translate/lib/modules/tld-common/models';
import { ConfigService } from '../../shared/services/config.service';

@Component({
  selector: 'app-translate',
  templateUrl: './translate.component.html',
  styleUrls: ['./translate.component.scss']
})
export class TranslateComponent implements OnInit {
  coreConfig!: ITldTranslateCoreConfig;
  fileConfig!: ITldTranslateFileConfig;
  textConfig!: ITldTranslateTextConfig;

  constructor(private readonly config: ConfigService) { }

  ngOnInit(): void {
    this.coreConfig = this.config.appConfig.core;
    this.textConfig = this.config.appConfig.text;
    this.fileConfig = this.config.appConfig.file;
  }

}
