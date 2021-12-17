export interface IDomainList {
  domains: IDomain[];
  active: IDomain | undefined;
}
export interface IDomain {
  domain: string;
  title: string;
}
