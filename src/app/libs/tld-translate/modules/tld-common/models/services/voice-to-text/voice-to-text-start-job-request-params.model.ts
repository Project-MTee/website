/**
 * Interface that is used to start speech-to-text job.
 */
export interface IVoiceToTextStartJobRequestParams{
    file: Blob;
    language: string;
}