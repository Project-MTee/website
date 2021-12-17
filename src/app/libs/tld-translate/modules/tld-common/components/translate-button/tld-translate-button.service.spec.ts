import { TestBed } from '@angular/core/testing';

import { TldTranslateButtonService } from './tld-translate-button.service';


describe('TldTranslateButtonService', () => {
  let service: TldTranslateButtonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TldTranslateButtonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
