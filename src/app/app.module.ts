import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { routes } from './pages/pages.routes';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { I18NModule } from './framework/i18n/i18n.module';
import { TranslateLoader } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AppTranslationsLoader } from './framework/i18n/app-translations.loader';
import { MaterialModule } from './shared/material.module';
import { PagesModule } from './pages/pages.module';
import { ConfigService } from './shared/services/config.service';
import { MainComponent } from './layout/main/main.component';
import { TldTranslateService } from './libs/tld-translate/services';
import { TldTranslateModule } from './libs/tld-translate/tld-translate.module';

export function loadConfigFactory(config: ConfigService) {
  return () => config.load().toPromise();
}

export function AppTranslationLoaderFactory(http: HttpClient, tldTranslate: TldTranslateService) {
  return new AppTranslationsLoader(http, tldTranslate);
}


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    MainComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    BrowserAnimationsModule,
    FlexLayoutModule,
    HttpClientModule,
    I18NModule.forRoot([
     {
        provide: TranslateLoader,
        useFactory: AppTranslationLoaderFactory,
        deps: [HttpClient, TldTranslateService]
      }]),
    MaterialModule,
    PagesModule,
    TldTranslateModule
  ],
  providers: [{
    provide: APP_INITIALIZER,
    useFactory: loadConfigFactory,
    deps: [ConfigService],
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
