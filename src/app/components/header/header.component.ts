import { Component, OnInit } from '@angular/core';
import { AppLanguageService } from '../../shared/services/app-language.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  get currentLanguage() { return this.appLanguage.currentLanguage; };
  readonly availableLanguages = ["en", "et", "de", "ru"];

  constructor(private readonly appLanguage: AppLanguageService) { }

  useLanguage(code: string) {
    this.appLanguage.setLanguage(code);
  }

}
