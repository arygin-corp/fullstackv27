import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagesMindMapComponent } from './pages-mind-map.component';

describe('PagesMindMapComponent', () => {
  let component: PagesMindMapComponent;
  let fixture: ComponentFixture<PagesMindMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PagesMindMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PagesMindMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
