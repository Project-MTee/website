import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TldRecordComponent } from './tld-record.component';

describe('TldRecordComponent', () => {
  let component: TldRecordComponent;
  let fixture: ComponentFixture<TldRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TldRecordComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TldRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
