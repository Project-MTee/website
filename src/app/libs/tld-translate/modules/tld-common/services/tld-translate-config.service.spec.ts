import { TestBed } from '@angular/core/testing';

import { TldTranslateConfigService } from './config.service';

describe('ConfigService', () => {
  let service: TldTranslateConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TldTranslateConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
