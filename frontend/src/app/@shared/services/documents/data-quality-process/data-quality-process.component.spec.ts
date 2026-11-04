import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataQualityProcessComponent } from './data-quality-process.component';

describe('DataQualityProcessComponent', () => {
  let component: DataQualityProcessComponent;
  let fixture: ComponentFixture<DataQualityProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataQualityProcessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataQualityProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
