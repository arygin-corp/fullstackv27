import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageRequestFormComponent } from './page-request-form.component';

describe('PageRequestFormComponent', () => {
  let component: PageRequestFormComponent;
  let fixture: ComponentFixture<PageRequestFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageRequestFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageRequestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
