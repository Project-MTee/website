export interface IGrammarCorrectionV2{
    span: {start:number, end:number;};
    replacements: {value:string}[];
}