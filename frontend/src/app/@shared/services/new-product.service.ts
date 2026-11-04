import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NewProductService {
    private readonly STORAGE_KEY = 'onboarding_draft';

    constructor(private http: HttpClient) {}

    // Persistence: Save progress locally
    saveDraft(formData: any): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
            data: formData,
            updatedAt: new Date()
        }));
    }

    getDraft(): any {
        const draft = localStorage.getItem(this.STORAGE_KEY);
        return draft ? JSON.parse(draft) : null;
    }

    // Engine B: Submit to Postgres Staging
    // This bypasses the Cart checkout entirely for direct audit submission
    submitToStaging(formData: any): Observable<any> {
        return this.http.post(`${environment.apiUrl}/api/v1/onboarding/stage`, formData);
    }

    clearDraft(): void {
        localStorage.removeItem(this.STORAGE_KEY);
    }
}