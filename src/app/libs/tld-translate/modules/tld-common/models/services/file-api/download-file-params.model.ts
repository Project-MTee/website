import { IFileMeta } from "./file-meta.model";

export interface IDownloadFileParams{
    fileMeta: IFileMeta
    id: string;
}