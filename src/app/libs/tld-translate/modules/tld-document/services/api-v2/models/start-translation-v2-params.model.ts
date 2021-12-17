export interface IStartTranslationV2Params{
    fileName: string;
    srcLang: string;
    trgLang: string;
    domain?: string;
    file: File;
}