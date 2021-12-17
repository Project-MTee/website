import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HighlightTreeComponent } from './highlight-tree.component';

describe('HighlightTreeComponent', () => {
  let component: HighlightTreeComponent;
  let fixture: ComponentFixture<HighlightTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HighlightTreeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HighlightTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
