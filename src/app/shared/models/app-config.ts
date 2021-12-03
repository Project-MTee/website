import { ITldAudioConfig, ITldTranslateCoreConfig, ITldTranslateFileConfig, ITldTranslateTextConfig, ITldTranslateWebsiteConfig } from 'tld-translate/lib/modules/tld-common/models';

export interface IAppConfig {
  core: ITldTranslateCoreConfig;
  text: ITldTranslateTextConfig;
  file: ITldTranslateFileConfig;
  web: ITldTranslateWebsiteConfig;
  audio: ITldAudioConfig;
}
