import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SuggestionTrackingService {
  private apiUrl = this.trackUrl();

  constructor(private http: HttpClient) {}

  trackImpression(productId: string, productName: string, adGroup: string, userId?: string) {
    const payload = {
      productId,
      timestamp: new Date().toISOString(),
      userId: userId || null,
      additionalData: {
        productName,
        adGroup
      }
    };

    if (!this.apiUrl) {
      return of(null);
    }

    return this.http.post(this.apiUrl, payload);
  }

  private trackUrl(): string | undefined {
    const api = environment.apiUrl as string | { ai_track?: string };
    return typeof api === 'string' ? undefined : api.ai_track;
  }
}
