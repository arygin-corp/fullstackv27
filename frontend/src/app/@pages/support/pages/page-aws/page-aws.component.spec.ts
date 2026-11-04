import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageAwsComponent } from './page-aws.component';

describe('PageAwsComponent', () => {
  let component: PageAwsComponent;
  let fixture: ComponentFixture<PageAwsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageAwsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageAwsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
