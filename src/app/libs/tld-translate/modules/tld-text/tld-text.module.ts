import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../material.module';
import { TldAudioModule } from '../tld-audio';
import { TldCommonModule } from '../tld-common/tld-common.module';
import { HighlightTreeComponent } from './components/highlight-tree/highlight-tree.component';
import { TextareaWithBackgroundComponent } from './components/textarea-with-background/textarea-with-background.component';
import { TldTranslateSourceComponent } from './components/tld-translate-source/tld-translate-source.component';
import { TldTranslateTextComponent } from './components/tld-translate-text/tld-translate-text.component';



@NgModule({
  declarations: [TldTranslateSourceComponent,
    TldTranslateTextComponent,
    TextareaWithBackgroundComponent,
    HighlightTreeComponent],
  imports: [
    CommonModule,
    TranslateModule,
    MaterialModule,
    FormsModule,
    TldCommonModule,
    ClipboardModule,
    TldAudioModule
  ],
  exports: [
    TldTranslateSourceComponent,
    TldTranslateTextComponent]
})
export class TldTextModule { }
