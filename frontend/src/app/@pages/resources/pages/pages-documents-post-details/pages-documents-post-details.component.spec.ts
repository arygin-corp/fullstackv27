import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagesDocumentsPostDetailsComponent } from './pages-documents-post-details.component';

describe('PagesDocumentsPostDetailsComponent', () => {
  let component: PagesDocumentsPostDetailsComponent;
  let fixture: ComponentFixture<PagesDocumentsPostDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PagesDocumentsPostDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PagesDocumentsPostDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
