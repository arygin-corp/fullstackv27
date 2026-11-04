import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagePostDetailsComponent } from './page-post-details.component';

describe('PagePostDetailsComponent', () => {
  let component: PagePostDetailsComponent;
  let fixture: ComponentFixture<PagePostDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PagePostDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PagePostDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
