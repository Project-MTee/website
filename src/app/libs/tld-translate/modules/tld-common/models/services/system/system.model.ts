export interface ISystemBase {
  sourceLanguage: string;
  targetLanguage: string;
  id: string;
  domain: string;
  // NEW TYPES NECESSARY.
  meta?: {[key:string]: string};
  title?: string;
}

export interface ISystem extends ISystemBase {
  getSystemMetaDataValue(key: string): string;
}

export class System implements ISystem {
  readonly sourceLanguage:string;
  readonly targetLanguage:string;
  readonly id: string;
  readonly domain: string;
  readonly meta: {[key:string]:string};
  readonly title: string;

  constructor(system: ISystemBase) {
    this.sourceLanguage = system.sourceLanguage;
    this.targetLanguage = system.targetLanguage;
    this.id = system.id;
    this.domain = system.domain;
    this.meta = system.meta;
    this.title = system.title;
  }

  getSystemMetaDataValue(key: string): string {
    return this.meta?.[key];
  }
}