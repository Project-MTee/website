import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../material.module';
import { TldCloseButtonComponent } from './components/close-button/close-button.component';
import { TldOpenCloseButtonComponent } from './components/open-close-button/open-close-button.component';
import { TldFileUploadComponent } from './components/tld-file-upload/tld-file-upload.component';
import { TldLangListComponent } from './components/tld-lang-list/tld-lang-list.component';
import { TldListMenuComponent } from './components/tld-list-menu/tld-list-menu.component';
import { TldLoaderComponent } from './components/tld-loader/tld-loader.component';
import { TldMessageComponent } from './components/tld-message/tld-message.component';
import { TldTranslateButtonComponent } from './components/translate-button/translate-button.component';
import { DragAndDropDirective } from './directives/drag-and-drop.directive';


@NgModule({
  declarations: [TldCloseButtonComponent,
    TldFileUploadComponent,
    DragAndDropDirective,
    TldLangListComponent,
    TldLoaderComponent,
    TldMessageComponent,
    TldTranslateButtonComponent,
    TldOpenCloseButtonComponent,
    TldListMenuComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    MaterialModule,
    TranslateModule
  ],
  exports: [
    TldCloseButtonComponent,
    TldFileUploadComponent,
    DragAndDropDirective,
    TldLangListComponent,
    TldLoaderComponent,
    TldMessageComponent,
    TldTranslateButtonComponent,
    TldOpenCloseButtonComponent,
    TldListMenuComponent
  ]
})
export class TldCommonModule { }
