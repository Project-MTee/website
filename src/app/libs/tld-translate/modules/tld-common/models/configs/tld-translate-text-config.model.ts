
export interface ITldTranslateTextConfig {
  maxCharLength?: number;
  webWidgetRedirectUrlPrefix?: string;
  webWidgetRedirectUrlPosfix?: string;
  autoFocuss?: boolean;
  allowWebsiteTranslation?: boolean;
  /** Automatically redirect to web translate on url input. */
  autoRedirectToWebTranslate?: boolean;
  /** Api V2 supports grammar chek. Set to true to enable grammar check.   */
  checkSourceGrammar?:boolean;
  /** Api V2. Source languages for which should check grammar. */
  grammarCheckLanguages?: string[];
}
