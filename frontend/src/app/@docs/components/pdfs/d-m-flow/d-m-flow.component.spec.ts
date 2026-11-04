import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DMFlowComponent } from './d-m-flow.component';

describe('DMFlowComponent', () => {
  let component: DMFlowComponent;
  let fixture: ComponentFixture<DMFlowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DMFlowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DMFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
