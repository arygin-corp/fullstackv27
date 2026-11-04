import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagesPoliciesComponent } from './pages-policies.component';

describe('PagesPoliciesComponent', () => {
  let component: PagesPoliciesComponent;
  let fixture: ComponentFixture<PagesPoliciesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PagesPoliciesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PagesPoliciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
