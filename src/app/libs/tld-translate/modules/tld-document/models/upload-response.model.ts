export interface IUploadResponseModel {
  success: boolean;
  error?: string;
  filename?: string;
  wordcount?: number;
  detLang?: string;
}
