import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductAssocationsComponent } from './product-assocations.component';

describe('ProductAssocationsComponent', () => {
  let component: ProductAssocationsComponent;
  let fixture: ComponentFixture<ProductAssocationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductAssocationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductAssocationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
