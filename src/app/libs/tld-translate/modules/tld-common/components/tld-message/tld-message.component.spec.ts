import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TldMessageComponent } from './tld-message.component';

describe('TldMessageComponent', () => {
  let component: TldMessageComponent;
  let fixture: ComponentFixture<TldMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TldMessageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TldMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
