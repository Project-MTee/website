import { ILocalization } from "./models/localization.model";

export const i18n_en: ILocalization = {
  "APP_NAME": "Tilde MT",
  "TLD_TRANSLATE": {
    "CANCEL_TRANSLATION": "Cancel",
    "DOC_WORD_CNT_LIMIT_MSG": "You have exceeded your free translation limit ({{wordCount}} words). Become a registered user to receive a complete translation. <a href=\"{{registerLink}}\">Request access</a>",
    "DOWNLOAD_TRANSLATED": "Download translated",
    "DOMAINS_ARIA_LABEL": "Domains",
    "ERROR_NO_SYSTEMS_LOADED": "No systems were loaded.",
    "FILE_TANSLATION_STATUSS_INITIALIZING": "Initializing translation process...",
    "FILE_TANSLATION_STATUSS_EXTRACTING": "Extracting translatable content...",
    "FILE_TANSLATION_STATUSS_WAITING": "Starting translator...",
    "FILE_TANSLATION_STATUSS_TRANSLATING": "Translating...",
    "FILE_TANSLATION_STATUSS_SAVING": "Saving translation...",
    "FILE_TANSLATION_STATUSS_COMPLETED": "",
    "FILE_TANSLATION_STATUSS_ERROR": "",
    "FILE_TANSLATION_STATUSS_QUEUING": "Translation is starting...",
    "FILE_TARGET_PREVIEW_MESSAGE": "This is a preview of the translated document, please download to receive a complete translation.",
    "FILE_UPLOAD_EMPTY": "The uploaded file \"{{fileName}}\" is empty. Please select a file with content.",
    "FILE_UPLOAD_MAX_SIZE": "The uploaded file \"{{fileName}}\" too big. Maximum size {{maxSizeMB}}MB",
    "FILE_UPLOAD_UNSUPPORTED_FORMAT": "The uploaded file \"{{fileName}}\" format is not recognized. Translation is supported for these document formats: {{formats}}.",
    "FROM": "From:",
    "PREPARING_TRANSLATION": "Translation is starting",
    "SOURCE_TOOLTIP": "Enter the text you would like to translate.",
    "TARGET_DESCRIPTION": "Machine translation allows to understand the meaning of a source text, but cannot substitute a human translation.",
    "TO": "To:",
    "TEXT_COPIED": "Translation copied",
    "TOOLTIP_ACTION": "Translate",
    "UPLOAD_FILE_BUTTON": "+ Upload or drag a file"
  },
  "ERRORS": {
    "ERROR_DEFAULT": "An unexpected error occurred. Please try again. If the problem continues, please contact <a href=\"mailto:{{email}}\"><strong>support</strong></a>.",
    "E_FAILED_IN_TRANSLATION": "Error occurred while translating.",
    "MAX_CHAR_LENGTH": "You have entered {{totalSymbols}} characters, but maximum allowed is {{maxCharLength}}. Your text will be trimmed.",
    "E_504": "Your action has timed out.",
    "CANT_START_RECORDING": "Unable to start recording!",
    "MIC_NOT_ALLOWED": "You have denied access to microphone. You can change it in browsers settings.",
    "MAX_SIZE_EXCEEDED": "You have exceeded maximum size ({{maxSizeMb}}MB) for speech input. Your record is stopped and sent to processing.",
    "NO_TEXT_RECOGNIZED": "No speech could be recognized. Please check your microphone and try again.",
    "FILE_TRANSLATION_SUBSTATUS": {
      "BAD_FILE_ERROR": "Failed to translate the file. File might be corrupted.",
      "NO_TEXT_EXTRACTED_ERROR": "Failed to extract any text. File might be empty.",
      "TRACK_CHANGES_ENABLED_ERROR": " Failed to translate the file. Please disable Track changes in your document and try again.",
      "UNKNOWN_FILE_TYPE_ERROR": "File type not recognized."
    }
  },
  "LANGUAGES": {
    "LV": "Latvian",
    "ET": "Estonian",
    "DA": "Danish",
    "FI": "Finnish",
    "IS": "Icelandic",
    "LT": "Lithuanian",
    "NB": "Norwegian",
    "SV": "Swedish",
    "BE": "Belorussian",
    "BG": "Bulgarian",
    "CS": "Czech",
    "HU": "Hungarian",
    "RU": "Russian",
    "MO": "Moldavian",
    "PL": "Polish",
    "SK": "Slovak",
    "UK": "Ukrainian",
    "NL": "Dutch",
    "EN": "English",
    "FR": "French",
    "DE": "German",
    "GA": "Irish",
    "EL": "Greek",
    "IT": "Italian",
    "MT": "Maltese",
    "PT": "Portuguese",
    "SR": "Serbian",
    "SL": "Slovenian",
    "ES": "Spanish",
    "ZH": "Chinese",
    "JA": "Japanese",
    "KO": "Korean",
    "TR": "Turkish",
    "HR": "Croatian",
    "RO": "Romanian"
  },
  "ARIA_LABELS": {
    "CLOSE_BUTTON": "Clear",
    "CLEAR_NOTIFICATION": "Close alert",
    "CLEAR_SOURCE": "Clear entered text",
    "CLOSE_DIALOG": "Close dialog",
    "CLEAR_FILES": "Clear uploaded files",
    "SHOW_EXTENSIONS": "Show other download options",
    "COPY": "Copy to clipboard",
    "OPEN_IN_NEW": "Open in new tab",
    "SWAP_LANGUAGES": "Swap languages",
    "OTHER_LANGUAGES_TRIGGER": "Show other languages"
  },
  "TOOLTIPS": {
    "COPY": "Copy to clipboard",
    "SWAP_LANGUAGES": "Swap languages"
  },
  "WEBTRANSLATE": {
    "BACK": "Back to Translator",
    "ADDRESS": "Address",
    "LOAD_PAGE": "Load page",
    "RESTORE": "Restore",
    "CANCEL": "Cancel"
  },
  "DOMAINS": {
    "OPEN_LIST_ARIA_LABEL": "Open domain list",
    "TITLE": "Domain:",
    "LAW": "Law",
    "DYNAMIC_LEARNING": "Dynamic learning",
    "BUSINESS": "Business",
    "GENERAL": "General",
    "AUTO": "Autodetect"
  },
  "GRAMMAR_CHECK_MENU": {
    "TITLE": "Consider changing to:"
  },
  "AUDIO": {
    "CANCEL": "Cancel",
    "DESCRIBE_STATE_RECORDING": "Please speak to record...",
    "DESCRIBE_STATE_PROCESSING": "Processing...",
    "MIC_NOT_FOUND": "Microphone not found",
    "STOP": "Stop recording",
    "START": "Start recording"
  }
}
