export interface IFileUploadError {
  code: FileUploadErrorTypeEnum;
  error: string;
  fileName: string;
}

export enum FileUploadErrorTypeEnum{
  UNSUPPORTED_EXTENSION = "FILE_UPLOAD_UNSUPPORTED_FORMAT",
  MAX_SIZE = "FILE_UPLOAD_MAX_SIZE",
  FILE_EMPTY = "FILE_UPLOAD_EMPTY"
}
