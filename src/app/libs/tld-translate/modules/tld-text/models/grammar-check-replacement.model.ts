import { IGrammarCheckBase } from "./grammar-check-base.model";

export interface IGrammarCheckReplacement extends IGrammarCheckBase{
    replacement: string;
    paragraphIx: number;

}