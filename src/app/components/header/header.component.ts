import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatMenu } from '@angular/material/menu';
import { AppLanguageService } from '../../shared/services/app-language.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @ViewChild("i18nMenu") menu!: MatMenu;

  get currentLanguage() { return this.appLanguage.currentLanguage; };
  readonly availableLanguages = ["en", "et", "de", "ru"];

  constructor(private readonly appLanguage: AppLanguageService,
    @Inject(DOCUMENT) private readonly document: Document
  ) { }

  ngOnInit() {
    this.useLanguage(this.currentLanguage);
  }

  useLanguage(code: string) {
    this.appLanguage.setLanguage(code);
    this.document.documentElement.lang = code;
  }

  onMenuOpen() {
    if (this.menu) {
      const panel = document.getElementById(this.menu.panelId);
      panel?.setAttribute("data-test-id", "ui-language-menu");
    }
  }
}
