import { ISystem } from "../system/system.model";

export interface IStartFileTranslationParams{
    fileName: string;
    tmpName: string;
    system: ISystem;
}