import { Component, OnInit } from '@angular/core';
import { ITldTranslateCoreConfig, ITldTranslateFileConfig, ITldTranslateTextConfig } from 'tld-translate/lib/modules/tld-common/models';

@Component({
  selector: 'app-translate',
  templateUrl: './translate.component.html',
  styleUrls: ['./translate.component.scss']
})
export class TranslateComponent implements OnInit {
  coreConfig: ITldTranslateCoreConfig = {
    appId: "TildeMT|Website|EEMT",
    clientId: "u-c0f0199e-989a-4fcf-ae35-5d7c628a267f",
    loadLanguageFilesManually: false,
    appName: "Translator",
    hideAchievement: true
  }
  fileConfig: ITldTranslateFileConfig = {
    allowedFileTypes: [".docx", ".xls", ".odt", ".tmx", ".pptx", ".txt"],
    allowedFileTypesAuthUser: [".docx", ".xls", ".odt", ".tmx", ".pptx", ".txt"]
  }
  textConfig: ITldTranslateTextConfig = {
    showAvailableExtensions: false
  }

  constructor() { }

  ngOnInit(): void {
  }

}
