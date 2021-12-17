import { TestBed } from '@angular/core/testing';

import { FileApiV2Service } from './file-api-v2.service';

describe('FileApiV2Service', () => {
  let service: FileApiV2Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileApiV2Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
