import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TldOpenCloseButtonComponent } from './open-close-button.component';

describe('OpenCloseButtonComponent', () => {
  let component: TldOpenCloseButtonComponent;
  let fixture: ComponentFixture<TldOpenCloseButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TldOpenCloseButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TldOpenCloseButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
