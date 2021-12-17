import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TldCloseButtonComponent } from './close-button.component';

describe('CloseButtonComponent', () => {
  let component: TldCloseButtonComponent;
  let fixture: ComponentFixture<TldCloseButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TldCloseButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TldCloseButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
