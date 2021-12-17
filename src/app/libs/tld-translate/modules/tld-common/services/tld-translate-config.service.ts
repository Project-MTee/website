import { Inject, Injectable } from '@angular/core';
import { ITldAudioConfig } from '../models/configs/tld-audio-config.model';
import { ITldTranslateApiV2UrlConfig } from '../models/configs/tld-translate-api-v2-url-config.model';
import { ITldTranslateConfig } from '../models/configs/tld-translate-config.model';
import { ITldTranslateCoreConfig } from '../models/configs/tld-translate-core-config.model';
import { ITldTranslateFileConfig } from '../models/configs/tld-translate-file-config.model';
import { ITldTranslateTextConfig } from '../models/configs/tld-translate-text-config.model';
import { ITldTranslateWebsiteConfig } from '../models/configs/tld-translate-web-config.model';

@Injectable({
  providedIn: 'root'
})
export class TldTranslateConfigService {

  constructor() {
    this.initConfigs();
  }

  private _coreConfig: ITldTranslateCoreConfig = {};
  get coreConfig() {
    return this._coreConfig;
  }

  private _textConfig: ITldTranslateTextConfig = {};
  get textConfig() {
    return this._textConfig;
  }

  private _fileConfig: ITldTranslateFileConfig = {};
  get fileConfig() {
    return this._fileConfig;
  }

  private _webtranslateConfig: ITldTranslateWebsiteConfig = {};
  get webtranslateConfig() {
    return this._webtranslateConfig;
  }

  private _apiV2Config: ITldTranslateApiV2UrlConfig = {};
  get apiV2Config() {
    return this._apiV2Config;
  }

  private _audioConfig: ITldAudioConfig = {};
  get audioConfig() {
    return this._audioConfig;
  }

  initConfigs(config?: ITldTranslateConfig) {
    const core = config?.core;
    const file = config?.file;
    const text = config?.text;
    const audio = config?.audio;
    const webtranslate = config?.webTranslate;
    const apiV2Config = config?.apiV2Urls;

    this._coreConfig = { };
    this._coreConfig.appName = core?.appName || "Tilde MT";
    this._coreConfig.isAuth = core?.isAuth || false;
    this._coreConfig.translateAppName = core?.translateAppName ?? true;
    this._coreConfig.supportEmail = core?.supportEmail || "mt@tilde.lv";
    this._coreConfig.showDomains = core?.showDomains ?? true;
    this._coreConfig.defaultSystemId = core?.defaultSystemId;

    this._fileConfig.allowedFileTypes = file?.allowedFileTypes || [".doc", ".docx", ".xlsx", ".pdf", ".pptx", ".odt", ".odp", ".ods", ".txt"];
    this._fileConfig.allowedFileTypesAuthUser = file?.allowedFileTypesAuthUser
      || [".doc", ".docx", ".xlsx", ".pptx", ".odt", ".odp", ".ods", ".txt", ".html", ".htm",
        ".xhtml", ".xht", ".tmx", ".xlf", ".xlif", ".xliff", ".sdlxliff", ".sdlxlf", ".ttx", ".rtf",
        ".pages", ".tex", ".xml", ".json", ".sxw", ".pdf", ".csv", ".ttl", ".srt"];
    this._fileConfig.allowTmxAuth = file?.allowTmxAuth ?? true;
    this._fileConfig.allowTmxUnauth = file?.allowTmxUnauth ?? false;
    this._fileConfig.fileApiUrl = file?.fileApiUrl || "https://letsmt.eu/ws/Files/";
    this._fileConfig.fileDownloadTimeouts = file?.fileDownloadTimeouts
      || {
      "initializing": 1000,
      "extracting": 1000,
      "waiting": 10000,
      "translating": 1000,
      "saving": 1000,
      "completed": 1000,
      "error": 1000,
      "queuing": 1000
    };
    this._fileConfig.maxSize = file?.maxSize || 30720000;
    this._fileConfig.wordLimit = file?.wordLimit || file?.wordLimit == 0 ? file.wordLimit : 1250;
    this._fileConfig.fileUpload = file?.fileUpload == null ? true : file.fileUpload;

    this._textConfig.maxCharLength = text?.maxCharLength == null ? 10000 : text.maxCharLength;
    this._textConfig.webWidgetRedirectUrlPosfix = text?.webWidgetRedirectUrlPosfix || "/webtranslate?url=";
    this._textConfig.webWidgetRedirectUrlPrefix = text?.webWidgetRedirectUrlPrefix || "";
    this._textConfig.autoFocuss = text?.autoFocuss;
    this._textConfig.allowWebsiteTranslation = text?.allowWebsiteTranslation == null ? true : text.allowWebsiteTranslation;
    this._textConfig.autoRedirectToWebTranslate = text?.autoRedirectToWebTranslate ?? false;
    this._textConfig.checkSourceGrammar = text?.checkSourceGrammar ?? false;
    this._textConfig.grammarCheckLanguages = text?.grammarCheckLanguages ?? [];

    this._audioConfig.audioTextInput = audio?.audioTextInput ?? false;
    // Not setting default url because there is no service provided by Tilde and this is not used by default in website project.
    this._audioConfig.audioApiUrl = audio?.audioApiUrl;
    this._audioConfig.audioMaxSizeBytes = audio?.audioMaxSizeBytes ?? 10000000;
    this._audioConfig.sourceLanguages = audio?.sourceLanguages ?? [];
    this._audioConfig.dataUpdateTimeFrame = audio?.dataUpdateTimeFrame ?? 5000;

    this._webtranslateConfig.websiteTranslationUrl = webtranslate?.websiteTranslationUrl || window.location.origin + '/webtranslate/embedded?embeddedStyle=noUI';
    this._webtranslateConfig.logoLocation = webtranslate?.logoLocation || 'assets/webtranslate/tilde_logo.svg';
    this._webtranslateConfig.translatePagePath = webtranslate?.translatePagePath;
    this._webtranslateConfig.debug = webtranslate?.debug || false;
    this._webtranslateConfig.webLangAutodetect = webtranslate?.webLangAutodetect || true;
    this._webtranslateConfig.allowSuggestions = webtranslate?.allowSuggestions || false;
    this._webtranslateConfig.hidePopup = webtranslate?.hidePopup || false;

    this._apiV2Config.systemListUrl = apiV2Config?.systemListUrl ?? "api/translate/languageDirection";
    this._apiV2Config.translationUrl = apiV2Config?.translationUrl ?? "api/translate/text";
    this._apiV2Config.fileTranslationUrl = apiV2Config?.fileTranslationUrl ?? "api/translate/file";
    this._apiV2Config.grammarCheckUrl = apiV2Config?.grammarCheckUrl ?? "https://mt.cs.ut.ee/api/grammar";

  }
}

