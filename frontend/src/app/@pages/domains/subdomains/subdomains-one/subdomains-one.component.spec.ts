import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubdomainsOneComponent } from './subdomains-one.component';

describe('SubdomainsOneComponent', () => {
  let component: SubdomainsOneComponent;
  let fixture: ComponentFixture<SubdomainsOneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubdomainsOneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubdomainsOneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
