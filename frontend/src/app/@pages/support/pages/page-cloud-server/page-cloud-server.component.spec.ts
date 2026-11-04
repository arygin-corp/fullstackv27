import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageCloudServerComponent } from './page-cloud-server.component';

describe('PageCloudServerComponent', () => {
  let component: PageCloudServerComponent;
  let fixture: ComponentFixture<PageCloudServerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageCloudServerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageCloudServerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
