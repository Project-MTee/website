import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebtranslateDisclaimerComponent } from './webtranslate-disclaimer.component';

describe('WebtranslateDisclaimerComponent', () => {
  let component: WebtranslateDisclaimerComponent;
  let fixture: ComponentFixture<WebtranslateDisclaimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WebtranslateDisclaimerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WebtranslateDisclaimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
