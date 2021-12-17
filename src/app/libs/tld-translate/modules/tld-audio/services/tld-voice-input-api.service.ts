import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IVoiceToTextJob, IVoiceToTextJobServerResponse, IVoiceToTextStartJobRequestParams } from '../../tld-common/models';
import { TldTranslateConfigService } from '../../tld-common/services';

@Injectable({
  providedIn: 'root'
})
export class TldVoiceInputApiService {

  private get audioConfig() { return this.config.audioConfig; }

  constructor(private readonly http: HttpClient,
    private readonly config: TldTranslateConfigService) { }

  startJob(params: IVoiceToTextStartJobRequestParams): Observable<IVoiceToTextJob> {

    if (!this.audioConfig.audioApiUrl) {
      console.error("Speech API url not defined");
      throw null;
    }

    const formData: FormData = new FormData();
    formData.append("file", params.file);
    formData.append("langauge", params.language);
    return this.http.post<IVoiceToTextJobServerResponse>(this.audioConfig.audioApiUrl, formData).pipe(
      map(response => this.mapJob(response))
    )
  }

  getJobInfo(jobId: string) {
    return this.http.get<IVoiceToTextJobServerResponse>(`${this.audioConfig.audioApiUrl}/${jobId}`).pipe(
      map(response => this.mapJob(response))
    );
  }


  private mapJob(response: IVoiceToTextJobServerResponse): IVoiceToTextJob {
    // converts to VoiceToTextState, so it suits enum conventions.
    const state: any = response.state.toUpperCase().replace(/ /g, "_");
    return {
      createdAt: new Date(response.created_at),
      fileName: response.file_name,
      jobId: response.job_id,
      language: response.language,
      state,
      updatedAt: new Date(response.updated_at),
      errorMessage: response.error_message,
      transcription: response.transcription
    };
  }

}
