import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { routes } from './pages/pages.routes';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { I18NModule } from './framework/i18n/i18n.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AppTranslationsLoader } from './framework/i18n/app-translations.loader';
import { MaterialModule } from './shared/material.module';
import { TldTranslateModule } from 'tld-translate';
import { PagesModule } from './pages/pages.module';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent
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
        useFactory: AppTranslationsLoader,
        deps: [HttpClient]
      }]),
    MaterialModule,
    PagesModule,
    TldTranslateModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
