import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagesPoliciesDetailsComponent } from './pages-policies-details.component';

describe('PagesPoliciesDetailsComponent', () => {
  let component: PagesPoliciesDetailsComponent;
  let fixture: ComponentFixture<PagesPoliciesDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PagesPoliciesDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PagesPoliciesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
