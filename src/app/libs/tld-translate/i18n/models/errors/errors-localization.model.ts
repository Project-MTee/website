import { FileTranslationSubstatus } from "../../../modules/tld-common/models";
import { ErrorCodesType } from "../../../modules/tld-common/models/errors/error-codes.type";

export interface IErrorsLocalization extends ErrorCodesType {
    ERROR_DEFAULT?: string;
    MAX_CHAR_LENGTH?: string;

    FILE_TRANSLATION_SUBSTATUS?: { [key in FileTranslationSubstatus]?: string };
}