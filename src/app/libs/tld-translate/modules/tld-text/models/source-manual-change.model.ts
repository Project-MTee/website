export interface ISourceManualChangeEvent {
    /** Whether systems should be swapped */
    swapSystems?: boolean;
    /** New source text */
    phrase: string;
    /** If not necessary to automatically retranslate. */
    disableAutomaticTranslation?: boolean;
  }