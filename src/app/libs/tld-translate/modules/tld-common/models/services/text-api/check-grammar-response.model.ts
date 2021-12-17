export interface ICheckGrammarResponse{
    start:number;
    end: number;
    text: string;
    replacements?: string[];
}