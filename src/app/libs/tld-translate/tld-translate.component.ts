import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { AudioRecordService, TldVoiceInputService } from './modules/tld-audio/services';
import { TldTranslateButtonService } from './modules/tld-common/components/translate-button/tld-translate-button.service';
import { IAuthOptions, ITldTranslateConfig, ITldTranslateMessage, TldMessageType } from './modules/tld-common/models';
import { TldAlertService, TldTranslateConfigService } from './modules/tld-common/services';
import { TldTranslateFileService } from './modules/tld-document/services/tld-translate-file.service';
import { TldTranslateTextService } from './modules/tld-text/services/tld-translate-text.service';
import { IActiveData } from './modules/tld-tooltip/models/active-data.model';
import { ISwitcherTranslationOptions } from './modules/tld-tooltip/models/switcher-options.model';
import { TldSystemService } from './modules/tld-tooltip/services/tld-system.service';
import { TldTranslateBodyComponent } from './tld-translate-body/tld-translate-body.component';

@Component({
  selector: 'tld-translate',
  templateUrl: './tld-translate.component.html',
  styleUrls: ['./tld-translate.component.scss'],
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
export class TldTranslateComponent implements OnInit, OnDestroy {

  @Input() config: ITldTranslateConfig;
  @Output() onError: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild(TldTranslateBodyComponent) tldTranslateBody: TldTranslateBodyComponent;

  activeSystemObj: IActiveData;
  messages: ITldTranslateMessage[] = [];

  switcherOptions: ISwitcherTranslationOptions;

  get showNoSystemsError() {
    return this.tldSystem.noSystemsError;
  }
  noSystemsError: ITldTranslateMessage = { text: "TLD_TRANSLATE.ERROR_NO_SYSTEMS_LOADED", type: TldMessageType.ERROR };

  get actionButtonDisabled() {
    return this.translateFileService.translationStarted
      || this.translateFileService.isUploadingFile
      || this.audioService.isRecording
      || this.voiceProcessingService.isProcessing
  }

  // private get widgetInitialized() {
  //   return this.tldSystem.widgetInitialized;
  // };
  private readonly destroy$ = new Subject();

  constructor(private readonly translate: TranslateService,
    private readonly translateFileService: TldTranslateFileService,
    private readonly translateTextService: TldTranslateTextService,
    private readonly configService: TldTranslateConfigService,
    private readonly alerts: TldAlertService,
    private readonly translateButtonService: TldTranslateButtonService,
    private readonly tldSystem: TldSystemService,
    private readonly audioService: AudioRecordService,
    private readonly voiceProcessingService: TldVoiceInputService
  ) {}

  changeAuth(authOptions: IAuthOptions) {
    this.configService.coreConfig.isAuth = authOptions.isAuth;
    this.translateFileService.clear();
    this.initializeWidget();
  }

  initializeWidget(): void {
    this.tldSystem.init(this.tldSystem.getLastUsedSystem() ?? this.configService.coreConfig.defaultSystemId);
  }

  ngOnInit() {
    this.configService.initConfigs(this.config);

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

    this.translateTextService.manualSourceChange.pipe(
      takeUntil(this.destroy$))
      .subscribe((event) => {
        if (event.swapSystems) {
          this.swapLanguages();
        }
      });

    this.translateButtonService.getActionClick().pipe(
      takeUntil(this.destroy$))
      .subscribe(() => {
        this.translateButtonClick();
      });

    //this.translate.onLangChange.pipe(
    //  takeUntil(this.destroy$))
    //  .subscribe((language: LangChangeEvent) => {
    //    this.changeSystemTranslations();
    //    this.tldLangService.setLanguage(language.lang).subscribe();
    //  });

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

    if (this.configService.coreConfig.translateAppName) {
      this.translate.get("APP_NAME").pipe(
        takeUntil(this.destroy$))
        .subscribe((text: string) => {
          this.configService.coreConfig.appName = text;
        });
    }
  }

  removeMessage(ix: number) {
    this.messages.splice(ix, 1);
  }

  swapLanguages() {
    this.tldSystem.swapSystemLanguages();
  }

  sourceLanguageChange(language: string) {
    this.tldSystem.changeLanguage(language, this.switcherOptions.target.code);
  }

  systemChange(systemId: string) {
    this.tldSystem.changeSystem(systemId);
  }

  targetLanguageChange(language: string) {
    this.tldSystem.changeLanguage(this.switcherOptions.source.code, language);
  }

  translateButtonClick() {
    if (this.translateFileService.translationFiles?.length > 0) {
      this.translateFileService.translateButtonClick(this.activeSystemObj);
    }
    else {
      this.translateTextService.onTranslateButtonClick();
    }
  }

  // private changeSystemTranslations() {
  //   if (this.widgetInitialized) {
  //     this.tldSystem.sortSystems();
  //   }
  // }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
