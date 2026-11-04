import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubdomainsTwoComponent } from './subdomains-two.component';

describe('SubdomainsTwoComponent', () => {
  let component: SubdomainsTwoComponent;
  let fixture: ComponentFixture<SubdomainsTwoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubdomainsTwoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubdomainsTwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
