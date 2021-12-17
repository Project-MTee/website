import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { TldRecordComponent } from './tld-record/tld-record.component';


@NgModule({
  declarations: [TldRecordComponent],
  imports: [
    CommonModule,
    TranslateModule,
    MatTooltipModule,
    MatIconModule,
    FlexLayoutModule,
    MatButtonModule
  ],
  exports: [TldRecordComponent]
})
export class TldAudioModule { }
