import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TldTranslateButtonComponent } from './translate-button.component';

describe('DownloadButtonComponent', () => {
  let component: TldTranslateButtonComponent;
  let fixture: ComponentFixture<TldTranslateButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TldTranslateButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TldTranslateButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
