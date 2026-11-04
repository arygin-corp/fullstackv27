import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AiSuggestionService {
  private apiUrl = 'http://localhost:8000/ai/suggest-products-by-role/';

  constructor(private http: HttpClient) { }

  getSuggestions(params: { 
    'database-schema'?: string, 
    'tablenames'?: string, 
    'data-request-description'?: string, 
    'intended-use'?: string 
  }): Observable<any> {
    let httpParams = new HttpParams();
    
    // Map the internal form values to your Django API expected query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        httpParams = httpParams.set(key, value);
      }
    });

    // Default pagination parameters
    httpParams = httpParams.set('limit', '5').set('page', '1');
    
    return this.http.get<any>(this.apiUrl, { params: httpParams });
  }
}