import { IHighlightTree } from "./highlight-tree.model";

// Structure that needs to be returned from api service when translating text
export interface ITranslateParagraphResponse {
    sourceTree: IHighlightTree;
    targetTree: IHighlightTree;
    systemId?: string;
    corrections?: IHighlightTree[];
}