import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { ILangListItem, ISystem } from '../../tld-common/models';
import { IActiveData } from '../models/active-data.model';
import { IDomain } from '../models/domain.model';
import { TldSystemApiV2Service } from './api-v2/tld-system-api-v2.service';

@Injectable({
  providedIn: 'root'
})
export class TldSystemService {
  noSystemsError = false;
  systems: ISystem[] = [];
  widgetInitialized = false;
  sysList = new ReplaySubject<ISystem[]>(1);
  activeDomain: IDomain;

  private activeSystem: ISystem;
  private domains: IDomain[] = [];
  private sourceLanguage: string;
  private targetLanguage: string;
  private sourceLangList: ILangListItem[] = [];
  private targetLangList: ILangListItem[] = [];
  private readonly active: BehaviorSubject<IActiveData> = new BehaviorSubject<IActiveData>(null);
  private readonly lastUsedSystemKey: string = "lastUsedSystem";
  private readonly defaultLanguageOrder: string[] = ["bg", "cs", "da", "de", "el", "en", "es", "et", "fi",
    "fr", "ga", "hr", "hu", "is", "it", "lt", "lv", "mt", "nb", "nl", "pl", "pt", "ro", "sk", "sl", "sv"];

  constructor(private readonly api: TldSystemApiV2Service) {
  }

  getSystems(): ISystem[] {
    return this.systems;
  }

  changeLanguage(source: string, target: string) {
    const systemId = this.findCorrectSystem(source, target);
    this.changeSystem(systemId);
  }

  getActiveData() {
    return this.active.asObservable();
  }

  getActiveSystemObj(): ISystem {
    return this.activeSystem;
  }

  getActiveVendorsAndDomains() {
    if (!this.sourceLanguage || !this.targetLanguage) {
      return;
    }
    const domains: IDomain[] = [];

    for (var i = 0; i < this.systems.length; i++) {
      const system = this.systems[i];
      if (!(system.sourceLanguage === this.sourceLanguage && system.targetLanguage === this.targetLanguage)) {
        continue;
      }
      const domain: IDomain = {
        domain: system.id,
        title: system.domain
      };
      domains.push(domain);

      if (domain.domain === this.activeSystem.id) {
        this.activeDomain = domain;
      }
    }

    this.domains = domains;
  }


  getLastUsedSystem(): string {
    return localStorage.getItem(this.lastUsedSystemKey);
  }

  getUniqueLanguages(list: ILangListItem[]): string[] {
    if (!list) {
      return [];
    }
    const titles: string[] = [];

    list.forEach((lang) => {
      const langTitle = lang.lang;
      const ix = titles.indexOf(langTitle);
      if (ix == -1) {
        titles.push(langTitle);
      }
    });

    return titles;
  }

  init(defaultSystemId: string) {
    this.api.getSystemList().subscribe((res: ISystem[]) => {
      this.systems = res;
      if (res.length == 0) {
        this.noSystemsError = true;
      }

      if (!this.systemExists(defaultSystemId, this.systems)) {
        defaultSystemId = this.systems[0].id;
      }

      this.sourceLangList = this.createLangList(this.systems);
      this.changeSystem(defaultSystemId);
      this.widgetInitialized = true;
      this.sysList.next(this.systems);
    });
  }

  setLastUsedSystem(systemId: string) {
    return localStorage.setItem(this.lastUsedSystemKey, systemId);
  }

  swapSystemLanguages() {
    this.changeLanguage(this.targetLanguage, this.sourceLanguage);
  }

  changeSystem(systemId: string, retranslate = true) {
    if (this.activeSystem?.id === systemId) {
      return;
    }

    let selectedSystem: ISystem;
    for (const system of this.systems) {
      if (system.id === systemId) {
        selectedSystem = system;
        break;
      }
    }
    this.targetLangList = this.createLangList(this.systems, selectedSystem.sourceLanguage);
    this.targetLanguage = selectedSystem.targetLanguage;
    this.sourceLanguage = selectedSystem.sourceLanguage;
    this.activeSystem = selectedSystem;
    this.getActiveVendorsAndDomains();

    this.onActiveSystemChange(retranslate);

    this.setLastUsedSystem(selectedSystem.id);
  }

  systemExists(systemId: string, systemList: ISystem[]): boolean {
    const systems = systemList ?? this.systems;
    for (var system of systems) {
      if (system.id === systemId) {
        return true;
      }
    }

    return false;
  }


  //TODO
  sortSystems(languageOrder?: string[], source?: boolean) {
    return;
    if (!languageOrder) {
      languageOrder = this.defaultLanguageOrder;
    }

    this.systems.sort(
      (a, b) => {
        const aCode = source ? a.sourceLanguage : a.targetLanguage;
        const bCode = source ? b.sourceLanguage : b.targetLanguage;

        const aIx = languageOrder.indexOf(aCode);
        const bIx = languageOrder.indexOf(bCode);

        // if any of indexes not in array, it goes to end
        if (aIx < 0) {
          return 1;
        } else if (bIx < 0) {
          return -1;
        }
        return languageOrder.indexOf(aCode) < languageOrder.indexOf(bCode) ? -1 : 1
      }
    )
  }


  private canSwapSystemLanguages(): boolean {
    let langSwapActive = false;
    for (var i = 0; i < this.systems.length; i++) {
      const system = this.systems[i];
      if (system.sourceLanguage == this.targetLanguage && system.targetLanguage == this.sourceLanguage) {
        langSwapActive = true;
        break;
      }
    }
    return langSwapActive;
  }

  private createLangList(systems: ISystem[], srcLangCode?: string) {
    const langListItemArray: ILangListItem[] = [];
    systems.forEach((system) => {
      if (!srcLangCode || srcLangCode === system.sourceLanguage) {
        langListItemArray.push(
          {
            domain: system.domain,
            lang: srcLangCode ? system.targetLanguage : system.sourceLanguage,
            systemId: system.id,
          }
        );
      }
    })
    return langListItemArray;
  }

  private findCorrectSystem(sourceLanguage: string, targetLanguage: string): string {
    const systems = this.systems;
    let selectedSystem: ISystem;
    for (var i = 0; i < systems.length; i++) {
      const system = systems[i];

      if ((system.sourceLanguage === sourceLanguage && system.targetLanguage === targetLanguage)) {
        selectedSystem = system;
        break;
      }
      else if (!selectedSystem && system.sourceLanguage == sourceLanguage) {
        selectedSystem = system;
      }
    }
    return selectedSystem.id;
  }

  private onActiveSystemChange(retranslate = true) {
    const system: ISystem = this.activeSystem;
    this.active.next({
      sourceLang: {
        lang: this.sourceLanguage,
        domain: system.domain,
        systemId: system.id,
      },
      sourceLangList: this.sourceLangList,
      systemId: system.id,
      targetLang: {
        domain: system.domain,
        systemId: system.id,
        lang: this.targetLanguage
      },
      targetLangList: this.targetLangList,
      domains: { active: this.activeDomain, domains: this.domains },
      swapLangActive: this.canSwapSystemLanguages(),
      system: system,
      retranslate: retranslate
    });
  }

  //private sortSystemList(systemList: ISystem[]) {
  //  const currentLanguage = this.translate.currentLang;
  //  const sourceLanguageOrder = this.config.coreConfig.sourceLanguageOrder[currentLanguage] ?? this.defaultLanguageOrder;
  //  const targetLanguageOrder = this.config.coreConfig.targetLanguageOrder[currentLanguage] ?? this.defaultLanguageOrder;
  //  systemList.forEach((system: ISystem) => {
  //    let sourceIndex = -1;
  //    let targetIndex = -1;

  //    for (let langIndex = 0; langIndex < sourceLanguageOrder.length; langIndex++) {
  //      if (sourceLanguageOrder[langIndex] === system.SourceLanguage.Code) {
  //        sourceIndex = langIndex;
  //      }
  //    }

  //    for (let langIndex = 0; langIndex < targetLanguageOrder.length; langIndex++) {
  //      if (targetLanguageOrder[langIndex] === system.TargetLanguage.Code) {
  //        targetIndex = langIndex;
  //      }
  //    }

  //    system.order = 0;
  //    if (sourceIndex > -1) {
  //      system.order = system.order + sourceIndex * 100;
  //    }
  //    if (targetIndex > -1) {
  //      system.order = system.order + targetIndex;
  //    }
  //  });

  //  systemList.sort((a, b) => {
  //    console.log(a.order);
  //    if (typeof (b.order) !== "undefined" && b.order !== null) {
  //      return a.order > b.order ? 1 : -1;
  //    } else {
  //      return -1;
  //    }
  //  });
  //}

}
