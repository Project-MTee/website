import { SafeHtml } from '@angular/platform-browser';
import { TranslationStatuss } from '.';
import { IFileMeta } from '../../tld-common/models';

export interface ITranslationFile {
  isDownloading?: boolean;
  isFilePreviewLoaded?: boolean;
  name: string;
  tmpName?: string;
  translating?: boolean;
  translationStarted?: boolean;
  sourcePreview?: SafeHtml;
  progress?: number;
  downloadAvailable?: boolean
  translatedPreview?: SafeHtml;
  availableExtensions?: IFileMeta[];
  translationStatuss?: TranslationStatuss;
  filePreviewProgress?: number;
  sourcePreviewHasHtml?: boolean;
  sourceDownloadAvailable?: boolean;
  id?: string;
  /** Necessary for api v2, to know if file needs to be deleted from server. */
  translationStartedOnServer?: boolean;
}
