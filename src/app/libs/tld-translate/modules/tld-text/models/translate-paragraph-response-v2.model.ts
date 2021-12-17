/**
 * Structure returned from V2 api for text translation.
 */
export interface ITranslateParagraphResponseV2{
    domain: string;
    translations: {translation:string}[];
}