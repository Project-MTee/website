import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AboutComponent } from './about/about.component';
import { TermsComponent } from './terms/terms.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { TranslateComponent } from './translate/translate.component';
import { TldTranslateModule } from 'tld-translate';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from '../shared/material.module';
import { WebTranslateComponent } from './web-translate/web-translate.component';



@NgModule({
  declarations: [
    AboutComponent,
    TermsComponent,
    PrivacyComponent,
    TranslateComponent,
    WebTranslateComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    HttpClientModule,
    MaterialModule,
    TldTranslateModule
  ]
})
export class PagesModule { }
