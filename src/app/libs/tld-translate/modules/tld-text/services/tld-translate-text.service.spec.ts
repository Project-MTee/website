import { TestBed } from '@angular/core/testing';

import { TldTranslateTextService } from './tld-translate-text.service';

describe('TldTranslateTextService', () => {
  let service: TldTranslateTextService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TldTranslateTextService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
