import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestedAiComponent } from './suggested-ai.component';

describe('SuggestedAiComponent', () => {
  let component: SuggestedAiComponent;
  let fixture: ComponentFixture<SuggestedAiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SuggestedAiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SuggestedAiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
