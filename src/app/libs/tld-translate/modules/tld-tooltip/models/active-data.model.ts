import { IDomainList } from './domain.model';
import { ILangListItem } from '../../tld-common/models/lang-list-item.model';
import { ISystem } from '../../tld-common/models/services/system/system.model';

/**
 * Interface describes active system
 */
export interface IActiveData {
  systemId?: string;
  sourceLang?: ILangListItem; 
  targetLang?: ILangListItem;
  sourceLangList?: Array<ILangListItem>;
  targetLangList?: Array<ILangListItem>;
  domains?: IDomainList;
  swapLangActive?: boolean;
  system?: ISystem;
  /**
   * Whether text/file should be retranslated on system change.
   * For example if domain is auto and system gets changed after api response, no retranslation needed.
   */
  retranslate?: boolean;
}
