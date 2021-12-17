export interface ISourceFilePreviewResponse{
    percentDone?: number;
    isFilePreviewLoaded?: boolean;
    tmpName?: string;
    sourcePreviewHasHtml?: boolean;
    sourcePreview?: string;
    wordCount?: number;
}