import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface PodOptions {
  u_primary: string;
  label?: string;
  value?: string;
}

@Injectable({
  providedIn: 'root'
})

export class PodsService {
  // getPodsOptions: any;
  constructor(private http: HttpClient) {}

  getPodsOptions(): Observable<PodOptions[]> {
    return this.http.get<any>(environment.gdx.pods).pipe(
      map(body => {
        const rows = Array.isArray(body) ? body : (body?.results || body?.result || []);
        return rows
          .map(row => {
            const value = String(row?.u_primary || row?.value || row?.label || '').trim();
            return { u_primary: value, label: row?.label || value, value };
          })
          .filter(row => row.u_primary);
      })
    );
  }
}