import { Injectable } from '@angular/core';
import { availableLanguages } from '../i18n/available-languages';

@Injectable({
  providedIn: 'root'
})
export class TldTranslateService {
  getTranslations(languageCode: string) {
    return availableLanguages[languageCode] ?? {};
  }
}
