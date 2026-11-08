export type RatingValue =
    1 | 2 | 3 | 4 | 5;


export interface ReviewAuthor {
    id: number;
    display_name: string;
    avatar?: string;
}


export interface Review {
    id: number;
    product_id: number;

    author: ReviewAuthor;

    rating: RatingValue;

    title: string;

    comment: string;

    quality: RatingValue | null;

    value_for_money: RatingValue | null;

    ease_of_use: RatingValue | null;

    durability: RatingValue | null;

    would_recommend: boolean | null;

    met_expectations: boolean | null;

    verified_purchaser: boolean;

    status: 'pending' | 'approved' | 'rejected';

    created_at: string;
}


export interface RatingDistribution {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
}


export interface CategoryRatings {
    quality: number;

    value: number;

    ease_of_use: number;

    durability: number;
}


export interface ReviewSummary {
    average_rating: number;

    review_count: number;

    recommended_count: number;

    recommended_percentage: number;

    rating_distribution: RatingDistribution;

    category_ratings: CategoryRatings;
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

    verified_purchaser?: boolean;

    review: Review | null;
}


export interface CreateReviewRequest {
    rating: RatingValue;

    title: string;

    comment: string;

    quality: RatingValue;

    value_for_money: RatingValue;

    ease_of_use: RatingValue;

    durability?: RatingValue | null;

    would_recommend: boolean;

    met_expectations: boolean;
}