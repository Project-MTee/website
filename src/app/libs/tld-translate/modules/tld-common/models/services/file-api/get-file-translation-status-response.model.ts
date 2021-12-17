import { TranslationStatuss } from "../../../../tld-document/models";
import { IFileMeta } from "./file-meta.model";
import { FileTranslationSubstatus } from "./file-translation-substatus.model";

export interface IGetFileTranslationStatusResponse{
    translationStatuss: TranslationStatuss;
    sourceDownloadAvailable?: boolean;
    progress: number;
    name: string;
    extensions: IFileMeta[];
    /** For api v2, to change domain after auto */
    systemId?: string;
    substatus?: FileTranslationSubstatus;
}