import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const baseUrl = `${environment.backend.baseURLPods}`;
export interface PodOptions {
  u_primary: string;
}

@Injectable({
  providedIn: 'root'
})

export class PodsService {
  // getPodsOptions: any;
  constructor(private http: HttpClient) {}

  getPodsOptions(): Observable<PodOptions[]> {
    return this.http.get<PodOptions[]>(`${baseUrl}/tpsp/api/pods/dropdown-list`);
  }
}