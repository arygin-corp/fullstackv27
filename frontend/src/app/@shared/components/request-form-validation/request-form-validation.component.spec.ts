import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestFormValidationComponent } from './request-form-validation.component';

describe('RequestFormValidationComponent', () => {
  let component: RequestFormValidationComponent;
  let fixture: ComponentFixture<RequestFormValidationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequestFormValidationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestFormValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
