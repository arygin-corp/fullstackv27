import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataQualityPolicyComponent } from './data-quality-policy.component';

describe('DataQualityPolicyComponent', () => {
  let component: DataQualityPolicyComponent;
  let fixture: ComponentFixture<DataQualityPolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataQualityPolicyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataQualityPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
