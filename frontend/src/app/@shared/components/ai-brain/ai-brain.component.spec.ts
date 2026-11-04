import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiBrainComponent } from './ai-brain.component';

describe('AiBrainComponent', () => {
  let component: AiBrainComponent;
  let fixture: ComponentFixture<AiBrainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AiBrainComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AiBrainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
