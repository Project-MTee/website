export interface ITldTranslateFileConfig {
  allowedFileTypes?: string[];
  allowedFileTypesAuthUser?: string[];
  allowTmxAuth?: boolean;
  allowTmxUnauth?: boolean;
  fileApiUrl?: string;
  fileUpload?: boolean;
  fileDownloadTimeouts?: { [status: string]: number };
  maxSize?: number;
  wordLimit?: number;
  targetDownloadExtensionOrder?: { [extension: string]: string[] };
}
