import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DrlComponent } from './drl.component';

describe('DrlComponent', () => {
  let component: DrlComponent;
  let fixture: ComponentFixture<DrlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DrlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
