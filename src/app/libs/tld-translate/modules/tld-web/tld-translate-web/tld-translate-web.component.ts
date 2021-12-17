import { animate, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ProgressBarMode } from '@angular/material/progress-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as $ from 'jquery';
import { Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { TldTranslateButtonService } from '../../tld-common/components/translate-button/tld-translate-button.service';
import { ITldTranslateConfig, ITldTranslateMessage, TldMessageType } from '../../tld-common/models';
import { TldAlertService, TldTranslateConfigService } from '../../tld-common/services';
import { IActiveData } from '../../tld-tooltip/models/active-data.model';
import { ISwitcherTranslationOptions } from '../../tld-tooltip/models/switcher-options.model';
import { TldSystemService } from '../../tld-tooltip/services/tld-system.service';


declare var window: any;
window.$ = window.jQuery = $;

@Component({
  selector: 'tld-translate-website',
  templateUrl: './tld-translate-web.component.html',
  styleUrls: ['./tld-translate-web.component.scss'],
  animations: [
    trigger('openCloseAnimation', [

      transition(':enter', [
        style({ height: 0 }),
        animate(500)
      ]),

      transition(':leave',
        animate(500, style({ height: 0 })))
    ])
  ]
})
export class TldTranslateWebsiteComponent implements OnInit, AfterViewInit, OnDestroy {


  constructor(
    private readonly translate: TranslateService,
    private readonly configService: TldTranslateConfigService,
    private readonly translateButtonService: TldTranslateButtonService,
    private readonly alerts: TldAlertService,
    private readonly router: Router,
    private activatedRoute: ActivatedRoute,
    private readonly tldSystem: TldSystemService
  ) {}

  @ViewChild('websiteFrame') iframe: ElementRef;
  @ViewChild('url') urlInputField: ElementRef;

  settingSystemListForFirstTime: boolean;
  urlToTranslate = ''; // translateWeb_Url
  showCancel = false;
  showRestore = false;
  showTranslateBtn = true;
  translating = false;
  disableButton = false; // actionButtonDisabled

  // params from config service.
  websiteTranslationUrl: string;
  logoLocation: string;
  debug: boolean;
  webLangAutodetect: boolean; // TODO check if really needed // after page is loaded auto detect language and change active system
  allowSuggestions: boolean;
  hidePopup: boolean;
  clientId: string;
  appId: string;

  switcherOptions: ISwitcherTranslationOptions;

  @Input() config: ITldTranslateConfig;
  @Output() onError: EventEmitter<any> = new EventEmitter<any>();

  activeSystemObj: IActiveData;
  messages: ITldTranslateMessage[] = [];

  //Progress bar
  mode: ProgressBarMode = 'determinate';
  progressValue = 0;
  showProgress = false;
  get showNoSystemsError() {
    return this.tldSystem.noSystemsError;
  }
  noSystemsError: ITldTranslateMessage = { text: 'TLD_TRANSLATE.ERROR_NO_SYSTEMS_LOADED', type: TldMessageType.ERROR };

  get actionButtonDisabled() { return this.disableButton; }

  private readonly destroy$ = new Subject();

  changeAuth(isAuth: boolean) {
    this.configService.coreConfig.isAuth = isAuth;
    this.initializeWidget();
  }

  initializeWidget(): void {
    this.tldSystem.init(this.tldSystem.getLastUsedSystem() ?? this.configService.coreConfig.defaultSystemId);
  }


  ngOnInit(): void {
    this.configService.initConfigs(this.config);

    this.initFromConfig();
    this.initializeWidget();

    this.tldSystem.getActiveData().pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$))
      .subscribe((val: IActiveData) => {
        this.activeSystemObj = val;
        if (!val) {
          return;
        }
        this.switcherOptions = {
          domains: val.domains,
          source: { code: val.sourceLang.lang, systemId: val.systemId },
          sourceLanguageList: val.sourceLangList,
          systemId: val.systemId,
          swapActive: val.swapLangActive,
          target: { code: val.targetLang.lang, systemId: val.systemId },
          targetLanguageList: val.targetLangList
        };
      });


    this.translateButtonService.getActionClick().pipe(
      takeUntil(this.destroy$))
      .subscribe(() => {
        this.translateButtonClick();
      });

    this.alerts.getMessages().pipe(
      takeUntil(this.destroy$))
      .subscribe((message: ITldTranslateMessage) => {
        if (message.type === TldMessageType.ERROR) {
          this.onError.emit(message.error);
        }
        // pushing only "one of" message in array, so screen is not spammed with messages
        const existingMessage = this.messages.find(msg => msg.text == message.text && msg.type == message.type);
        if (!existingMessage) {
          this.messages.push(message);
        }
      });

    this.translate.get('APP_NAME').pipe(
      takeUntil(this.destroy$))
      .subscribe((text: string) => {
        this.configService.coreConfig.appName = text;
      });

    window.addEventListener('message', this.receiveMessage.bind(this));
  }

  private receiveMessage(event: any) {
    // TODO add correct origin
    // if (event.origin !== "")
    // return;

    if (this.debug) {
      console.info('Message received from iframe:' + JSON.stringify(event.data));
    }


    if (event.data && event.data.message) {
      switch (event.data.message) {
        case 'ready':
          this.tldSystem.sysList.subscribe(data => {
            let systemListToIframe = [];
            data.forEach((sys, index) => {
              systemListToIframe.push({
                id: sys.id,
                sourceLanguage: sys.sourceLanguage,
                targetLanguage: sys.targetLanguage,
                name: sys.title ?? sys.id,
                order: index,
                domain: sys.domain
              });
            });

            // push system list to iframe
            this.settingSystemListForFirstTime = true;
            this.sendMessage({ message: 'setSystemList', systemList: systemListToIframe });
            if (this.activatedRoute.snapshot.queryParams.url) {
              this.sendMessage({
                message: 'loadUrl',
                url: this.activatedRoute.snapshot.queryParams.url,
                translateAfterLoad: false
              });
              this.urlToTranslate = this.activatedRoute.snapshot.queryParams.url;
            }
          })
          this.urlInputField.nativeElement.focus();

          break;
        case 'urlLoaded':
          this.showProgress = false;
          // webpage finished loading, set the full url in address box
          this.urlToTranslate = event.data.url;

          this.showTranslateBtn = true;
          this.disableButton = false;

          break;
        case 'startedLoading':
          this.mode = 'indeterminate';
          this.showProgress = true;
          this.showCancel = false;
          this.showRestore = false;
          this.showTranslateBtn = false;
          break;
        case 'stoppedLoading':
          if (!this.translating) {
            this.showCancel = false;
            this.showRestore = false;
            this.showTranslateBtn = true;
            this.disableButton = false;
          }
          break;
        case 'systemChanged':
          // set default system, right after web translation widget in iframe is loaded
          if (this.settingSystemListForFirstTime) {
            this.settingSystemListForFirstTime = false;
            this.sendMessage({ message: 'changeSystem', systemId: this.switcherOptions.systemId });
          } else {
            // if initiated by language of the loaded webpage being different
            // than source language of currently selected  system
            // we should change the system in UI and warn the user about the fact
            if (event.data.auto && event.data.changed) {
              if (this.webLangAutodetect) {
                this.systemChange(event.data.systemId);
                this.switcherOptions.systemId = event.data.systemId;

              } else {
                this.sendMessage({ message: 'changeSystem', systemId: this.switcherOptions.systemId });

              }
            }
          }

          break;
        case 'translationStarted':
          this.mode = 'determinate';
          this.progressValue = 0;
          this.showProgress = true;
          this.translating = true;

          // disable system change, show cancel button
          this.showTranslateBtn = false;
          this.showCancel = true;
          this.disableButton = true;  // to disableSystemChange

          break;
        case 'translationStopped':
          this.translating = false;
          this.showProgress = false;
          break;
        case 'translated':
          // show restore button
          this.showRestore = true;
          this.showCancel = false;
          break;
        case 'untranslated':
          // enable system change, show translate button
          this.disableButton = false;
          this.showRestore = false;
          this.showCancel = false;
          this.showTranslateBtn = true;
          break;
        case 'progress':
          this.progressValue = event.data.progress;
          break;
        case 'error':
          // enable system change, show translate button
          this.disableButton = false;
          this.showRestore = false;
          this.showCancel = false;
          this.showTranslateBtn = true;
          if (console) {
            console.error(event.data.description);
          }

          break;
        case 'warning':
          if (console) {
            console.warn(event.data.description);
          }
          break;
        default:
          break;
      }
    }

  }

  private sendMessage(message: any): void {
    if (this.debug) {
      console.info('Message sent to iframe:' + JSON.stringify(message));
    }
    if (this.iframe.nativeElement.contentWindow) {
      this.iframe.nativeElement.contentWindow.postMessage(message, window.location.origin);
    }
  }

  removeMessage(ix: number) {
    this.messages.splice(ix, 1);
  }

  swapLanguages() {
    this.tldSystem.swapSystemLanguages();

    const sys = this.tldSystem.getActiveSystemObj();
    this.sendMessage({ message: 'changeSystem', systemId: sys.id });
  }

  systemChange(systemId: string) {
    this.tldSystem.changeSystem(systemId);

    this.sendMessage({ message: 'changeSystem', systemId });
  }

  sourceLanguageChange(language: string) {
    this.tldSystem.changeLanguage(language, this.switcherOptions.target.code);

    const sys = this.tldSystem.getActiveSystemObj();
    this.sendMessage({ message: 'changeSystem', systemId: sys.id });
  }

  targetLanguageChange(language: string) {
    this.tldSystem.changeLanguage(this.switcherOptions.source.code, language);

    const sys = this.tldSystem.getActiveSystemObj();
    this.sendMessage({ message: 'changeSystem', systemId: sys.id });
  }

  translateButtonClick() {
    if (this.urlToTranslate != '') {
      this.sendMessage({
        message: 'loadUrl',
        url: this.urlToTranslate,
        translateAfterLoad: true
      });
    }

  }

  loadButtonClicked() {
    if (this.urlToTranslate != '') {
      this.sendMessage({
        message: 'loadUrl',
        url: this.urlToTranslate,
        translateAfterLoad: false
      });
    }
  }

  cancel(): void {
    this.sendMessage({ message: 'untranslate' });
  }

  restore(): void {
    this.sendMessage({ message: 'untranslate' });
  }

  private initFromConfig() {
    const coreConfig = this.configService.coreConfig;
    const webtranslateConfig = this.configService.webtranslateConfig;
    this.websiteTranslationUrl = webtranslateConfig.websiteTranslationUrl;
    this.logoLocation = webtranslateConfig.logoLocation;
    this.debug = webtranslateConfig.debug;
    this.webLangAutodetect = webtranslateConfig.webLangAutodetect; // after page is loaded auto detect language and change active system
    this.allowSuggestions = webtranslateConfig.allowSuggestions;
    this.hidePopup = webtranslateConfig.hidePopup;

    webtranslateConfig.websiteTranslationUrl.indexOf('returnUrl') > -1 ?
      this.addExtraParamsToUrl("%26", '%3f', '%3d') : this.addExtraParamsToUrl();
  }

  goToHome(): void {
    this.router.navigateByUrl('');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.iframe.nativeElement.src = this.websiteTranslationUrl;
  }

  private addExtraParamsToUrl(andSymbol = "&", questionMarkSymbol = '?', equalitySignSymbol = "=") {
    const webtranslateConfig = this.configService.webtranslateConfig;

    let extraParams = '';
    if (webtranslateConfig.websiteTranslationUrl.indexOf(questionMarkSymbol) > -1) {
      extraParams += andSymbol;
    } else {
      extraParams += questionMarkSymbol;
    }

    extraParams += 'appId' + equalitySignSymbol + this.appId;
    extraParams += andSymbol + 'translationServiceUrl' + equalitySignSymbol + encodeURIComponent(this.configService.apiV2Config.translationUrl);

    if (webtranslateConfig.translatePagePath) {
      extraParams += andSymbol + 'framePath' + equalitySignSymbol + encodeURIComponent(webtranslateConfig.translatePagePath);
    }
    if (webtranslateConfig.allowSuggestions) {
      extraParams += andSymbol + 'allowSuggestions' + equalitySignSymbol + true;
    }
    if (webtranslateConfig.hidePopup) {
      extraParams += andSymbol + 'hidePopup' + equalitySignSymbol + true;
    }
    this.websiteTranslationUrl += extraParams;
  }
}
