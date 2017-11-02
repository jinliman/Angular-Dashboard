import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardMemberComponent } from './dashboard-member.component';

describe('DashboardMemberComponent', () => {
  let component: DashboardMemberComponent;
  let fixture: ComponentFixture<DashboardMemberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardMemberComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
