import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagesDocumentsPostComponent } from './pages-documents-post.component';

describe('PagesDocumentsPostComponent', () => {
  let component: PagesDocumentsPostComponent;
  let fixture: ComponentFixture<PagesDocumentsPostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PagesDocumentsPostComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PagesDocumentsPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
