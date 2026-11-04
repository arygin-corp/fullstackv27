import {
    Injectable
} from '@angular/core';

import {
    HttpClient,
    HttpParams
} from '@angular/common/http';

import {
    Observable
} from 'rxjs';

import {
    CreateReviewRequest,
    MyReviewResponse,
    ProductReviewsResponse,
    Review
} from './review.models';


@Injectable({
    providedIn: 'root'
})
export class ReviewService {

    private readonly apiUrl =
        '/api/products';


    constructor(
        private readonly http: HttpClient
    ) { }


    getReviews(
        productId: number,
        page: number = 1
    ): Observable<ProductReviewsResponse> {

        const params =
            new HttpParams()
                .set(
                    'page',
                    page.toString()
                );


        return this.http
            .get<ProductReviewsResponse>(
                `${this.apiUrl}/${productId}/reviews/`,
                {
                    params
                }
            );
    }


    getMyReview(
        productId: number
    ): Observable<MyReviewResponse> {

        return this.http
            .get<MyReviewResponse>(
                `${this.apiUrl}/${productId}/reviews/me/`
            );
    }


    createReview(
        productId: number,
        request: CreateReviewRequest
    ): Observable<Review> {

        return this.http
            .post<Review>(
                `${this.apiUrl}/${productId}/reviews/`,
                request
            );
    }
}