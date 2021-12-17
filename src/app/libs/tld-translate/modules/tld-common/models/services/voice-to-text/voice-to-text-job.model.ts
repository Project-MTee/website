import { VoiceToTextState } from "./voice-to-text-job-state.model";

// Different casing. Service will map to angular casing. 
export interface IVoiceToTextJobServerResponse {
    job_id: string;
    created_at: string;
    updated_at: string;
    language?: string;
    file_name: string;
    state: string;
    error_message?: string;
    transcription?: string;
}

export interface IVoiceToTextJob {
    jobId: string;
    createdAt: Date;
    updatedAt: Date;
    language?: string;
    fileName: string;
    state: VoiceToTextState;
    errorMessage?: string;
    transcription?: string;
}