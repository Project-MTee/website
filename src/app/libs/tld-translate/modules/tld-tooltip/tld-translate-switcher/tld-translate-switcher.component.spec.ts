import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TldTranslateSwitcherComponent } from './tld-translate-switcher.component';

describe('TldTranslateSwitcherComponent', () => {
  let component: TldTranslateSwitcherComponent;
  let fixture: ComponentFixture<TldTranslateSwitcherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TldTranslateSwitcherComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TldTranslateSwitcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
