import { IHighlightTree } from "./highlight-tree.model";

export interface IParagraphInfo {
  ix: number;
  source: IHighlightTree;
  target: IHighlightTree;
}

export interface IHighlightSelectedSentence {
  paragraphIx: number;
  sentenceIx: number;
}
