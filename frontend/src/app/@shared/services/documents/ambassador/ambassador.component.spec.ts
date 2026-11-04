import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmbassadorComponent } from './ambassador.component';

describe('AmbassadorComponent', () => {
  let component: AmbassadorComponent;
  let fixture: ComponentFixture<AmbassadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AmbassadorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AmbassadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
