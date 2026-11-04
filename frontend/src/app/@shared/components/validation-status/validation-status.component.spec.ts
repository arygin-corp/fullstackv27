import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationStatusComponent } from './validation-status.component';

describe('ValidationStatusComponent', () => {
  let component: ValidationStatusComponent;
  let fixture: ComponentFixture<ValidationStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValidationStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidationStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
