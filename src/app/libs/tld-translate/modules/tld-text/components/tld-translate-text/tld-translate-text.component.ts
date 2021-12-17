import { Clipboard } from '@angular/cdk/clipboard';
import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/overlay';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { catchError, distinctUntilChanged, mergeMap, takeUntil, tap } from 'rxjs/operators';
import { ITranscriptionUpdateModel } from '../../../tld-audio/models';
import { AudioRecordService, TldVoiceInputService } from '../../../tld-audio/services';
import { Common, ErrorCode, IFileUploadError, ITranslateParagraphRequestParams } from '../../../tld-common/models';
import { TldAlertService, TldHighlightService, TldTranslateConfigService } from '../../../tld-common/services';
import { IActiveData } from '../../../tld-tooltip/models';
import { TldSystemService } from '../../../tld-tooltip/services/tld-system.service';
import { HighlightTreeType } from '../../models/highlight-tree-type.model';
import { IHighlightTree } from '../../models/highlight-tree.model';
import { IHighlightSelectedSentence, IParagraphInfo } from '../../models/highlight.model';
import { ISourceTextChangedModel } from '../../models/source-text-changed.model';
import { ITranslateParagraphResponse } from '../../models/translate-paragraph-response.model';
import { IUntranslatedLine } from '../../models/untranslated-line.model';
import { TldTranslateTextService } from '../../services/tld-translate-text.service';
import { TldTranslateSourceComponent } from '../tld-translate-source/tld-translate-source.component';


@Component({
  selector: 'tld-translate-text',
  templateUrl: './tld-translate-text.component.html',
  styleUrls: ['./tld-translate-text.component.scss']
})
export class TldTranslateTextComponent implements OnInit, OnDestroy {

  @ViewChild("sourceComponent") sourceComponent: TldTranslateSourceComponent;


  @Input() filePreviewProgress: number;
  @Output() onFileChange: EventEmitter<FileList> = new EventEmitter<FileList>();

  activeData: IActiveData;
  get systemId() { return this.activeData?.systemId; };
  //params from config service.
  get allowedFileTypesAuthUser(): string[] { return this.config.fileConfig.allowedFileTypesAuthUser; };
  get allowedFileTypes(): string[] { return this.config.fileConfig.allowedFileTypes; };
  get gramCheck(): boolean { return this.config.textConfig.checkSourceGrammar; };
  get fileUpload(): boolean { return this.config.fileConfig.fileUpload && !(this.audioService?.isRecording || this.voiceInputService.isProcessing); };
  get isAuth() { return this.config.coreConfig.isAuth; };
  get maxFileUploadSize(): number { return this.config.fileConfig.maxSize; };
  get allowWebsiteTranslation(): boolean { return this.config.textConfig.allowWebsiteTranslation; };
  get autoRedirectToWebTranslate(): boolean { return this.config.textConfig.autoRedirectToWebTranslate; };
  get webWidgetRedirectUrlPrefix(): string { return this.config.textConfig.webWidgetRedirectUrlPrefix; };
  get webWidgetRedirectUrlPosfix(): string { return this.config.textConfig.webWidgetRedirectUrlPosfix; };
  get textareaDisabled(): boolean { return this.audioService.isRecording || this.voiceInputService.isProcessing };

  audioInputVisible: boolean;
  targetSentenceSelect: boolean = true;
  urlToTranslate: string;

  readonly copyMessageId = "tld-copy-success";
  readonly copyMessageCloseButtonId = "tld-copy-success-close";
  readonly copyButtonId = "tld-copy-to-clipboard";

  get translatedText(): string {
    return this.paragraphs.map(line => line.target.text).join("\n")
  }

  private _hasDictionary: boolean;
  get hasDictionary() { return this._hasDictionary; }
  set hasDictionary(val) {
    this._hasDictionary = val;
  }

  private _source: string;
  get source() { return this._source; }
  set source(val) {
    this._source = val;

    if (val) {
      this.hasDictionary = false;
    }
  }

  private isLastSourceChangedManually: boolean;

  get translateUrlRedirect() {
    if (this.webWidgetRedirectUrlPrefix === '') {
      return `${this.webWidgetRedirectUrlPrefix}${this.webWidgetRedirectUrlPosfix}${encodeURIComponent(this.urlToTranslate)}`;
    } else {
      return `${this.webWidgetRedirectUrlPrefix}${this.translate.currentLang}${this.webWidgetRedirectUrlPosfix}${this.urlToTranslate}`;
    }
  }

  paragraphs: IParagraphInfo[] = [];
  sourceParagraphs: IHighlightTree[] = [];
  targetParagraphs: IHighlightTree[] = [];

  selectedTargetSentence: IHighlightSelectedSentence = { paragraphIx: null, sentenceIx: null };

  private firstLineTranslated: boolean;
  private lineTranslationSubscription: Subscription;
  private lineTranslationSubject = new Subject<IUntranslatedLine>();
  private readonly CONCURRENT_UPLOADS = 5;
  private readonly destroy$ = new Subject();


  constructor(
    private readonly translate: TranslateService,
    private readonly translateTextService: TldTranslateTextService,
    private readonly clipboard: Clipboard,
    private readonly alerts: TldAlertService,
    private readonly config: TldTranslateConfigService,
    private readonly scrollDispatcher: ScrollDispatcher,
    private readonly tldSystem: TldSystemService,
    private readonly highlightService: TldHighlightService,
    private readonly audioService: AudioRecordService,
    private readonly voiceInputService: TldVoiceInputService) {
  }

  ngOnInit(): void {
    this.tldSystem.getActiveData().pipe(distinctUntilChanged((x, y) => x && y && x.systemId == y.systemId))
      .pipe(takeUntil(this.destroy$))
      .subscribe((syst) => {
        if (!syst) {
          return;
        }
        this.activeData = syst;
        this.audioInputVisible = this.config.audioConfig.audioTextInput && this.config.audioConfig.sourceLanguages?.includes(this.activeData?.sourceLang.lang);
        if (this.activeData.retranslate) {
          this.paragraphs = [];
          this.sourceParagraphs = [];
          this.targetParagraphs = [];
          this.selectTranslationMethod();
        }
      });
    this.recreateLineTranslationSubject();
    this.translateTextService.translateButtonClick.pipe(takeUntil(this.destroy$))
      .subscribe(() => { this.translateButtonClick(); })

    this.scrollDispatcher.scrolled().pipe(takeUntil(this.destroy$))
      .subscribe((scrollable: CdkScrollable) => {
        this.handleScroller(scrollable);
      });

    if (this.config.audioConfig.audioTextInput) {
      this.audioService.onRecordStart.pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.translateTextService.changeSourceManually({ phrase: "" });
      })

      this.voiceInputService.onTranscribtionTextUpdated.pipe(takeUntil(this.destroy$))
        .subscribe((event: ITranscriptionUpdateModel) => {
          this.translateTextService.changeSourceManually({ phrase: event.text, swapSystems: false, disableAutomaticTranslation: !event.completed });
          if (event.completed && (!event.text || event.text === "")) {
            this.alerts.warning(`ERRORS.${ErrorCode.NO_TEXT_RECOGNIZED}`)
          }
        })
    }
  }

  copy() {
    this.clipboard.copy(this.translatedText);
    this.alerts.info("TLD_TRANSLATE.TEXT_COPIED", { id: this.copyMessageId, closeButtonId: this.copyMessageCloseButtonId, parentId: this.copyButtonId });
  }

  switchFocusFromCopy(event) {
    const copyMessageCloseButton = document.getElementById(this.copyMessageCloseButtonId)?.getElementsByTagName("button")?.item(0);
    if (copyMessageCloseButton) {
      event.preventDefault();
      copyMessageCloseButton.focus();
    }
  }

  fileChange(files: FileList) {
    //file-upload component returns list of files, but it is allowed to translate 1file at time, so taking only first of list.
    //const file = files.item(0);
    this.onFileChange.emit(files);
  }

  fileUploadError(error: IFileUploadError) {
    this.alerts.error(`TLD_TRANSLATE.${error.code}`, null, { fileName: error.fileName, maxSizeMB: Math.round(this.config.fileConfig.maxSize / 1024000), formats: (this.isAuth ? this.allowedFileTypesAuthUser : this.allowedFileTypes).join(", ") });
    console.error(error);
  }

  sourceTextChanged(params: ISourceTextChangedModel, buttonClicked?: boolean) {
    this.source = params.text;
    this.isLastSourceChangedManually = params.isChangedManually;
    this.highlightService.changeSelectedTargetSentence(null);
    this.selectTranslationMethod(buttonClicked);
  }

  translateButtonClick() {
    // storing source, since it gets cleared in clearSource();
    const source = this.source;
    this.clearSource();
    this.sourceTextChanged({ text: source }, true);
  }

  navigateToTranslatedUrl() {
    window.location.replace(this.translateUrlRedirect);
  }

  // if method gets called because of button click and url entered - go to web translation
  private selectTranslationMethod(buttonClicked?: boolean) {
    if (!this.source || this.source == "") {
      this.clearSource();
      return;
    }

    this.urlToTranslate = this.isTextUrl(this.source);
    if (this.allowWebsiteTranslation && this.urlToTranslate) {
      this.paragraphs = [];
      this.sourceParagraphs = [];
      this.targetParagraphs = [];

      if (this.autoRedirectToWebTranslate || buttonClicked) {
        window.open(this.translateUrlRedirect, "_blank");
      }
      return;
    }
    else {
      this.urlToTranslate = null;
    }
    this.translateTextInParagraphs(this.source);
  }

  private clearSource() {
    this._hasDictionary = false;
    this.paragraphs = [];
    this.targetParagraphs = [];
    this.sourceParagraphs = [];
    this.source = "";
    this.urlToTranslate = null;
    if (this.lineTranslationSubscription) {
      this.lineTranslationSubscription.unsubscribe();
    }
  }

  private isTextUrl(text: string): string {
    const urlPattern = /\b((?:https?:(?:\/{1,3}|[a-z0-9%])|[a-z0-9.\-]+[.](?:com|net|org|edu|gov|mil|aero|asia|biz|cat|coop|info|int|jobs|mobi|museum|name|post|pro|tel|travel|xxx|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cs|cu|cv|cx|cy|cz|dd|de|dj|dk|dm|do|dz|ec|ee|eg|eh|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|Ja|sk|sl|sm|sn|so|sr|ss|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|yu|za|zm|zw)\/)(?:[^\s()<>{}\[\]]+|\([^\s()]*?\([^\s()]+\)[^\s()]*?\)|\([^\s]+?\))+(?:\([^\s()]*?\([^\s()]+\)[^\s()]*?\)|\([^\s]+?\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’])|(?:[a-z0-9]+(?:[.\-][a-z0-9]+)*[.](?:com|net|org|edu|gov|mil|aero|asia|biz|cat|coop|info|int|jobs|mobi|museum|name|post|pro|tel|travel|xxx|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cs|cu|cv|cx|cy|cz|dd|de|dj|dk|dm|do|dz|ec|ee|eg|eh|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|Ja|sk|sl|sm|sn|so|sr|ss|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|yu|za|zm|zw)\b\/?(?!@)))/gi;
    const urlMatch = urlPattern.exec(text);
    if (urlMatch) {
      const url = urlMatch[0];
      if (url.length / text.trim().length > 0.8) { // most of the text is url
        return url;
      }
    }
    return null;
  }

  private handleScroller(scrollable?: CdkScrollable, offset?: number) {
    if (typeof scrollable == "undefined" && (!offset || offset != 0)) {
      return;
    }
    const scrollOffsetKey = "top";
    const offsetValue = offset || offset == 0 ? offset : scrollable.measureScrollOffset(scrollOffsetKey);
    Array.from(this.scrollDispatcher.scrollContainers.keys())
      .filter(otherScrollable => otherScrollable && otherScrollable !== scrollable)
      .forEach(otherScrollable => {
        if (otherScrollable.measureScrollOffset(scrollOffsetKey) !== offsetValue) {
          const scrollTo = {};
          scrollTo[scrollOffsetKey] = offsetValue;
          otherScrollable.scrollTo(scrollTo);
        }
      });
  }

  private translateTextInParagraphs(text: string) {
    const paragraphs = Common.splitInParagraphs(text);
    const newParagraphs: IParagraphInfo[] = [];
    const newSourceParagraphs: IHighlightTree[] = [];
    const newTargetParagraphs: IHighlightTree[] = [];

    // source text changed. Previously made observables aren't necessary anymore;
    this.recreateLineTranslationSubject();

    paragraphs.forEach((paragraph, ix) => {
      let needDeepCopy: boolean;
      let newParagraph: IParagraphInfo;
      for (var i = 0; i < this.paragraphs.length; i++) {
        const existingParagraph = this.paragraphs[i];
        if (existingParagraph.source.originalText == paragraph) {

          if (existingParagraph.ix === ix) {
            newParagraph = existingParagraph;
            break;
          }

          needDeepCopy = true;
          newParagraph = {
            ix,
            source: Object.assign({}, existingParagraph.source),
            target: Object.assign({}, existingParagraph.target)
          };
          if (ix > existingParagraph.ix) {
            break;
          }
        }
      }
      if (newParagraph) {
        if (needDeepCopy) {
          this.changeRootAndParagraphIx(newParagraph.source, newParagraph.source, newParagraph.ix);
          this.changeRootAndParagraphIx(newParagraph.target, newParagraph.target, newParagraph.ix);
        }
        newParagraphs.splice(ix, 0, newParagraph);
        newTargetParagraphs.splice(ix, 0, newParagraph.target);
        newSourceParagraphs.splice(ix, 0, newParagraph.source);
      }
      else {
        const sourceParagraph: IHighlightTree = { text: "", originalText: "", paragraphIx: ix, type: HighlightTreeType.PARAGRAPH, root: null };
        const targetParagraph: IHighlightTree = { text: "", originalText: "", paragraphIx: ix, type: HighlightTreeType.PARAGRAPH, root: null };
        const newParagraph: IParagraphInfo = {
          ix: ix,
          source: sourceParagraph,
          target: targetParagraph
        };

        newParagraphs.splice(ix, 0, newParagraph);
        newSourceParagraphs.splice(ix, 0, sourceParagraph);
        newTargetParagraphs.splice(ix, 0, targetParagraph);
        this.lineTranslationSubject.next({ ix: ix, line: paragraph });
      }
    });

    this.paragraphs = newParagraphs;
    this.targetParagraphs = newTargetParagraphs;
    this.sourceParagraphs = newSourceParagraphs;
  }

  private translateParagraph(paragraph: IUntranslatedLine): Observable<ITranslateParagraphResponse> {
    const options: ITranslateParagraphRequestParams = {
      system: this.activeData?.system,
      text: paragraph.line,
      paragraphIx: paragraph.ix
    };
    return this.translateTextService.translateParagraph(options);
  }

  private UpdateLineHighlightObject(paragraphIx: number, response: ITranslateParagraphResponse) {
    let paragraph: IParagraphInfo = {
      ix: paragraphIx,
      target: response.targetTree,
      source: response.sourceTree
    };

    this.paragraphs.splice(paragraphIx, 1, paragraph);
    this.sourceParagraphs.splice(paragraphIx, 1, response.sourceTree);
    this.targetParagraphs.splice(paragraphIx, 1, response.targetTree);

    this.paragraphs.sort((a, b) => (a.ix > b.ix) ? 1 : -1);
  }

  private recreateLineTranslationSubject() {
    this.firstLineTranslated = false;
    this.lineTranslationSubject = new Subject<IUntranslatedLine>();

    const source = this.source;
    this.lineTranslationSubscription = this.lineTranslationSubject.asObservable().pipe(
      mergeMap(untranslatedLine => this.translateParagraph(untranslatedLine).pipe(
        tap((response: ITranslateParagraphResponse) => {
          if (source != this.source) {
            return;
          }

          //if auto domain detection is on, system api service sets system id to `${srcLang}-${targetLang}` so we need to validate if that is the case
          if (response.systemId && this.systemId !== response.systemId
            && this.systemId === `${this.activeData.sourceLang.lang}-${this.activeData.targetLang.lang}`) {
            this.tldSystem.changeSystem(response.systemId);
          }

          if (!this.firstLineTranslated && !this.isLastSourceChangedManually) {
            this.firstLineTranslated = true;
            this.handleScroller(null, 0);
          }
          this.UpdateLineHighlightObject(untranslatedLine.ix, response);
        }),
        catchError(err => {
          throw err;
        })), this.CONCURRENT_UPLOADS),
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private changeRootAndParagraphIx(tree: IHighlightTree, root: IHighlightTree, paragraphIx: number) {
    tree.paragraphIx = paragraphIx;
    if (root != tree) {
      tree.root = root;
    }

    if (tree.children) {
      const children = [];
      tree.children?.forEach((child) => {
        const newChild = Object.assign({}, child);
        this.changeRootAndParagraphIx(newChild, root, paragraphIx)
        children.push(newChild);
      })
      tree.children = children;
    }
  }
}
