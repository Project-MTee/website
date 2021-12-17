import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { ITranslateParagraphRequestParams } from '../../tld-common/models';
import { HighlightTreeType } from '../models/highlight-tree-type.model';
import { ISourceManualChangeEvent } from '../models/source-manual-change.model';
import { ITranslateParagraphResponse } from '../models/translate-paragraph-response.model';
import { TldTranslateTextApiV2Service } from './api-v2/tld-translate-text-api-v2.service';

@Injectable({
  providedIn: 'root'
})
export class TldTranslateTextService {

  constructor( private readonly api: TldTranslateTextApiV2Service) { }

  private _manualSourceChange: Subject<ISourceManualChangeEvent> = new Subject();
  get manualSourceChange() { return this._manualSourceChange.asObservable(); }

  private _sourceScroll: Subject<number> = new Subject();
  get sourceScroll() { return this._sourceScroll.asObservable(); }

  private _translateButtonClick: Subject<any> = new Subject();
  get translateButtonClick() { return this._translateButtonClick.asObservable(); }

  changeSourceManually(event: ISourceManualChangeEvent) {
    this._manualSourceChange.next(event);
  }

  onSourceScroll(offsetTop: number) {
    this._sourceScroll.next(offsetTop);
  }

  onTranslateButtonClick() {
    this._translateButtonClick.next();
  }

  translateParagraph(params: ITranslateParagraphRequestParams): Observable<ITranslateParagraphResponse> {
    if (!params.text || params.text.length === 0) {
      return of({
        sourceTree: { text: "", paragraphIx: params.paragraphIx, type: HighlightTreeType.PARAGRAPH, root: null, originalText: "" },
        targetTree: { text: "", paragraphIx: params.paragraphIx, type: HighlightTreeType.PARAGRAPH, root: null, originalText: "" }
      });
    }

    return this.api.translateParagraph(params);;
  }
}
