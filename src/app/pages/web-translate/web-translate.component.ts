import { Component, OnInit } from '@angular/core';
import { ITldTranslateConfig } from 'tld-translate/lib/modules/tld-common/models';
import { ConfigService } from '../../shared/services/config.service';

@Component({
  selector: 'app-web-translate',
  templateUrl: './web-translate.component.html',
  styleUrls: ['./web-translate.component.scss']
})
export class WebTranslateComponent implements OnInit {
  config: ITldTranslateConfig = {};

  constructor(private readonly configService: ConfigService) { }
  ngOnInit(): void {
    this.config.webTranslate = this.configService.appConfig.web;
    this.config.core = this.configService.appConfig.core;
  }

  onError(error: any): void {
  }
}
