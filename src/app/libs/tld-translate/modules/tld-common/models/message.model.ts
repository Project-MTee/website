export interface ITldTranslateMessage{
  type: TldMessageType;
  text: string;
  error?: any;
  params?: any;
}

export enum TldMessageType {
  ERROR = "ERROR",
  SUCCESS = "SUCCESS",
  WARNING = "WARNING"
}
