export interface IAudioLocalizationModel {
    /** Cancel button for record component. */
    CANCEL?: string;
    /** Text to be shown between cancel and stop buttons when recording. */
    DESCRIBE_STATE_RECORDING?: string;
    /** Text to be shown between cancel and stop buttons when processing record. */
    DESCRIBE_STATE_PROCESSING?: string;
    /** Stop recording button tooltip. */
    STOP?:string;
    /** Start recording button tooltip. */
    START?: string;
    /**  Tooltip if no mic available. */
    MIC_NOT_FOUND?: string;
}