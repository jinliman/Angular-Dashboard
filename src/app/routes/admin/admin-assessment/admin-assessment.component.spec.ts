import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAssessmentComponent } from './admin-assessment.component';

describe('AdminAssessmentComponent', () => {
  let component: AdminAssessmentComponent;
  let fixture: ComponentFixture<AdminAssessmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminAssessmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
