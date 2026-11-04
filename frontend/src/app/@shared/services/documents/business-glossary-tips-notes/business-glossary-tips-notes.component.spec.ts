import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessGlossaryTipsNotesComponent } from './business-glossary-tips-notes.component';

describe('BusinessGlossaryTipsNotesComponent', () => {
  let component: BusinessGlossaryTipsNotesComponent;
  let fixture: ComponentFixture<BusinessGlossaryTipsNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessGlossaryTipsNotesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessGlossaryTipsNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
