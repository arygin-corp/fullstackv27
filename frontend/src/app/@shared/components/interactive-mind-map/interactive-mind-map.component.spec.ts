import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractiveMindMapComponent } from './interactive-mind-map.component';

describe('InteractiveMindMapComponent', () => {
  let component: InteractiveMindMapComponent;
  let fixture: ComponentFixture<InteractiveMindMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InteractiveMindMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InteractiveMindMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
