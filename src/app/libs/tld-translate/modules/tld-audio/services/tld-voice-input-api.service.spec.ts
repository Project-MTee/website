import { TestBed } from '@angular/core/testing';

import { TldVoiceInputApiService } from './tld-voice-input-api.service';

describe('TldVoiceInputApiService', () => {
  let service: TldVoiceInputApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TldVoiceInputApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
