import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ITComponent } from './it.component';

describe('ITComponent', () => {
  let component: ITComponent;
  let fixture: ComponentFixture<ITComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ITComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ITComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
