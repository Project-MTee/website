import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TldTranslateBodyComponent } from './tld-translate-body.component';

describe('TldTranslateBodyComponent', () => {
  let component: TldTranslateBodyComponent;
  let fixture: ComponentFixture<TldTranslateBodyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TldTranslateBodyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TldTranslateBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
