import { HttpClient } from '@angular/common/http';
import { take, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { IAppConfig } from '../models/app-config';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  private _appConfig!: IAppConfig;

  get appConfig(): IAppConfig {
    return this._appConfig;
  }

  get isConfigLoaded(): boolean {
    return this.appConfig ? true : false;
  }

  constructor(private readonly http: HttpClient) {
  }

  load() {
    return this.reloadSettings();
  }

  private reloadSettings() {
    return this.http.get<IAppConfig>("assets/config.json").pipe(
      take(1),
      tap(config => this._appConfig = config)
    );
  }
}
