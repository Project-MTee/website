import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Common, ITranslateParagraphRequestParams } from '../../../tld-common/models';
import { TldTranslateConfigService } from '../../../tld-common/services';
import { ICheckGrammarResponseV2 } from '../../models/check-grammar-response-v2.model';
import { HighlightParams } from '../../models/highlight-params.model';
import { HighlightTreeType } from '../../models/highlight-tree-type.model';
import { IHighlightTree } from '../../models/highlight-tree.model';
import { ITranslateParagraphParams } from '../../models/translate-paragraph-params.model';
import { ITranslateParagraphResponseV2 } from '../../models/translate-paragraph-response-v2.model';
import { ITranslateParagraphResponse } from '../../models/translate-paragraph-response.model';

@Injectable({
  providedIn: 'root'
})
export class TldTranslateTextApiV2Service {

  constructor(private readonly http: HttpClient,
    private readonly config: TldTranslateConfigService) { }

  translateParagraph(params: ITranslateParagraphRequestParams): Observable<ITranslateParagraphResponse> {
    const requestParams: ITranslateParagraphParams = {
      domain: params.system.domain,
      srcLang: params.system.sourceLanguage,
      text: [params.text],
      trgLang: params.system.targetLanguage
    };
    const sourceText = params.text;
    const sourceTree: IHighlightTree = {
      text: Common.escapeHtmlString(sourceText),
      paragraphIx: params.paragraphIx,
      type: HighlightTreeType.PARAGRAPH,
      root: null,
      originalText: sourceText
    };

    if (this.config.textConfig.checkSourceGrammar && this.config.textConfig.grammarCheckLanguages.includes(params.system.sourceLanguage)) {
      this.checkAndAttachGrammarToTree(params.text, params.system.sourceLanguage, sourceTree);
    }

    return this.http.post<ITranslateParagraphResponseV2>(this.config.apiV2Config.translationUrl, requestParams).pipe(
      map((translationResponse) => {
        const systemId = `${requestParams.srcLang}-${requestParams.trgLang}-${translationResponse.domain}`;
        const originalTranslation = translationResponse.translations[0].translation;
        const targetTree: IHighlightTree = {
          text: Common.escapeHtmlString(originalTranslation),
          paragraphIx: params.paragraphIx,
          type: HighlightTreeType.PARAGRAPH,
          root: null,
          originalText: originalTranslation
        };
        return {
          sourceTree,
          targetTree,
          systemId
        };
      })
    );
  }

  checkGrammar(text: string, language: string): Observable<ICheckGrammarResponseV2> {
    return this.http.post<ICheckGrammarResponseV2>(this.config.apiV2Config.grammarCheckUrl, { text, language });
  }

  private checkAndAttachGrammarToTree(text: string, language: string, tree: IHighlightTree) {
    this.checkGrammar(text, language)
      .pipe(
        catchError((error) => { 
          console.error(error);
          return of(null) })
      )
      .subscribe((grammarCheckResponse) => {
        if (grammarCheckResponse?.corrections?.length > 0) {
          tree.children = [];
          let lastIx = 0;
          grammarCheckResponse.corrections.forEach((correction) => {
            const wordStartIx = correction.span.start;
            const wordEndIx = correction.span.end;
            if (lastIx < wordStartIx) {
              const originalText = text.slice(lastIx, wordStartIx);
              const escaped = Common.escapeHtmlString(originalText);
              tree.children.push({ text: escaped, originalText, type: HighlightTreeType.OTHER, root: tree });
            }

            const originalText = text.slice(wordStartIx, wordEndIx);
            const child: IHighlightTree = {
              text: Common.escapeHtmlString(text.slice(wordStartIx, wordEndIx)),
              class: `${HighlightParams.invalidPhraseClass}`,
              grammarMeta: {
                startIx: wordStartIx,
                endIx: wordEndIx,
                replacements: correction.replacements.map(el => el.value)
              },
              type: HighlightTreeType.OTHER,
              root: tree,
              originalText
            }
            tree.children.push(child)
            lastIx = wordEndIx;
          });
          if (lastIx != text.length - 1) {
            const originalText = text.slice(lastIx, text.length - 1);
            tree.children.push(
              {
                text: Common.escapeHtmlString(originalText),
                type: HighlightTreeType.OTHER,
                root: tree,
                originalText
              })
          }
          tree.children.push()
        }
      });
  }
}
