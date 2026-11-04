import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoomScaleComponent } from './zoom-scale.component';

describe('ZoomScaleComponent', () => {
  let component: ZoomScaleComponent;
  let fixture: ComponentFixture<ZoomScaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ZoomScaleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ZoomScaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
