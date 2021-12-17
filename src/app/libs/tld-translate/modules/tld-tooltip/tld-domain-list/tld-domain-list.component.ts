import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IDomainsLocalization } from '../../../i18n/models/domains-localization.model';
import { TldTranslateConfigService } from '../../tld-common/services/tld-translate-config.service';
import { IDomain } from '../models/domain.model';

@Component({
  selector: 'tld-domain-list',
  templateUrl: './tld-domain-list.component.html',
  styleUrls: ['./tld-domain-list.component.scss']
})
export class TldDomainListComponent implements OnInit {

  private _list: IDomain[];
  get list() { return this._list; }
  @Input() set list(value: IDomain[]) {
    this._list = value;
    this.retranslate();
  };

  private _selected: IDomain;
  get selected() { return this._selected; }
  @Input() set selected(value: IDomain) {
    this._selected = value;
    this.selectedDomainName = this.translateDomainName(value?.title);
  };

  @Input() disabled: boolean;

  @Output() selectionChange: EventEmitter<any> = new EventEmitter();

  translations: any;
  translatedList: IDomain[];
  selectedDomainName: string;

  readonly titleKey: string = "title";
  readonly valueKey = "domain";

  constructor(private readonly translate: TranslateService,
    private readonly config: TldTranslateConfigService) { }

  ngOnInit() {
    this.translate.stream("DOMAINS").subscribe((translations: IDomainsLocalization) => {
      this.translations = translations;
      this.retranslate();
    })
  }

  select(element: any) {
    this.selectionChange.next(element);
  }

  private retranslate() {
    this.selectedDomainName = this.translateDomainName(this.selected?.title);

    const translatedList: IDomain[] = [];
    this.list.forEach((domain) => {
      translatedList.push({ title: this.translateDomainName(domain.title), domain: domain.domain })
    })
    this.translatedList = translatedList;
  }

  private translateDomainName(domainName: string): string {
    if (!domainName) {
      domainName = "Auto";
    }

    if (!this.translations) {
      return domainName;
    }

    const translation = this.translations[domainName.toUpperCase()];
    return translation ?? domainName;
  }

}
