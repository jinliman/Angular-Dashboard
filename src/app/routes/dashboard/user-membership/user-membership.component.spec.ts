import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserMembershipComponent } from './user-membership.component';

describe('UserMembershipComponent', () => {
  let component: UserMembershipComponent;
  let fixture: ComponentFixture<UserMembershipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserMembershipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserMembershipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
