import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataSecurityProcessComponent } from './data-security-process.component';

describe('DataSecurityProcessComponent', () => {
  let component: DataSecurityProcessComponent;
  let fixture: ComponentFixture<DataSecurityProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataSecurityProcessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataSecurityProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
