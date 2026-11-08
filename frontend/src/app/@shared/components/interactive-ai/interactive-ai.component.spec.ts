import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiBrain2Component } from '../ai-brain2/ai-brain2.component';
import { InteractiveAiComponent } from './interactive-ai.component';

describe('InteractiveAiComponent', () => {
  let component: InteractiveAiComponent;
  let fixture: ComponentFixture<InteractiveAiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InteractiveAiComponent, AiBrain2Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InteractiveAiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
