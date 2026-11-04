import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagesMediaPostDetailsComponent } from './pages-media-post-details.component';

describe('PagesMediaPostDetailsComponent', () => {
  let component: PagesMediaPostDetailsComponent;
  let fixture: ComponentFixture<PagesMediaPostDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PagesMediaPostDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PagesMediaPostDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
