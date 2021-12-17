import { IGrammarCheckMeta } from "./grammar-check-meta.model";
import { HighlightTreeType } from "./highlight-tree-type.model";

export interface IHighlightTree {
    /** Should be text from all children texts. If no children text, this vill be used as spans innertext */
    text: string;
    //** Text before escaping html string. */
    originalText: string;
    /** Type of object */
    type: HighlightTreeType
    /** Paragraph ix. Necessary for grammar check and for maintaining correct order. 
     * It should always be set for root. Not necessarily for child elements. */
    paragraphIx?: number;
    /** CSS classes that will be applied to this element wrapper */
    class?: string;
    /** Children spans. Will be walked through recursively */
    children?: IHighlightTree[];
    /** Because additional elements (like spaces) are making order incorrect */
    elementId?: string;
    /** Additional data if word is incorrect */
    grammarMeta?: IGrammarCheckMeta;
    /** Tree root element */
    root: IHighlightTree;
}