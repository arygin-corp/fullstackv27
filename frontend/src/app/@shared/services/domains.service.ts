// src/app/@shared/services/domains.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Domain } from '../../../@models/domain.model';
import { environment } from '../../../environments/environment';
import { shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class DomainsService {
  private domains$?: Observable<Domain[]>;
  private apiUrl = `${environment.apiUrl}/api/marketplace/domains/`; 

  constructor(private http: HttpClient) { }

  getDomains(): Observable<Domain[]> {
    if (!this.domains$) {
      this.domains$ = this.http.get<Domain[]>(this.apiUrl).pipe(
        shareReplay(1) // Stores the result and shares it with all future subscribers
      );
    }
    return this.domains$;
  }
}