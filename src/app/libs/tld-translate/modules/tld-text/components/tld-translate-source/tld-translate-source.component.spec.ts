import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TldTranslateSourceComponent } from './tld-translate-source.component';

describe('TldTranslateSourceComponent', () => {
  let component: TldTranslateSourceComponent;
  let fixture: ComponentFixture<TldTranslateSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TldTranslateSourceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TldTranslateSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
