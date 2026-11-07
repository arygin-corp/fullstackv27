import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MsalService } from '@azure/msal-angular';
import { Observable, from, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface AccountActivity {
    id: string;
    title: string;
    detail: string;
    reference: string;
    status: string;
    tone: string;
    occurred_at: string;
}

@Injectable({ providedIn: 'root' })
export class UserActivityService {
    constructor(private http: HttpClient, private msal: MsalService) {}

    recentOrders(limit = 3): Observable<any[]> {
        return from(this.authHeaders()).pipe(
            switchMap((headers) => {
                if (!headers) {
                    return of([]);
                }
                return this.http.get<any[]>(`${environment.apiUrl}/api/orders/recent/?limit=${limit}`, { headers });
            }),
            catchError(() => of([]))
        );
    }

    list(): Observable<AccountActivity[]> {
        return from(this.authHeaders()).pipe(
            switchMap((headers) => {
                if (!headers) {
                    return of([]);
                }
                return this.http.get<AccountActivity[]>(`${environment.apiUrl}/api/orders/activity/`, { headers });
            }),
            catchError(() => of([]))
        );
    }

    record(action: string, detail = '', reference = '', payload: Record<string, unknown> = {}): void {
        this.authHeaders().then((headers) => {
            if (!headers) {
                return;
            }
            this.http.post(
                `${environment.apiUrl}/api/orders/activity/`,
                { action, detail, reference, payload },
                { headers }
            ).subscribe({ error: () => undefined });
        });
    }

    authorizationHeaders(): Promise<HttpHeaders | null> {
        return this.authHeaders();
    }

    private async authHeaders(): Promise<HttpHeaders | null> {
        const account = this.msal.instance.getActiveAccount()
            || this.msal.instance.getAllAccounts()[0];
        if (!account) {
            return null;
        }
        try {
            const result = await this.msal.instance.acquireTokenSilent({
                scopes: ['openid', 'profile'],
                account
            });
            if (!result.idToken) {
                return null;
            }
            return new HttpHeaders({ Authorization: `Bearer ${result.idToken}` });
        } catch {
            return null;
        }
    }
}
