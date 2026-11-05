import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { DataAccessRequestComponent } from './data-access-request.component';
import { AppService } from '../../../@shared/services/app.service';
import { AiSuggestionService } from '../../../@shared/services/ai-suggestion.service';

describe('DataAccessRequestComponent', () => {
  let fixture: ComponentFixture<DataAccessRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [DataAccessRequestComponent],
      providers: [
        { provide: AppService, useValue: { userData: {} } },
        { provide: AiSuggestionService, useValue: { getSuggestions: () => of([]) } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(DataAccessRequestComponent);
    fixture.detectChanges();
  });

  it('starts the request for the signed-in user', () => {
    expect(fixture.componentInstance.form.get('requesting_id')?.value).toBe('Me');
    expect(fixture.componentInstance.form.get('v_dar_platform')).toBeTruthy();
    expect(fixture.componentInstance.form.get('chk_dar_terms_message')?.value).toBeFalse();
  });
});
