import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessGuideComponent } from './access-guide.component';

describe('AccessGuideComponent', () => {
  let component: AccessGuideComponent;
  let fixture: ComponentFixture<AccessGuideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccessGuideComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessGuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
