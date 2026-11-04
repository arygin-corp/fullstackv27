import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageChangelogComponent } from './page-changelog.component';

describe('PageChangelogComponent', () => {
  let component: PageChangelogComponent;
  let fixture: ComponentFixture<PageChangelogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageChangelogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageChangelogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
