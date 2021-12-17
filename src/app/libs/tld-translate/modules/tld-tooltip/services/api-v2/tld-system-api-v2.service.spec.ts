import { TestBed } from '@angular/core/testing';

import { TldSystemApiV2Service } from './tld-system-api-v2.service';

describe('TldSystemApiV2Service', () => {
  let service: TldSystemApiV2Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TldSystemApiV2Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
