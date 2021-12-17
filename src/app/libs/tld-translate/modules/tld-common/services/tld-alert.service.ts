import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { availableLanguages } from '../../../i18n/available-languages';
import { ITldTranslateMessage, TldMessageType } from '../models';
import { TldTranslateConfigService } from './tld-translate-config.service';

@Injectable({
  providedIn: 'root'
})
export class TldAlertService {

  constructor(private readonly config: TldTranslateConfigService) { }

  private messageSubject: Subject<ITldTranslateMessage> = new Subject();
  private get defaultParams() {
    return { email: this.config.coreConfig.supportEmail };
  }
  private readonly errorKey = "ERRORS.";
  private readonly numericErrorKeyPrefix = "E_";
  private readonly errorTranslationSubKeys = ["FILE_TRANSLATION_SUBSTATUS"];

  defaultError(error?: any) {

    if (error) {
      console.error(error);
    }
    this.error(`${this.errorKey}ERROR_DEFAULT`, error, this.defaultParams);
  }

  getMessages() {
    return this.messageSubject.asObservable();
  }

  info(text: string, params?: any) {
    this.emit({ text: text, type: TldMessageType.SUCCESS, params: params })
  }

  error(text: string, error: any, params?: any) {
    this.emit({ text: text, type: TldMessageType.ERROR, error: error, params: params })
  }

  warning(text: string, params?: any) {
    this.emit({ text: text, type: TldMessageType.WARNING, params: params ?? this.defaultParams })
  }

  unhandeledError(error: any, params?: any) {
    if (error) {
      let errorKey = null;
      const errorTranslations = availableLanguages.en.ERRORS;
      if(error instanceof HttpErrorResponse && errorTranslations[this.numericErrorKeyPrefix+error.status]){
        errorKey = this.numericErrorKeyPrefix+error.status;
      }
      else if (errorTranslations[error.ErrorCode]) {
        errorKey = error.ErrorCode;
      }
      else if (errorTranslations[this.numericErrorKeyPrefix + error.ErrorCode]) {
        errorKey = this.numericErrorKeyPrefix + error.ErrorCode;
      }
      else if (errorTranslations[error.error?.ErrorCode]) {
        errorKey = error.error?.ErrorCode;
      }
      else if (errorTranslations[this.numericErrorKeyPrefix + error.error?.ErrorCode]) {
        errorKey = this.numericErrorKeyPrefix + error.error?.ErrorCode
      }

      if (!errorKey) {
        for (let i = 0; i < this.errorTranslationSubKeys.length; i++) {
          const subKey = this.errorTranslationSubKeys[i];
          const element = errorTranslations[subKey];
          if (element[error.ErrorCode]) {
            errorKey = `${subKey}.${error.ErrorCode}`;
            break;
          }
        }
      }


      if (errorKey) {
        this.error(this.errorKey + errorKey, error, params ?? this.defaultParams);
        return;
      }
    }
    this.defaultError(error);
  }

  private emit(message: ITldTranslateMessage) {
    this.messageSubject.next(message);
  }
}
