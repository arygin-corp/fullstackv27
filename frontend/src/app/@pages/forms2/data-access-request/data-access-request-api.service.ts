import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DarSchema, DarSubmitResponse } from './data-access-request';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DataAccessRequestApiService {
  private readonly formSlug = 'data-access-request';

  constructor(private http: HttpClient) {}

  getSchema(): Observable<DarSchema> {
    return this.http.get<DarSchema>(`${environment.apiUrl}/api/forms/${this.formSlug}/schema`);
  }

  submit(data: Record<string, any>, context: Record<string, any> = {}): Observable<DarSubmitResponse> {
    return this.http.post<DarSubmitResponse>(`${environment.apiUrl}/angular/submissions/`, {
      form_slug: this.formSlug, status: 'submitted', context, data
    });
  }
}
