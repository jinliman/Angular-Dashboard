import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceOptionComponent } from './price-option.component';

describe('PriceOptionComponent', () => {
  let component: PriceOptionComponent;
  let fixture: ComponentFixture<PriceOptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PriceOptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
