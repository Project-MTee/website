import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TldTranslateFileComponent } from './tld-translate-file.component';

describe('TldTranslateFileComponent', () => {
  let component: TldTranslateFileComponent;
  let fixture: ComponentFixture<TldTranslateFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TldTranslateFileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TldTranslateFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
