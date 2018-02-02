import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiTermComponent } from './api-term.component';

describe('ApiTermComponent', () => {
  let component: ApiTermComponent;
  let fixture: ComponentFixture<ApiTermComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApiTermComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApiTermComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
