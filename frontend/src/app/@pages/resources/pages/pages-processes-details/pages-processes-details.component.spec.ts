import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagesProcessesDetailsComponent } from './pages-processes-details.component';

describe('PagesProcessesDetailsComponent', () => {
  let component: PagesProcessesDetailsComponent;
  let fixture: ComponentFixture<PagesProcessesDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PagesProcessesDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PagesProcessesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
