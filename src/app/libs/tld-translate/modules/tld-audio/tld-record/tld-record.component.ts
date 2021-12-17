import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { Common } from '../../tld-common/models';
import { TldAlertService, TldTranslateConfigService } from '../../tld-common/services';
import { TldSystemService } from '../../tld-tooltip/services';
import { AudioErrorCase } from '../models';
import { AudioRecordService } from '../services/audio-record.service';
import { TldVoiceInputService } from '../services/tld-voice-input.service';

@Component({
  selector: 'tld-record',
  templateUrl: './tld-record.component.html',
  styleUrls: ['./tld-record.component.scss']
})
export class TldRecordComponent implements OnInit, OnDestroy {

  get isRecording() {
    return this.audioRecorderService.isRecording;
  }

  get recordTimeDate() { return this.audioRecorderService.recordTimeDate; }
  get isProcessing() { return this.voiceProcessingService.isProcessing; }

  hasAnyMicrophone: boolean;

  /**
   * Successfuly recorded BLOB
   */
  @Output() record: EventEmitter<Blob> = new EventEmitter<Blob>();

  private recordErrorSubscription: Subscription;

  constructor(private readonly audioRecorderService: AudioRecordService,
    private readonly systemService: TldSystemService,
    private readonly configService: TldTranslateConfigService,
    private readonly voiceProcessingService: TldVoiceInputService,
    private readonly alert: TldAlertService) {
  }

  ngOnInit() {
    this.recordErrorSubscription = this.audioRecorderService.onError.subscribe((error: AudioErrorCase) => {
      if (error === AudioErrorCase.MAX_SIZE_EXCEEDED) {
        this.alert.unhandeledError({ ErrorCode: error }, { maxSizeMb: Common.bytesToMb(this.configService.audioConfig.audioMaxSizeBytes) })
        this.stopRecording();
      }
      else {
        this.alert.unhandeledError({ ErrorCode: error });
      }
    })

    this.findMic();
  }

  ngOnDestroy() {
    this.recordErrorSubscription.unsubscribe();
  }

  startRecording() {
    this.audioRecorderService.startRecording(this.configService.audioConfig.dataUpdateTimeFrame, this.configService.audioConfig.audioMaxSizeBytes);
  }

  stopRecording() {
    this.audioRecorderService.stopRecording().then((output: Blob) => {
      this.record.next(output);
      this.processVoiceRecord(output);
    });
  }

  cancel() {
    if (this.audioRecorderService.isRecording) {
      this.audioRecorderService.stopRecording();
    }
    if (this.voiceProcessingService.isProcessing) {
      this.voiceProcessingService.stopProcessing()
    }
  }

  processVoiceRecord(file: Blob) {
    const language = this.systemService.getActiveSystemObj().sourceLanguage;
    this.voiceProcessingService.startTranscribtion({ file, language });
  }

  private findMic() {
    navigator.mediaDevices.enumerateDevices().then((devices: MediaDeviceInfo[]) => {
      this.hasAnyMicrophone = false;
      for (const device of devices) {
        if (device.kind === "audioinput") {
          this.hasAnyMicrophone = true;
          return;
        }
      }
    });
  }
}
