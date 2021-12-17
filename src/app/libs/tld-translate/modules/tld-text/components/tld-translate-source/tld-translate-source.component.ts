import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TldTranslateConfigService } from '../../../tld-common/services';
import { IHighlightTree } from '../../models/highlight-tree.model';
import { ISourceManualChangeEvent } from '../../models/source-manual-change.model';
import { ISourceTextChangedModel } from '../../models/source-text-changed.model';

@Component({
  selector: 'tld-translate-source',
  templateUrl: './tld-translate-source.component.html',
  styleUrls: ['./tld-translate-source.component.scss']
})
export class TldTranslateSourceComponent implements OnInit {
  @Output() sourceTextChanged: EventEmitter<ISourceTextChangedModel> = new EventEmitter();

  @Input() textareaDisabled: boolean;
  @Input() sourceParagraphs: IHighlightTree[];

  // params from config.
  autoFocuss: boolean;
  gramCheck: boolean;
  wordLimit: number;
  allowedFileTypes: string[];
  allowedFileTypesAuthUser: string[];
  webTranslation: boolean;
  get isAuth() { return this.config.coreConfig.isAuth; };
  maxCharLength: number;

  acceptedTypesString: string;
  acceptedTypesAuthUserdString: string;
  sourceChangedManually = false;
  _sourceText: string;


  get showPlaceHolder(): boolean {
    return (!this.sourceText || this.sourceText.length == 0);
  };

  get sourceText() { return this._sourceText; };
  set sourceText(val) {
    if (val === this._sourceText) {
      return;
    }
    this._sourceText = val;
    this.debouncer.next(this.sourceText);
  }

  get appName() {
    return this.config.coreConfig.appName;
  }

  private readonly debouncer: Subject<string> = new Subject<string>();
  private readonly debounceTime = 1000;

  constructor(private readonly config: TldTranslateConfigService) {
    this.debouncer.pipe(
      debounceTime(this.debounceTime),
      distinctUntilChanged((prev) => {
        const sourceCleared = this.sourceChangedManually;
        this.sourceChangedManually = false;
        return prev == this.sourceText && !sourceCleared;
      }))
      .subscribe((value) => {
        this.sourceTextChanged.emit({ text: value, isChangedManually: false });
      });
  }

  ngOnInit(): void {
    const textCfg = this.config.textConfig;
    const fileCfg = this.config.fileConfig;

    this.autoFocuss = this.config.textConfig.autoFocuss;
    this.gramCheck = this.config.textConfig.checkSourceGrammar;
    this.wordLimit = fileCfg.wordLimit;
    this.allowedFileTypes = fileCfg.allowedFileTypes;
    this.allowedFileTypesAuthUser = fileCfg.allowedFileTypesAuthUser;
    this.maxCharLength = textCfg.maxCharLength;
    this.webTranslation = textCfg.allowWebsiteTranslation;

    this.acceptedTypesString = this.allowedFileTypes.join(", ").replace(/\./g, '');
    this.acceptedTypesAuthUserdString = this.allowedFileTypesAuthUser.join(", ").replace(/\./g, '');

  }

  onSourceTextChanged(text: string) {
    this.sourceText = text;
  }

  changeSourceManually(event: ISourceManualChangeEvent) {
    const text = event.phrase ?? "";
    this.sourceChangedManually = true;
    if (event.disableAutomaticTranslation) {
      // shouldnt emit source changed event, since translation not needed
      this._sourceText = text
    }
    else {
      this._sourceText = text;
      this.sourceTextChanged.emit({ text: this._sourceText, isChangedManually: true });
    }
  }

}
