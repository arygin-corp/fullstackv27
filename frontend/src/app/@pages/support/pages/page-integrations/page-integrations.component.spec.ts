import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageIntegrationsComponent } from './page-integrations.component';

describe('PageIntegrationsComponent', () => {
  let component: PageIntegrationsComponent;
  let fixture: ComponentFixture<PageIntegrationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageIntegrationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageIntegrationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
