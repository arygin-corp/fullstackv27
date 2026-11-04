import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataAccessRequestProcessFlowComponent } from './data-access-request-process-flow.component';

describe('DataAccessRequestProcessFlowComponent', () => {
  let component: DataAccessRequestProcessFlowComponent;
  let fixture: ComponentFixture<DataAccessRequestProcessFlowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataAccessRequestProcessFlowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataAccessRequestProcessFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
