import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagesProcessesComponent } from './pages-processes.component';

describe('PagesProcessesComponent', () => {
  let component: PagesProcessesComponent;
  let fixture: ComponentFixture<PagesProcessesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PagesProcessesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PagesProcessesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
