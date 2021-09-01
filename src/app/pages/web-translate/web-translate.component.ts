import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ITldTranslateCoreConfig, ITldTranslateTextConfig, ITldTranslateWebsiteConfig } from 'tld-translate/lib/modules/tld-common/models';
import { ConfigService } from '../../shared/services/config.service';

@Component({
  selector: 'app-web-translate',
  templateUrl: './web-translate.component.html',
  styleUrls: ['./web-translate.component.scss']
})
export class WebTranslateComponent implements OnInit {
  coreConfig!: ITldTranslateCoreConfig;
  webtranslateConfig!: ITldTranslateWebsiteConfig;

  constructor(private readonly config: ConfigService) { }
  ngOnInit(): void {
    this.webtranslateConfig = this.config.appConfig.web;
    this.coreConfig = this.config.appConfig.core;
    console.log(this.config);
  }

  onError(error: any): void {
  }
}
