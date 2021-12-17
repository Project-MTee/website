import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TldDomainListComponent } from './tld-domain-list.component';

describe('TldDomainListComponent', () => {
  let component: TldDomainListComponent;
  let fixture: ComponentFixture<TldDomainListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TldDomainListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TldDomainListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
