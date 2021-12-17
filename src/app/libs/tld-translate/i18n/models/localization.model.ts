import { IAriaLabelsLocalization } from "./aria-labels-localization.model";
import { IAudioLocalizationModel } from "./audio-localization.model";
import { IDomainsLocalization } from "./domains-localization.model";
import { IErrorsLocalization } from "./errors/errors-localization.model";
import { IGrammarCheckMenuLocalization } from "./grammar-check-menu-localization.model";
import { ILanguagesLocalization } from "./languages-localization.model";
import { ITldTranslateLocalization } from "./tld-translate-localization.model";
import { ITooltipsLocalization } from "./tooltips-localization.model";
import { IWebTranslateLocalization } from "./web-translate-localization.model";

export interface ILocalization {
    APP_NAME?: string;
    AUDIO?: IAudioLocalizationModel;
    TLD_TRANSLATE?: ITldTranslateLocalization;
    ERRORS?: IErrorsLocalization;
    LANGUAGES?: ILanguagesLocalization;
    ARIA_LABELS?: IAriaLabelsLocalization;
    TOOLTIPS?: ITooltipsLocalization;
    WEBTRANSLATE?: IWebTranslateLocalization;
    DOMAINS?: IDomainsLocalization;
    GRAMMAR_CHECK_MENU?: IGrammarCheckMenuLocalization;
}