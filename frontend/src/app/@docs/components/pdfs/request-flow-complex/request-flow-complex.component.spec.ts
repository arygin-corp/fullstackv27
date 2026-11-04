import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestFlowComplexComponent } from './request-flow-complex.component';

describe('RequestFlowComplexComponent', () => {
  let component: RequestFlowComplexComponent;
  let fixture: ComponentFixture<RequestFlowComplexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequestFlowComplexComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestFlowComplexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
