import { TestBed } from '@angular/core/testing';

import { TldHighlightService } from './tld-highlight.service';

describe('TldHighlightService', () => {
  let service: TldHighlightService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TldHighlightService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
