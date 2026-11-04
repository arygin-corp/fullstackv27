import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SytemUpdatesComponent } from './sytem-updates.component';

describe('SytemUpdatesComponent', () => {
  let component: SytemUpdatesComponent;
  let fixture: ComponentFixture<SytemUpdatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SytemUpdatesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SytemUpdatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
