import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { MatMenu } from '@angular/material/menu';
import { Subject } from 'rxjs';
import { ILangListItem, ILanguageWithTranslation, ISelectedLanguage } from '../../models';
import { TldOpenCloseButtonComponent } from '../open-close-button/open-close-button.component';

@Component({
  selector: 'tld-lang-list',
  templateUrl: './tld-lang-list.component.html',
  styleUrls: ['./tld-lang-list.component.scss']
})
export class TldLangListComponent implements OnDestroy {
  //available only after view initialized
  @ViewChild("wrapper") wrapper: ElementRef;
  @ViewChild(MatMenu) menu: MatMenu;
  @ViewChild(TldOpenCloseButtonComponent) openCloseButton: TldOpenCloseButtonComponent;

  //Inputs
  @Input() disabled: boolean;
  @Input() pxPerLanguage: number = 100;

  @Input() set languages(languageList: ILangListItem[]) {
    setTimeout(() => {
      this.languageList = languageList || [];
      this.recreateLanguageLists();
    }, 0)

  };

  /** Id for panel class. For testing purposes. */
  @Input() testId: string;

  private _selected: ISelectedLanguage;
  @Input() set selected(val: ISelectedLanguage) {
    this._selected = val;
    this.ensureSelectedIsVisible();
  };
  get selected() { return this._selected; }

  get firstVisible() {
    return this.visibleLanguageList?.[0];
  }
  //Outputs
  @Output() onLanguageChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() onDomainChange: EventEmitter<string> = new EventEmitter<string>();

  //public variables
  menuLanguageList: ILanguageWithTranslation[] = [];
  visibleLanguageList: ILanguageWithTranslation[] = [];

  readonly menuTriggerAriaCode = "ARIA_LABELS.OTHER_LANGUAGES_TRIGGER";
  readonly languageLocalizationKey = "LANGUAGES."
  //Private variables and their accessors
  //necessary because domain name will show next to language if multiple domains available
  private duplicateCodes: string[] = [];
  private languageList: ILangListItem[] = [];

  private readonly destroy$ = new Subject();

  constructor() {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onMenuOpen() {
    if (this.testId) {
      const panel = document.getElementById(this.menu.panelId);
      panel.setAttribute("data-test-id", this.testId);
    }
  }

  isActive(language: ILanguageWithTranslation) {
    return !this.disabled && this.isEqualWithSelected(language);
  }
  selectLanguage(language: ILanguageWithTranslation) {
    if (this.isEqualWithSelected(language)) {
      return;
    }

      this.onLanguageChange.emit(language.code);
  }

  /**
   * Creates visible language list and menu language list that is used in template.
   * Uses component variable "languageList" which gets passed as input param.
   */
  private recreateLanguageLists() {
    const visibleLanguages: ILanguageWithTranslation[] = [];
    const menuLanguages: ILanguageWithTranslation[] = [];
    const languageCodes: string[] = [];
    this.duplicateCodes = [];
    for (var i = 0; i < this.languageList.length; i++) {
      const language = this.languageList[i];
      if (languageCodes.indexOf(language.lang) >= 0) {
        this.duplicateCodes.push(language.lang);
          continue;
      }
      languageCodes.push(language.lang);

      const languageWithTranslation: ILanguageWithTranslation =
      {
        code: language.lang,
        //will be set later, together with domain translation
        domain: language.domain,
        systemId: language.systemId,
      };

      if (!visibleLanguages.length) {
        visibleLanguages.push(languageWithTranslation);
      }
      else {
        menuLanguages.push(languageWithTranslation);
      }
    }
    this.visibleLanguageList = visibleLanguages;
    this.menuLanguageList = menuLanguages;
    this.ensureSelectedIsVisible();
  }

  private ensureSelectedIsVisible() {
    for (var i = 0; i < this.menuLanguageList.length; i++) {
      const lang = this.menuLanguageList[i];
      if (this.isEqualWithSelected(lang)) {
        const deletedVisible = this.visibleLanguageList.splice(0, 1, lang);
          this.menuLanguageList.splice(i, 1, deletedVisible[0]);
        return;
      }
    }
  }

  private isEqualWithSelected(lang: ILanguageWithTranslation) {
    return lang && lang.code === this.selected.code;
  }
}
