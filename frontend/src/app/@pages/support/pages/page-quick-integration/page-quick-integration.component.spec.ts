import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageQuickIntegrationComponent } from './page-quick-integration.component';

describe('PageQuickIntegrationComponent', () => {
  let component: PageQuickIntegrationComponent;
  let fixture: ComponentFixture<PageQuickIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageQuickIntegrationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageQuickIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
