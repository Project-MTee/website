import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ITldTranslateCoreConfig, ITldTranslateTextConfig, ITldTranslateWebsiteConfig } from 'tld-translate/lib/modules/tld-common/models';

@Component({
  selector: 'app-web-translate',
  templateUrl: './web-translate.component.html',
  styleUrls: ['./web-translate.component.scss']
})
export class WebTranslateComponent implements OnInit {
  coreConfig!: ITldTranslateCoreConfig;
  textConfig!: ITldTranslateTextConfig;
  webtranslateConfig!: ITldTranslateWebsiteConfig;

  ngOnInit(): void {
    this.initConfig();
  }

  onError(error: any): void {
  }

  private initConfig(): void {
    //const apiSettings = this.config.getSettings('mt.api');
    //const generalSettings = this.config.getSettings('mt.general');
    //const coreSettings = this.config.getSettings('mt.core');
    //const webtranslateSettings = this.config.getSettings('mt.webtranslate');

    //this.coreConfig = { appId: apiSettings.appID, clientId: apiSettings.clientId };
    //this.coreConfig.isAuth = this.auth.isAuthenticated();
    //this.coreConfig.jwtAuth = apiSettings.jwtAuth;
    //this.coreConfig.sourceLanguageOrder = coreSettings.sourceLanguageOrder;
    //this.coreConfig.targetLanguageOrder = coreSettings.targetLanguageOrder;
    //this.coreConfig.translationServiceUrl = generalSettings.translationServiceUrl;

    //this.webtranslateConfig = {};
    //this.webtranslateConfig.debug = false;
    //this.webtranslateConfig.translatePagePath = webtranslateSettings.webtranslationProxyPath;
    //this.webtranslateConfig.websiteTranslationUrl = webtranslateSettings.websiteTranslationUrl;
    //this.webtranslateConfig.logoLocation = webtranslateSettings.logoLocation;
  }
}
