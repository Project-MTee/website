import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TldTranslateFileComponent } from './tld-translate-file/tld-translate-file.component';
import { TldCommonModule } from '../tld-common/tld-common.module';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from '../material.module';
import { TldTranslateFileDownloadButtonComponent } from './download-button/download-button.component';



@NgModule({
  declarations: [TldTranslateFileComponent, TldTranslateFileDownloadButtonComponent],
  imports: [
    CommonModule,
    TldCommonModule,
    TranslateModule,
    FlexLayoutModule,
    MaterialModule
  ],
  exports: [TldTranslateFileComponent, TldTranslateFileDownloadButtonComponent]
})
export class TldDocumentModule { }
