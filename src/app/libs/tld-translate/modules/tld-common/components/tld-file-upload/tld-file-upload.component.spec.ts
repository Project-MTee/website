import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TldFileUploadComponent } from './tld-file-upload.component';

describe('TldTranslateFileComponent', () => {
  let component: TldFileUploadComponent;
  let fixture: ComponentFixture<TldFileUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TldFileUploadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TldFileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
