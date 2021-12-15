import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataProtectionConditionsComponent } from './data-protection-conditions.component';

describe('DataProtectionConditionsComponent', () => {
  let component: DataProtectionConditionsComponent;
  let fixture: ComponentFixture<DataProtectionConditionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataProtectionConditionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataProtectionConditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
