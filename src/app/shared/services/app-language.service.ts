import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class AppLanguageService {

  get currentLanguage() { return this.translate.currentLang; }

  private readonly localStorageKey = "uiLanguage";
  private readonly defaultLanguage = "en";

  constructor(private readonly translate: TranslateService) { }

  init() {
    this.translate.setDefaultLang(this.defaultLanguage);
    this.translate.use(localStorage.getItem(this.localStorageKey) ?? this.defaultLanguage);
  }

  setLanguage(code: string) {
    this.translate.use(code);
    localStorage.setItem(this.localStorageKey, code);
  }
}
