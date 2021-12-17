export interface ITldAudioConfig {
    /** Url for api that returns text from audio input */
    audioApiUrl?: string;
    /** Maximum size for audio file */
    audioMaxSizeBytes?: number;
    /** Allows audio text input. In UI microphone button gets displayed near file upload.  */
    audioTextInput?: boolean;
    /** Array of languages for which audio input is supported. */
    sourceLanguages?: string[];
    /** How often should file size be checked. Value must be in milliseconds. */
    dataUpdateTimeFrame?: number
}