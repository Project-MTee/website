import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TldLoaderComponent } from './tld-loader.component';

describe('TldLoaderComponent', () => {
  let component: TldLoaderComponent;
  let fixture: ComponentFixture<TldLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TldLoaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TldLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
