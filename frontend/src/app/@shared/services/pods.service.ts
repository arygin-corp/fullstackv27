import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
    return this.http.get<PodOptions[]>(`${environment.apiUrl}/api/integrations/tbdp-pods/dropdown/`);
  }
}