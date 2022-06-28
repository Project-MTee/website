import { ITldAudioConfig, ITldTranslateApiV2UrlConfig, ITldTranslateCoreConfig, ITldTranslateFileConfig, ITldTranslateTextConfig, ITldTranslateWebsiteConfig } from "src/app/libs/tld-translate/modules/tld-common/models";

export interface IAppConfig {
  core: ITldTranslateCoreConfig;
  text: ITldTranslateTextConfig;
  file: ITldTranslateFileConfig;
  web: ITldTranslateWebsiteConfig;
  audio: ITldAudioConfig;
  apiV2Urls: ITldTranslateApiV2UrlConfig;
}
