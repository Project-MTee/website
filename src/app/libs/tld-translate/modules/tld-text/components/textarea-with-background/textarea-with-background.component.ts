import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Common } from '../../../tld-common/models';
import { TldAlertService } from '../../../tld-common/services';
import { IGrammarCheckReplacement } from '../../models/grammar-check-replacement.model';
import { HighlightParams } from '../../models/highlight-params.model';
import { IHighlightTree } from '../../models/highlight-tree.model';
import { ISourceManualChangeEvent } from '../../models/source-manual-change.model';
import { TldTranslateTextService } from '../../services/tld-translate-text.service';

@Component({
  selector: 'tld-textarea-with-background',
  templateUrl: './textarea-with-background.component.html',
  styleUrls: ['./textarea-with-background.component.scss']
})
export class TextareaWithBackgroundComponent implements OnInit, AfterViewInit {
  @ViewChild("sourceInput") sourceInput: ElementRef;
  @ViewChild("treeWrapper") treeWrapper: ElementRef;

  @Input() maxCharLength: number;
  @Input() autoFocuss: boolean;
  @Input() highlightTree: IHighlightTree[];
  @Input() highlight: boolean;
  @Input() gramCheck: boolean;
  @Input() textareaDisabled: boolean;

  @Output() sourceChangedManually: EventEmitter<ISourceManualChangeEvent> = new EventEmitter();
  @Output() sourceTextChanged: EventEmitter<string> = new EventEmitter();

  hoveredBackgroundElements: Element[] = [];

  private _sourceText: string;
  get sourceText() { return this._sourceText; };
  set sourceText(val) {
    this._sourceText = val;
    // this is necessary so that highlighting is always in his real place also when tree wrapper is not finished rendering.
    this.treeWrapper.nativeElement.style.height = this.sourceInput.nativeElement.scrollHeight;
    this.sourceTextChanged.emit(this.sourceText);
  }

  readonly clearButtonAriaCode = "CLEAR_SOURCE";
  readonly wrapperClass = HighlightParams.sourceHighlightClass;

  constructor(private readonly alerts: TldAlertService,
    private readonly textService: TldTranslateTextService) { }

  ngOnInit(): void {
    this.textService.manualSourceChange.subscribe((event) => {
      this.changeSourceManually(event);
    });
  }

  ngAfterViewInit() {
    if (this.autoFocuss) {
      this.focus();
    }
  }

  onTextAreaMouseMove(event: MouseEvent) {
    const x = event.clientX;
    const y = event.clientY;
    const hoveredElements = this.findBackgroundElements(x, y);

    this.hoveredBackgroundElements.forEach((hoveredElement) => {
      if (!hoveredElements.includes(hoveredElement)) {
        this.dispatchEvent("mouseleave", hoveredElement);
      }
    });

    hoveredElements.forEach((hoveredElement) => {
      this.dispatchEvent("mouseenter", hoveredElement);
    });

    this.hoveredBackgroundElements = hoveredElements;
  }

  clearSource() {
    this.changeSourceManually({phrase: ""});
    setTimeout(() => {
      this.sourceInput.nativeElement.focus();
    }, 0);
  }

  onPaste(event: ClipboardEvent) {
    if (this.maxCharLength > 0) {
      const totalCharLength = (this.sourceText || "").length + event.clipboardData.getData("text").length;
      if (totalCharLength > this.maxCharLength) {
        this.alerts.warning("ERRORS.MAX_CHAR_LENGTH", { maxCharLength: this.maxCharLength, totalSymbols: totalCharLength });
      }
    }
  }

  textareaClick(event: MouseEvent) {
    const x = event.clientX;
    const y = event.clientY;
    const hoveredElements = this.findBackgroundElements(x, y);
    hoveredElements.forEach((element) => {
      this.dispatchEvent("click", element);
    });
  }

  replace(replacement: IGrammarCheckReplacement) {
    const paragraphs = Common.splitInParagraphs(this.sourceText);
    const paragraph = paragraphs[replacement.paragraphIx];
    paragraphs[replacement.paragraphIx] = `${paragraph.substring(0, replacement.startIx)}${replacement.replacement}${paragraph.substring(replacement.endIx)}`;
    this.changeSourceManually({phrase: Common.joinParagraphs(paragraphs)});
  }

  private changeSourceManually(event: ISourceManualChangeEvent) {
    this._sourceText = event.phrase;
    this.sourceChangedManually.emit(event);
  }

  private findBackgroundElements(x: number, y: number): Element[] {
    const elements = document.querySelectorAll(`.${this.wrapperClass} .${HighlightParams.sentenceClass}, .${this.wrapperClass} .${HighlightParams.wordClass},  .${this.wrapperClass} .${HighlightParams.invalidPhraseClass}`);
    return this.findElementsAtPosition(Array.from(elements), x, y);
  }

  private focus() {
    this.sourceInput?.nativeElement?.focus();
  }

  private findElementsAtPosition(elements: Element[], x: number, y: number): Element[] {
    const foundedElements: Element[] = [];
    elements.forEach((element) => {
      const boundRectangles = element.getClientRects();

      for (let rectIndex = 0; rectIndex < boundRectangles.length; rectIndex++) {
        let boundRectangle = boundRectangles[rectIndex];
        if (x >= boundRectangle.left && y >= boundRectangle.top &&
          x <= boundRectangle.right && y <= boundRectangle.bottom) {
          foundedElements.push(element);
        }
      }
    });
    return foundedElements;
  }

  private dispatchEvent = (eventName: string, element: Element) => {
    if (!element) {
      return;
    }
    let ev = new MouseEvent(eventName, {
      view: window,
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(ev);
  }
}
