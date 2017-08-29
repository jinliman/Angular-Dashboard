import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetLayoutComponent } from './asset-layout.component';

describe('AssetLayoutComponent', () => {
  let component: AssetLayoutComponent;
  let fixture: ComponentFixture<AssetLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
