import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebTranslateComponent } from './web-translate.component';

describe('WebTranslateComponent', () => {
  let component: WebTranslateComponent;
  let fixture: ComponentFixture<WebTranslateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WebTranslateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WebTranslateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
