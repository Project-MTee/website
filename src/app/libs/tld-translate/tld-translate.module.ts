import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TldTranslateErrorHandler } from './ErrorHandler';
import { MaterialModule } from './modules/material.module';
import { TldCommonModule } from './modules/tld-common';
import { TldDocumentModule } from './modules/tld-document';
import { TldTextModule } from './modules/tld-text';
import { TldTooltipModule } from './modules/tld-tooltip';
import { TldTranslateBodyComponent } from './tld-translate-body/tld-translate-body.component';
import { TldTranslateComponent } from './tld-translate.component';


@NgModule({
  declarations: [
    TldTranslateBodyComponent,
    TldTranslateComponent,
  ],
  imports: [CommonModule,
    MaterialModule,
    TranslateModule.forChild(),
    FormsModule,
    HttpClientModule,
    ClipboardModule,
    TldCommonModule,
    TldTextModule,
    TldDocumentModule,
    TldTooltipModule
  ],
  exports: [
    TldTranslateComponent
  ],
  providers: [
    { provide: ErrorHandler, useClass: TldTranslateErrorHandler },
  ],
})
export class TldTranslateModule {
}


