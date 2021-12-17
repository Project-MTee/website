import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TldTranslateTextComponent } from './tld-translate-text.component';

describe('TldTranslateTextComponent', () => {
  let component: TldTranslateTextComponent;
  let fixture: ComponentFixture<TldTranslateTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TldTranslateTextComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TldTranslateTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
