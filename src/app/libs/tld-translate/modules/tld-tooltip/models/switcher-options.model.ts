import { IDomainList } from "./domain.model";
import { ILangListItem } from "../../tld-common/models/lang-list-item.model";
import { ISelectedLanguage } from "../../tld-common/models";

export interface ISwitcherTranslationOptions{
    domains: IDomainList;
    systemId: string;
    sourceLanguageList: ILangListItem[];
    source: ISelectedLanguage;
    targetLanguageList: ILangListItem[];
    target: ISelectedLanguage;
    swapActive: boolean;
}