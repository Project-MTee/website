import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebEmbeddedComponent } from './web-embedded/web-embedded.component';
import { TldTranslateWebsiteComponent } from './tld-translate-web/tld-translate-web.component';
import { TldTooltipModule } from '../tld-tooltip/tld-tooltip.module';
import { TldCommonModule } from '../tld-common/tld-common.module';
import { MaterialModule } from '../material.module';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [WebEmbeddedComponent, TldTranslateWebsiteComponent],
  imports: [
    CommonModule,
    TranslateModule,
    TldTooltipModule,
    TldCommonModule,
    MaterialModule,
    FormsModule
  ],
  exports: [
    TldTranslateWebsiteComponent
  ]
})
export class TldWebModule { }
