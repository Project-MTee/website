import { IError } from "./error.model";
import { ILanguageDirection } from "./language-direction.model";

export interface IGetLanguageDirection{
    languageDirections: ILanguageDirection[];
    error: IError;
}