import { ISystem } from "../system/system.model";

export interface ITranslateParagraphRequestParams{
    system: ISystem;
    text:string;
    paragraphIx: number;
}