import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetadataPolicyComponent } from './metadata-policy.component';

describe('MetadataPolicyComponent', () => {
  let component: MetadataPolicyComponent;
  let fixture: ComponentFixture<MetadataPolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetadataPolicyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MetadataPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
