import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TldTranslateSwitcherComponent } from './tld-translate-switcher/tld-translate-switcher.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from '../material.module';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserModule } from '@angular/platform-browser';
import { TldCommonModule } from '../tld-common';
import { FormsModule } from '@angular/forms';
import { TldDomainListComponent } from './tld-domain-list/tld-domain-list.component';



@NgModule({
  declarations: [
    TldTranslateSwitcherComponent,
    TldDomainListComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    BrowserModule,
    FlexLayoutModule,
    MaterialModule,
    TranslateModule,
    TldCommonModule
  ],
  exports: [
    TldTranslateSwitcherComponent,
    TldDomainListComponent
  ]
})
export class TldTooltipModule { }
