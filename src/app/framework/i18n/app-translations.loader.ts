import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TldTranslateService } from 'tld-translate';

export class AppTranslationsLoader implements TranslateLoader {
  constructor(private readonly http: HttpClient, private readonly tldTranslate: TldTranslateService) { }
  getTranslation(languageCode: string): Observable<any> {
    const requests = [this.http.get(`/assets/i18n/${languageCode}.json`)];
    return forkJoin(requests).pipe(
      map(data => {
        let res = this.tldTranslate.getTranslations(languageCode);
        data.forEach(obj => {
          res = this.mergeDeep(res, obj);
        });
        return res;
      })
    );
  }

  private mergeDeep(target: any, source: any) {
    const output = { ...target };
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this.mergeDeep(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  }

  private isObject(item: any) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }
}
