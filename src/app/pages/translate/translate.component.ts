import { Component, OnInit } from '@angular/core';
import { ITldTranslateConfig } from 'src/app/libs/tld-translate/modules/tld-common/models';
import { ConfigService } from '../../shared/services/config.service';

@Component({
  selector: 'app-translate',
  templateUrl: './translate.component.html',
  styleUrls: ['./translate.component.scss']
})
export class TranslateComponent implements OnInit {
  config: ITldTranslateConfig = {};

  constructor(private readonly configService: ConfigService) { }

  ngOnInit(): void {
    this.config.core = this.configService.appConfig.core;
    this.config.text = this.configService.appConfig.text;
    this.config.file = this.configService.appConfig.file;
    this.config.audio = this.configService.appConfig.audio;
  }

}
