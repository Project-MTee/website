import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TldLangListComponent } from './tld-lang-list.component';

describe('TldLangListComponent', () => {
  let component: TldLangListComponent;
  let fixture: ComponentFixture<TldLangListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TldLangListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TldLangListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
