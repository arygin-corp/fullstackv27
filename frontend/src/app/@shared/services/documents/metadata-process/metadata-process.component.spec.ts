import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetadataProcessComponent } from './metadata-process.component';

describe('MetadataProcessComponent', () => {
  let component: MetadataProcessComponent;
  let fixture: ComponentFixture<MetadataProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetadataProcessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MetadataProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
