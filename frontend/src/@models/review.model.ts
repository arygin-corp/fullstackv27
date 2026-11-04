export type RatingValue =
    1 | 2 | 3 | 4 | 5;


export interface ReviewAuthor {
    id: number;
    display_name: string;
}


export interface Review {
    id: number;
    product_id: number;

    author: ReviewAuthor;

    rating: RatingValue;

    comment: string;

    created_at: string;
}


export interface RatingDistribution {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
}


export interface ReviewSummary {
    average_rating: number;

    review_count: number;

    recommended_count: number;

    recommended_percentage: number;

    rating_distribution: RatingDistribution;
}


export interface ReviewPagination {
    page: number;

    page_size: number;

    total_pages: number;

    total_reviews: number;
}


export interface ProductReviewsResponse {
    summary: ReviewSummary;

    reviews: Review[];

    pagination: ReviewPagination;
}


export interface MyReviewResponse {
    has_reviewed: boolean;

    review: Review | null;
}


export interface CreateReviewRequest {
    rating: RatingValue;

    comment: string;
}