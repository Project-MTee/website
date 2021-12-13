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
  showDisclaimer: boolean = false;
  readonly showDisclaimerKey = 'web-translate-disclaimer-closed';

  constructor(private readonly configService: ConfigService) { }
  ngOnInit(): void {
    this.config.webTranslate = this.configService.appConfig.web;
    this.config.core = this.configService.appConfig.core;
    this.showDisclaimer = !localStorage.getItem(this.showDisclaimerKey);
  }

  onError(error: any): void {
  }

  onDisclaimerCose(): void {
    localStorage.setItem(this.showDisclaimerKey, 'true');
    this.showDisclaimer = false;
  }
}
