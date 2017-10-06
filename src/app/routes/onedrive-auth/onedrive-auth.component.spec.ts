import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnedriveAuthComponent } from './onedrive-auth.component';

describe('OnedriveAuthComponent', () => {
  let component: OnedriveAuthComponent;
  let fixture: ComponentFixture<OnedriveAuthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnedriveAuthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnedriveAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
