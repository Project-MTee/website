import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ISystem, ISystemBase, System } from '../../../tld-common/models/services/system/system.model';
import { TldTranslateConfigService } from '../../../tld-common/services';
import { IGetLanguageDirection } from './models/get-langauge-direction';
import { ILanguageDirection } from './models/language-direction.model';

@Injectable({
  providedIn: 'root'
})
export class TldSystemApiV2Service {

  constructor(private readonly config: TldTranslateConfigService,
    private readonly http: HttpClient) { }

  getSystemList(): Observable<ISystem[]> {
    return this.http.get<IGetLanguageDirection>(this.config?.apiV2Config?.systemListUrl).pipe(
      map((response) => {
        const systems = [];
        const uniqueDirections: string[] = [];
        const autoDomainSystems: ISystem[] = [];
        response.languageDirections.forEach(
          (system) => {
            const languageDirections = `${system.srcLang}-${system.trgLang}`;
            systems.push(new System(this.createSystemFromLanguageDirection(system)));

            if (!uniqueDirections.includes(languageDirections)) {
              uniqueDirections.push(languageDirections);
              const autoDomainSystemBase = this.createSystemFromLanguageDirection(system);
              autoDomainSystemBase.domain = null;
              autoDomainSystemBase.id = languageDirections;
              autoDomainSystems.push(new System(autoDomainSystemBase));
            }
          }
        );
        return autoDomainSystems.concat(systems);
      })
    );
  }

  private createSystemFromLanguageDirection(direction: ILanguageDirection) {
    const systemBase: ISystemBase = {
      sourceLanguage: direction.srcLang,
      targetLanguage: direction.trgLang,
      domain: direction.domain,
      id: `${direction.srcLang}-${direction.trgLang}-${direction.domain}`
    }

    return systemBase;
  }
}
