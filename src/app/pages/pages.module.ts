import { NgModule } from '@angular/core';
import { AboutComponent } from './about/about.component';
import { TranslateComponent } from './translate/translate.component';
import { TldTranslateModule, TldWebModule } from 'tld-translate';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from '../shared/material.module';
import { WebTranslateComponent } from './web-translate/web-translate.component';
import { WebtranslateDisclaimerComponent } from './web-translate/webtranslate-disclaimer/webtranslate-disclaimer.component';
import { TranslateModule } from '@ngx-translate/core';
import { DataProtectionConditionsComponent } from './data-protection-conditions/data-protection-conditions.component';



@NgModule({
  declarations: [
    AboutComponent,
    TranslateComponent,
    WebTranslateComponent,
    WebtranslateDisclaimerComponent,
    DataProtectionConditionsComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    HttpClientModule,
    MaterialModule,
    TldTranslateModule,
    TldWebModule,
    TranslateModule
  ]
})
export class PagesModule { }
