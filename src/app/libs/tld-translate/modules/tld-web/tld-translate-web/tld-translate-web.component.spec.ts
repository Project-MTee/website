import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TldTranslateWebsiteComponent } from './tld-translate-web.component';

describe('TldTranslateWebsiteComponent', () => {
  let component: TldTranslateWebsiteComponent;
  let fixture: ComponentFixture<TldTranslateWebsiteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TldTranslateWebsiteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TldTranslateWebsiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
