import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextareaWithBackgroundComponent } from './textarea-with-background.component';

describe('TextareaWithBackgroundComponent', () => {
  let component: TextareaWithBackgroundComponent;
  let fixture: ComponentFixture<TextareaWithBackgroundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TextareaWithBackgroundComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TextareaWithBackgroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
