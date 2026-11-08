import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { MsalService } from '@azure/msal-angular';
import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
    CreateReviewRequest,
    MyReviewResponse,
    ProductReviewsResponse,
    Review
} from '../../../@models/review.model';

@Injectable({
    providedIn: 'root'
})
export class ReviewService {
    private readonly apiUrl = `${environment.apiUrl}/marketplace/api/products`;

    constructor(
        private readonly http: HttpClient,
        private readonly msal: MsalService
    ) { }

    getReviews(productId: number, page: number = 1): Observable<ProductReviewsResponse> {
        const params = new HttpParams().set('page', page.toString());
        return this.http.get<ProductReviewsResponse>(
            `${this.apiUrl}/${productId}/reviews/`,
            { params }
        );
    }

    getMyReview(productId: number): Observable<MyReviewResponse> {
        return from(this.authHeaders()).pipe(
            switchMap(headers => this.http.get<MyReviewResponse>(
                `${this.apiUrl}/${productId}/reviews/me/`,
                { headers }
            ))
        );
    }

    createReview(productId: number, request: CreateReviewRequest): Observable<Review> {
        return from(this.authHeaders()).pipe(
            switchMap(headers => this.http.post<Review>(
                `${this.apiUrl}/${productId}/reviews/`,
                request,
                { headers }
            ))
        );
    }

    private async authHeaders(): Promise<HttpHeaders> {
        try {
            let account = this.msal.instance.getActiveAccount() || this.msal.instance.getAllAccounts()[0];
            if (!account) {
                return new HttpHeaders();
            }
            const result = await this.msal.instance.acquireTokenSilent({
                scopes: ['openid', 'profile'],
                account,
            });
            if (!result.idToken) {
                return new HttpHeaders();
            }
            return new HttpHeaders({ Authorization: `Bearer ${result.idToken}` });
        } catch {
            return new HttpHeaders();
        }
    }
}
