import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractiveAiComponent } from './interactive-ai.component';

describe('InteractiveAiComponent', () => {
  let component: InteractiveAiComponent;
  let fixture: ComponentFixture<InteractiveAiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InteractiveAiComponent ]
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
