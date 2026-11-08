import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AiSuggestionService {
  private apiUrl = `${environment.apiUrl}/ai/suggest-products-by-role/`;

  constructor(private http: HttpClient) { }

  getSuggestions(params: Record<string, any>): Observable<any> {
    let httpParams = new HttpParams();
    
    // Map the internal form values to your Django API expected query parameters
    Object.entries(params).forEach(([key, value]) => {
      const text = Array.isArray(value)
        ? value.map(item => String(item ?? '').trim()).filter(Boolean).join(',')
        : String(value ?? '').trim();
      if (text) {
        httpParams = httpParams.set(key, text);
      }
    });

    // Default pagination parameters
    httpParams = httpParams.set('limit', '5').set('page', '1');
    
    return this.http.get<any>(this.apiUrl, { params: httpParams });
  }
}
