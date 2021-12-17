import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { TldHighlightService } from '../../../tld-common/services';
import { IGrammarCheckReplacement } from '../../models/grammar-check-replacement.model';
import { HighlightParams } from '../../models/highlight-params.model';
import { HighlightTreeType } from '../../models/highlight-tree-type.model';
import { IHighlightTree } from '../../models/highlight-tree.model';

@Component({
  selector: 'tld-highlight-tree',
  templateUrl: './highlight-tree.component.html',
  styleUrls: ['./highlight-tree.component.scss']
})
export class HighlightTreeComponent {

  @Input() tree: IHighlightTree;
  @Input() isSource: boolean;
  @Input() correctionsEnabled: boolean = true;
  @Input() highlight: boolean;
  @Input() gramCheck: boolean;
  @Input() selectSentence: boolean;
  @Output() onReplace: EventEmitter<IGrammarCheckReplacement> = new EventEmitter();

  constructor(private readonly highlightService: TldHighlightService) { }

  mouseEnter(event: MouseEvent) {
    this.onMouseEvent(event, this.isSource, true);
  }

  mouseLeave(event: MouseEvent) {
    this.onMouseEvent(event, this.isSource, false);
  }

  gramCheckMenu(tree: IHighlightTree, menuTrigger?: MatMenuTrigger) {
    if (tree.grammarMeta && this.gramCheck) {
      menuTrigger.openMenu();
    }
  }

  replace(tree: IHighlightTree, replacement: string){
    this.onReplace.next({
      endIx: tree.grammarMeta.endIx,
      paragraphIx: tree.paragraphIx ?? tree.root?.paragraphIx,
      replacement: replacement,
      startIx: tree.grammarMeta.startIx
    });
  }

  parentClick(tree: IHighlightTree){
    if(this.selectSentence && tree.type===HighlightTreeType.SENTENCE){
      this.highlightService.changeSelectedTargetSentence({paragraphIx: tree.paragraphIx ?? tree.root?.paragraphIx, sentenceIx:Number(tree.elementId)});
    }
  }

  isSelectedSentence(tree:IHighlightTree){
    return  this.selectSentence && tree.type===HighlightTreeType.SENTENCE
    && this.highlightService.selectedTargetSentence?.paragraphIx === (tree.paragraphIx ?? tree.root?.paragraphIx)
    && this.highlightService.selectedTargetSentence.sentenceIx.toString() === tree.elementId;
  }
  private onMouseEvent(event: MouseEvent, isSource: boolean, isMouseEnter: boolean): void {
    const element = event.target as Element;
    let elementWithSiblings = [element];

    if (this.highlight) {
      let siblingParentClass: string;
      if (isSource) {
        siblingParentClass = HighlightParams.targetHighlightClass;
      }
      else {
        siblingParentClass = HighlightParams.sourceHighlightClass;
      }
      element.classList.forEach((className: string) => {
        if (className.includes(HighlightParams.siblingClass)) {
          const querySelector = `.${siblingParentClass} .${className.replace(HighlightParams.siblingClass, HighlightParams.wordClass)}`;
          elementWithSiblings = elementWithSiblings.concat(Array.from(document.querySelectorAll(querySelector)));
        }
      });
    }

    elementWithSiblings.forEach((element) => {
      if (isMouseEnter) {
        element.classList.add(HighlightParams.hoveredClassName);
      }
      else {
        element.classList.remove(HighlightParams.hoveredClassName);
      }
    });
  }
}
