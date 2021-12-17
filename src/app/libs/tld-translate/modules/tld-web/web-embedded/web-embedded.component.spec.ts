import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebEmbeddedComponent } from './web-embedded.component';

describe('WebEmbeddedComponent', () => {
  let component: WebEmbeddedComponent;
  let fixture: ComponentFixture<WebEmbeddedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebEmbeddedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebEmbeddedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
