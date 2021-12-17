import { TestBed } from '@angular/core/testing';

import { TldVoiceInputService } from './tld-voice-input.service';

describe('TldVoiceInputService', () => {
  let service: TldVoiceInputService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TldVoiceInputService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
