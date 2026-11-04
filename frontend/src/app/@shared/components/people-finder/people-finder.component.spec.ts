import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeopleFinderComponent } from './people-finder.component';

describe('PeopleFinderComponent', () => {
  let component: PeopleFinderComponent;
  let fixture: ComponentFixture<PeopleFinderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PeopleFinderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PeopleFinderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
