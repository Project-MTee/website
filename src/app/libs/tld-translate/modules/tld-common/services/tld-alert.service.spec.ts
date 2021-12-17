import { TestBed } from '@angular/core/testing';

import { TldAlertService } from './tld-alert.service';

describe('TldAlertService', () => {
  let service: TldAlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TldAlertService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
