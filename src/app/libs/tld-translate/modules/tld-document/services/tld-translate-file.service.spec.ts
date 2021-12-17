import { TestBed } from '@angular/core/testing';

import { TldTranslateFileService } from './tld-translate-file.service';

describe('TldTranslateFileService', () => {
  let service: TldTranslateFileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TldTranslateFileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
