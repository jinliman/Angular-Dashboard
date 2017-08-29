import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComfirmInvitationComponent } from './comfirm-invitation.component';

describe('ComfirmInvitationComponent', () => {
  let component: ComfirmInvitationComponent;
  let fixture: ComponentFixture<ComfirmInvitationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComfirmInvitationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComfirmInvitationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
