import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItddComponent } from './itdd.component';

describe('ItddComponent', () => {
  let component: ItddComponent;
  let fixture: ComponentFixture<ItddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
