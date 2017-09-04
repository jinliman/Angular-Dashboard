import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QaBuilderComponent } from './qa-builder.component';

describe('QaBuilderComponent', () => {
  let component: QaBuilderComponent;
  let fixture: ComponentFixture<QaBuilderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QaBuilderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QaBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
