import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductPopoverComponent } from './product-popover.component';

describe('ProductPopoverComponent', () => {
  let component: ProductPopoverComponent;
  let fixture: ComponentFixture<ProductPopoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductPopoverComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
