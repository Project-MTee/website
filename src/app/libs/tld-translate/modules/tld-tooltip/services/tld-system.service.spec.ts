import { TestBed } from '@angular/core/testing';

import { TldSystemService } from './tld-system.service';

describe('TldSystemService', () => {
  let service: TldSystemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TldSystemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
