import { TestBed } from '@angular/core/testing';

import { TldTranslateTextApiV2Service } from './tld-translate-text-api-v2.service';

describe('TldTranslateTextApiV2Service', () => {
  let service: TldTranslateTextApiV2Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TldTranslateTextApiV2Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
