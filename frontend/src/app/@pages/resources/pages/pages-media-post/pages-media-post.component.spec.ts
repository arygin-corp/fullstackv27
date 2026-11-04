import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagesMediaPostComponent } from './pages-media-post.component';

describe('PagesMediaPostComponent', () => {
  let component: PagesMediaPostComponent;
  let fixture: ComponentFixture<PagesMediaPostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PagesMediaPostComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PagesMediaPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
