import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagesBrandsComponent } from './pages-brands.component';

describe('PagesBrandsComponent', () => {
  let component: PagesBrandsComponent;
  let fixture: ComponentFixture<PagesBrandsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PagesBrandsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PagesBrandsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
