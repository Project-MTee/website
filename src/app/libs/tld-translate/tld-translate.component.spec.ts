import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TldTranslateComponent } from './tld-translate.component';

describe('TldTranslateComponent', () => {
  let component: TldTranslateComponent;
  let fixture: ComponentFixture<TldTranslateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TldTranslateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TldTranslateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
