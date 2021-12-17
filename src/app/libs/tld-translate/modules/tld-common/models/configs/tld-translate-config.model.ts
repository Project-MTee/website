import { ITldAudioConfig } from "./tld-audio-config.model";
import { ITldTranslateFileConfig } from "./tld-translate-file-config.model";
import { ITldTranslateCoreConfig } from "./tld-translate-core-config.model";
import { ITldTranslateTextConfig } from "./tld-translate-text-config.model";
import { ITldTranslateWebsiteConfig } from "./tld-translate-web-config.model";
import { ITldTranslateApiV2UrlConfig } from "./tld-translate-api-v2-url-config.model";

export interface ITldTranslateConfig{
    audio?: ITldAudioConfig;
    core?: ITldTranslateCoreConfig;
    file?: ITldTranslateFileConfig;
    text?: ITldTranslateTextConfig;
    webTranslate?: ITldTranslateWebsiteConfig;
    apiV2Urls?: ITldTranslateApiV2UrlConfig;
}