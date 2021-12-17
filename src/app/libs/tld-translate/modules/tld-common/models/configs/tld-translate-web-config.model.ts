export interface ITldTranslateWebsiteConfig {
  websiteTranslationUrl?: string;
  logoLocation?: string;
  translatePagePath?: string; // path to WebTranslationProxy
  debug?: boolean;
  webLangAutodetect?: boolean; // after page is loaded auto detect language and change active system
  allowSuggestions?: boolean;
  hidePopup?: boolean;
}
