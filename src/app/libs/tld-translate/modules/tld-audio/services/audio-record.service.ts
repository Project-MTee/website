import { EventEmitter, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AudioErrorCase } from '../models/audio-error-case.model';

declare var MediaRecorder: any;

@Injectable({
  providedIn: 'root'
})
export class AudioRecordService {
  private blobType: string;
  private readonly defaultBlobType = "audio/wav";
  private chunks: Array<any> = [];
  protected recorderEnded = new EventEmitter();
  private recorder: any;
  //NodeJs.Timeout?
  private timerRef: any;

  private recordTimeSeconds: number;

  private _recordTimeDate: Date;
  get recordTimeDate() { return this._recordTimeDate; }

  private _onRecordingStatusChange: Subject<boolean> = new Subject();
  get onRecordingStatusChange() { return this._onRecordingStatusChange.asObservable(); }

  private _onRecordStart: Subject<any> = new Subject();
  get onRecordStart() { return this._onRecordStart.asObservable(); }

  private _onError: Subject<any> = new Subject();
  get onError() { return this._onError.asObservable(); }

  get isRecording() { return this._isRecording; }
  private _isRecording: boolean;

  private static guc() {
    return navigator.mediaDevices.getUserMedia({ audio: true });
  }

  private maxFileSizeBytes: number;
  private currentFileSizeBytes: number;

  getUserContent() {
    return AudioRecordService.guc();
  }

  startRecording(dataUpdateTimeFrame: number, maxFileSizeInBytes: number, type?: string) {
    this.currentFileSizeBytes = 0;
    this.maxFileSizeBytes = maxFileSizeInBytes;
    this._recordTimeDate = new Date(0, 0, 0, 0, 0, 0);
    this.blobType = type;
    if (this._isRecording) {
      this.throwError(AudioErrorCase.ALREADY_RECORDING);
    }

    AudioRecordService.guc().then((mediaStream) => {
      this._onRecordStart.next();
      this.recordTimeSeconds = 0;
      this.recorder = new MediaRecorder(mediaStream);
      this.addListeners();
      this.recorder.start(dataUpdateTimeFrame);
      this.timerRef = setInterval(() => {
        this.recordTimeSeconds++;
        // New date every time, so that angular date pipe updates in ui
        this._recordTimeDate = new Date(0, 0, 0, 0, 0, this.recordTimeSeconds);
      }, 1000)

      this.toggleRecordingStatus(true);
    }).catch((error: DOMException) => {
      if (error.name === "NotAllowedError") {
        this.throwError(AudioErrorCase.MIC_NOT_ALLOWED);
      }
      else {
        this.throwError(AudioErrorCase.CANT_START_RECORDING);
      }
    });;
  }

  stopRecording() {
    return new Promise((resolve, reject) => {
      this.recorderEnded.subscribe((blob) => {
        this.toggleRecordingStatus(false);
        if (this.timerRef) {
          clearInterval(this.timerRef);
        }
        resolve(blob);
      }, _ => {
        this.throwError(AudioErrorCase.RECORDER_TIMEOUT);
        reject(AudioErrorCase.RECORDER_TIMEOUT);
      });
      this.recorder.stop();
    }).catch(() => {
      this.throwError(AudioErrorCase.USER_CONSENT_FAILED);
    });
  }

  private addListeners() {
    this.recorder.addEventListener('dataavailable', event => {
      this.appendToChunks(event);
    });

    this.recorder.addEventListener('stop', () => {
      this.recordingStopped();
    });
  }

  private appendToChunks = (event: any) => {
    this.chunks.push(event.data);
    this.currentFileSizeBytes += event.data.size;

    if (this.recorder.state !== "inactive") {
      if (this.maxFileSizeBytes && this.maxFileSizeBytes < this.currentFileSizeBytes) {
        this.throwError(AudioErrorCase.MAX_SIZE_EXCEEDED);
      }
    }
  };

  private recordingStopped = () => {
    const blob = new Blob(this.chunks, { type: this.blobType ?? this.defaultBlobType });
    this.blobType = null;
    this.chunks = [];
    this.recorderEnded.emit(blob);
    this.clear();
  };

  private clear() {
    this.recorder = null;
    this.chunks = [];
  }

  private toggleRecordingStatus(isRecording: boolean) {
    this._isRecording = isRecording;
    this._onRecordingStatusChange.next(this._isRecording);
  }

  private throwError(code: AudioErrorCase) {
    this._onError.next(code);
  }
}