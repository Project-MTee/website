
export interface IFileTranslationStatusV2Response {
    id: string,
    createdAt: string,
    fileName: string,
    srcLang: string,
    trgLang: string,
    domain: string,
    status: string,
    substatus: string,
    segments: number,
    translatedSegments: number,
    files: [
        {
            id: string,
            category: string,
            extension: string,
            size: 0
        }
    ]
}