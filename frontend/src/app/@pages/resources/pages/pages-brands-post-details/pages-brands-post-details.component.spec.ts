import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagesBrandsPostDetailsComponent } from './pages-brands-post-details.component';

describe('PagesBrandsPostDetailsComponent', () => {
  let component: PagesBrandsPostDetailsComponent;
  let fixture: ComponentFixture<PagesBrandsPostDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PagesBrandsPostDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PagesBrandsPostDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
