import { Component, OnInit } from '@angular/core';
import { ITldTranslateCoreConfig } from 'tld-translate/lib/modules/tld-common/models';

@Component({
  selector: 'app-translate',
  templateUrl: './translate.component.html',
  styleUrls: ['./translate.component.scss']
})
export class TranslateComponent implements OnInit {
  coreConfig: ITldTranslateCoreConfig = {
    appId: "TildeMT|Web",
    clientId: "u-6c2a15a4-a048-46dd-861e-5c70d87313c1",
    loadLanguageFilesManually: false,
    appName: "Translator"
  }

  constructor() { }

  ngOnInit(): void {
  }

}
