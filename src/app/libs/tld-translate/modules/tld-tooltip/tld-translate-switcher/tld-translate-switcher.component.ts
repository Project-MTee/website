/* tslint:disable */
import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { TldTranslateConfigService } from '../../tld-common/services';
import { ISwitcherTranslationOptions } from '../models/switcher-options.model';

@Component({
  selector: 'tld-translate-switcher',
  templateUrl: './tld-translate-switcher.component.html',
  styleUrls: ['./tld-translate-switcher.component.scss']
})
export class TldTranslateSwitcherComponent {
  @Input() buttonDisabled = false;
  @Input() showBtn = true;
  @Input() hideOnSmallScreens = true;
  @Input() disabled: boolean;
  @Input() collections: any[];
  @Input() showCollections: boolean = true;

  @Input() settings: ISwitcherTranslationOptions;

  @Output() onDomainChange: EventEmitter<string> = new EventEmitter();
  @Output() onActionClick: EventEmitter<any> = new EventEmitter();
  @Output() onSourceLanguageChange: EventEmitter<any> = new EventEmitter();
  @Output() onTargetLanguageChange: EventEmitter<any> = new EventEmitter();
  @Output() onLanguageSwap: EventEmitter<string> = new EventEmitter();

  languageCountByScreenSize: number;

  get showDomains() {
    return this.config?.coreConfig.showDomains &&
      this.settings?.domains?.domains?.length > 1 &&
      this.settings?.source;
  }

  get isSwapLanguagesDisabled() {
    return this.disabled || !this.settings.swapActive;
  }

  readonly srcLangTestId = "src-lang-menu";
  readonly trgLangTestId = "trg-lang-menu";

  constructor(
    private readonly config: TldTranslateConfigService) {
  }

  actionClick() {
    this.onActionClick.emit();
  }

  domainChange(systemId: string) {
    this.onDomainChange.emit(systemId);
  }

  sourceLangChange(language: string) {
    this.onSourceLanguageChange.emit(language);
  }

  swapSourceAndTarget() {
    this.onLanguageSwap.emit();
  }

  targetLangChange(language: string) {
    this.onTargetLanguageChange.emit(language);
  }

  private getElementRefWidth(element: ElementRef) {
    return element?.nativeElement.offsetWidth || 0;
  }
}
