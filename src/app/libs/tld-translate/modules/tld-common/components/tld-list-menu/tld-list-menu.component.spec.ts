import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TldListMenuComponent } from './tld-list-menu.component';

describe('TldListMenuComponent', () => {
  let component: TldListMenuComponent;
  let fixture: ComponentFixture<TldListMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TldListMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TldListMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
