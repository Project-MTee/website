import { IGrammarCheckBase } from "./grammar-check-base.model";

/** Additional data necessary for grammar check in highlight tree component */
export interface IGrammarCheckMeta extends IGrammarCheckBase{
    replacements:string[];
}