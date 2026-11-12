import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AiSuggestionService {
  private apiUrl = `${environment.apiUrl}/ai/suggest-products-by-role/`;

  constructor(private http: HttpClient) { }

  getSuggestions(params: Record<string, any>): Observable<any> {
    const tableNames = params.tableNames ?? params.tablenames;
    const tables = Array.isArray(tableNames)
      ? tableNames
        .map(item => typeof item === 'string' ? item : (item?.elementname || item?.name || item?.label || ''))
        .map(item => String(item || '').trim())
        .filter(Boolean)
        .join(',')
      : String(tableNames ?? '').trim();
    const fields: Record<string, string> = {
      query: String(params.query ?? '').trim(),
      v_dar_platform: String(params.platform ?? params.v_dar_platform ?? '').trim(),
      v_dar_dataDomainSelect: String(params.domain ?? params.v_dar_dataDomainSelect ?? '').trim(),
      'database-schema': String(params.databaseSchema ?? params['database-schema'] ?? '').trim(),
      tablenames: tables,
      description: String(params.description ?? '').trim(),
      justification: String(params.justification ?? '').trim(),
      limit: '5'
    };
    let httpParams = new HttpParams();
    Object.entries(fields).forEach(([key, value]) => {
      if (value) {
        httpParams = httpParams.set(key, value);
      }
    });

    return this.http.get<any>(this.apiUrl, { params: httpParams }).pipe(
      map(response => {
        if (response && Array.isArray(response.product)) {
          return response.product;
        }
        if (Array.isArray(response)) {
          return response;
        }
        return [];
      })
    );
  }
}
