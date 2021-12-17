import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IVoiceToTextJob, IVoiceToTextStartJobRequestParams, VoiceToTextState } from '../../tld-common/models';
import { ITranscriptionUpdateModel } from '../models/transcription-update.model';
import { TldVoiceInputApiService } from './tld-voice-input-api.service';

@Injectable({
  providedIn: 'root'
})
export class TldVoiceInputService {

  activeJob: IVoiceToTextJob;
  isProcessing: boolean;

  private readonly timeoutMs = 1000;
  private lastTranscribtion: string;

  private readonly transcribtionTextUpdated: Subject<ITranscriptionUpdateModel> = new Subject();
  get onTranscribtionTextUpdated() { return this.transcribtionTextUpdated.asObservable(); }

  constructor(private readonly api: TldVoiceInputApiService) { }

  startTranscribtion(params: IVoiceToTextStartJobRequestParams) {
    this.isProcessing = true;
    this.api.startJob(params).subscribe((job) => {
      this.activeJob = job;
      this.lastTranscribtion = job.transcription;
      this.scheduleProgressCheckIfNecessary();
    })
  }

  stopProcessing() {
    if (this.isProcessing) {
      this.activeJob = null;
      this.isProcessing = false;
    }
  }

  private checkProgress() {
    if (!this.activeJob) {
      return;
    }

    this.api.getJobInfo(this.activeJob.jobId).subscribe((response) => {
      this.activeJob = response;
      const isCompleted = VoiceToTextState.COMPLETED === response.state;
      if ((response.transcription && this.lastTranscribtion !== response.transcription) || isCompleted) {
        this.transcribtionTextUpdated.next({ text: response.transcription, completed: isCompleted});
      }
      this.lastTranscribtion = response.transcription;
      this.scheduleProgressCheckIfNecessary();
    })
  }

  private scheduleProgressCheckIfNecessary() {
    if (this.activeJob.state === VoiceToTextState.COMPLETED) {
      this.isProcessing = false;
    }
    else {
      setTimeout(() => {
        this.checkProgress();
      }, this.timeoutMs);
    }
  }
}
