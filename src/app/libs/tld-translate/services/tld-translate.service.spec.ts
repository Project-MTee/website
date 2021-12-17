import { TestBed } from '@angular/core/testing';

import { TldTranslateService } from './tld-translate.service';

describe('TldTranslateService', () => {
  let service: TldTranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TldTranslateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
