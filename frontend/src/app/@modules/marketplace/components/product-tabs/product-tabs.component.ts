import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { HttpClient, HttpUrlEncodingCodec } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Description, Documentation, Resource, Product } from '../../../../@shared/interfaces/product';
import { IntendedUse } from '../../../../@shared/interfaces/intended-use';
import { intended } from '../../../../../data/intended-use';
import { WhatsIncluded } from '../../../../@shared/interfaces/whats-included';
import { included } from '../../../../../data/whats-included';
import { resource } from '../../../../../data/product-resource';
import { environment } from '../../../../../environments/environment';
import { description } from '../../../../../data/product-description';
import { documentation } from '../../../../../data/product-documentation';
import { ReviewService } from '../../../../@shared/services/review.service';
import { PicService } from '../../../../@shared/services/pic.service';
import { Review, ReviewSummary } from '../../../../../@models/review.model';

@Component({
    selector: 'app-product-tabs',
    templateUrl: './product-tabs.component.html',
    styleUrls: ['./product-tabs.component.scss']
})

export class ProductTabsComponent implements OnChanges {
    @Input() withSidebar = false;
    @Input() product!: Product;
    @Input() tab: 'description'|'resource'|'reviews'|'tables'|'intended'|'included'|'documentation' = 'resource';
    description: Description[] = description;
    resource: Resource[] = resource;
    reviews: Review[] = [];
    summary: ReviewSummary = {
        average_rating: 0,
        review_count: 0,
        recommended_count: 0,
        recommended_percentage: 0,
        rating_distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        category_ratings: { quality: 0, value: 0, ease_of_use: 0, durability: 0 }
    };
    reviewPage = 1;
    reviewPages = 0;
    selectedRating = 0;
    reviewTitle = '';
    reviewComment = '';
    qualityRating = 0;
    valueRating = 0;
    easeRating = 0;
    durabilityRating = 0;
    wouldRecommend: boolean | null = null;
    metExpectations: boolean | null = null;
    photo: SafeUrl | null = null;
    myReviewId: number | null = null;
    myReview: Review | null = null;
    private failedAvatars = new Set<number>();
    reviewError = '';
    reviewSaved = '';
    submittingReview = false;
    hasReviewed = false;
    intended: IntendedUse[] = intended;
    included: WhatsIncluded[] = included;
    documentation: Documentation[] = documentation;
    codec = new HttpUrlEncodingCodec();
    denodos: any = [];
    schemaTables: SchemaTable[] = [];
    schemaLoading = false;
    schemaSource: 'denodo' | 'sample' | '' = '';
    schemaError = '';
    clicked = false;
    errorMessage = `No definition available.`;
    tableUrl: string = "";
    private schemaRequest = 0;
    private schemaProductId: number | null = null;

    public dataSetFilters = {
        showHideProps: {
            text: {
                showButton: true,
                showState: false,
                show: 'Show Tables and Columns',
                hide: 'Hide Tables and Columns'
            }
        }
    }

    constructor(
        private route: ActivatedRoute,
        private location: Location,
        public router: Router,
        private httpClient: HttpClient,
        private reviewsApi: ReviewService,
        private pictures: PicService,
    ) {
        this.pictures.getUserPhoto().subscribe({
            next: photo => this.photo = photo,
            error: () => this.photo = null
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['product']?.currentValue?.id) {
            this.reviewPage = 1;
            this.loadReviews();
            this.loadMyReview();
            this.schemaProductId = null;
            if (this.isLocalHost()) {
                this.loadTablesAndColumns();
            } else {
                this.resetSchema();
            }
        }
        if (!this.isLocalHost() && this.tab === 'tables') {
            this.loadTablesAndColumns();
        }
        if (this.product && this.tab === 'resource' && !this.showsResources()) {
            this.tab = 'description';
        }
    }

    openReviews(): void {
        this.tab = 'reviews';
    }

    isDataset(): boolean {
        return (this.product?.datatype || '') === 'Datasets';
    }

    showsResources(): boolean {
        const datatype = this.product?.datatype || '';
        return datatype === 'Datasets' || datatype === 'Webservices (APIs)';
    }

    resourceLabel(): string {
        const original = (this.product?.resource?.original_name || '').trim();
        if (this.product?.resource?.type === 'API' && original) {
            return original;
        }
        return this.product?.name || '';
    }

    hasRichText(value: string): boolean {
        return !!(value || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').trim();
    }

    displayRichText(value: string): string {
        const html = value || '';
        if (/<\s*(ul|ol)\b/i.test(html)) {
            return html;
        }
        const lines = html
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/(?:p|div|li|h[1-6])>/gi, '\n')
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/gi, ' ')
            .split(/\n+/)
            .map(line => line.replace(/^[-•*]+\s*/, '').trim())
            .filter(Boolean);
        const shortLines = lines.filter(line => line.length <= 180);
        if (lines.length < 2 || shortLines.length < lines.length) {
            return html;
        }
        const items = lines
            .map(line => `<li>${line.replace(/[&<>]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[char]))}</li>`)
            .join('');
        return `<ul>${items}</ul>`;
    }

    reviewCountLabel(): string {
        const count = this.summary.review_count || 0;
        return count === 1 ? '1 review' : `${count} reviews`;
    }

    avatarFor(review: Review): SafeUrl | string | null {
        if (this.failedAvatars.has(review.id)) {
            return null;
        }
        if (review.id === this.myReviewId && this.photo) {
            return this.photo;
        }
        return review.author?.avatar || null;
    }

    hideAvatar(reviewId: number): void {
        this.failedAvatars.add(reviewId);
    }

    initials(name: string): string {
        const parts = (name || '').replace(/\(.*?\)/g, '').trim().split(/\s+/).filter(Boolean);
        const letters = ((parts[0] || '').charAt(0) + (parts[1] || '').charAt(0)).toUpperCase();
        return letters || 'R';
    }

    categoryScores(): { label: string, percent: number }[] {
        const ratings = this.summary.category_ratings || { quality: 0, value: 0, ease_of_use: 0, durability: 0 };
        return [
            { label: 'Quality', percent: ratings.quality || 0 },
            { label: 'Value', percent: ratings.value || 0 },
            { label: 'Ease of use', percent: ratings.ease_of_use || 0 },
            { label: 'Durability', percent: ratings.durability || 0 }
        ];
    }

    distributionPercent(star: number): number {
        const count = this.summary.rating_distribution[String(star)] || 0;
        if (!this.summary.review_count) {
            return 0;
        }
        return Math.round(count * 100 / this.summary.review_count);
    }

    loadReviews(): void {
        if (!this.product?.id) {
            return;
        }
        this.reviewsApi.getReviews(this.product.id, this.reviewPage).subscribe({
            next: response => {
                this.summary = response.summary;
                this.reviews = response.reviews || [];
                this.reviewPage = response.pagination?.page || 1;
                this.reviewPages = response.pagination?.total_pages || 0;
                this.product.rating = response.summary.average_rating;
                this.product.reviews = response.summary.review_count;
            },
            error: () => {
                this.reviews = [];
            }
        });
    }

    loadMyReview(): void {
        if (!this.product?.id) {
            return;
        }
        this.reviewsApi.getMyReview(this.product.id).subscribe({
            next: response => {
                this.hasReviewed = response.has_reviewed;
                this.myReviewId = response.review?.id || null;
                this.myReview = response.review;
            },
            error: () => {
                this.hasReviewed = false;
            }
        });
    }

    missingReviewFields(): string[] {
        const missing: string[] = [];
        if (this.selectedRating < 1) {
            missing.push('rating');
        }
        if (!this.reviewTitle.trim()) {
            missing.push('review title');
        }
        if (!this.reviewComment.trim()) {
            missing.push('review comment');
        }
        if (this.qualityRating < 1) {
            missing.push('quality');
        }
        if (this.valueRating < 1) {
            missing.push('value');
        }
        if (this.easeRating < 1) {
            missing.push('ease of use');
        }
        if (this.wouldRecommend === null) {
            missing.push('whether you would recommend this product');
        }
        if (this.metExpectations === null) {
            missing.push('whether the product met your expectations');
        }
        return missing;
    }

    yesNo(value: boolean | null): string {
        if (value === true) {
            return 'Yes';
        }
        if (value === false) {
            return 'No';
        }
        return '';
    }

    submitReview(): void {
        this.reviewError = '';
        this.reviewSaved = '';
        if (!this.product?.id) {
            return;
        }
        if (this.hasReviewed) {
            this.reviewError = 'You can only submit one review for this product.';
            return;
        }
        const missing = this.missingReviewFields();
        if (missing.length) {
            this.reviewError = 'Required: ' + missing.join(', ') + '.';
            return;
        }
        this.submittingReview = true;
        this.reviewsApi.createReview(this.product.id, {
            rating: this.selectedRating as 1 | 2 | 3 | 4 | 5,
            title: this.reviewTitle.trim(),
            comment: this.reviewComment.trim(),
            quality: this.qualityRating as 1 | 2 | 3 | 4 | 5,
            value_for_money: this.valueRating as 1 | 2 | 3 | 4 | 5,
            ease_of_use: this.easeRating as 1 | 2 | 3 | 4 | 5,
            durability: this.durabilityRating ? this.durabilityRating as 1 | 2 | 3 | 4 | 5 : null,
            would_recommend: this.wouldRecommend,
            met_expectations: this.metExpectations
        }).subscribe({
            next: (review) => {
                this.submittingReview = false;
                this.hasReviewed = true;
                this.myReview = review;
                this.myReviewId = review.id;
                this.reviewPage = 1;
                this.loadReviews();
            },
            error: (error) => {
                this.submittingReview = false;
                if (error?.status === 409 && error?.error?.review) {
                    this.hasReviewed = true;
                    this.myReview = error.error.review;
                    this.myReviewId = error.error.review.id;
                    return;
                }
                this.reviewError = error?.error?.detail || 'Sign in to review this product.';
            }
        });
    }

    openTables(): void {
        this.tab = 'tables';
        if (!this.isLocalHost()) {
            this.loadTablesAndColumns();
        }
    }

    loadTablesAndColumns(): void {
        if (!this.isDataset() || this.schemaProductId === this.product?.id) {
            return;
        }
        const requestId = ++this.schemaRequest;
        this.schemaProductId = this.product.id;
        this.resetSchema();

        const role = this.product?.ad_group || (this.product as any).adGroup || (this.product as any).adgroup;
        if (!role) {
            this.useLocalSchemaSample(requestId);
            return;
        }

        this.schemaLoading = true;
        const url = `${environment.gdx.denodoTables}?userrolename=${encodeURIComponent(role)}`;
        this.httpClient.get<any>(url).subscribe({
            next: data => {
                if (requestId !== this.schemaRequest) {
                    return;
                }
                const rows = this.schemaRows(data);
                this.denodos = rows;
                this.schemaLoading = false;
                if (!rows.length) {
                    this.useLocalSchemaSample(requestId);
                    return;
                }
                this.schemaSource = 'denodo';
                this.schemaTables = this.groupSchemaRows(rows);
            },
            error: () => {
                if (requestId !== this.schemaRequest) {
                    return;
                }
                this.schemaLoading = false;
                this.useLocalSchemaSample(requestId);
            }
        });
    }

    private resetSchema(): void {
        this.schemaTables = [];
        this.schemaError = '';
        this.schemaSource = '';
        this.schemaLoading = false;
        this.denodos = [];
    }

    private useLocalSchemaSample(requestId: number): void {
        if (requestId !== this.schemaRequest) {
            return;
        }
        if (!this.isLocalHost()) {
            this.schemaTables = [];
            this.schemaSource = '';
            this.schemaError = 'Tables and columns are not available for this product.';
            return;
        }
        this.schemaSource = 'sample';
        this.schemaTables = this.groupSchemaRows(LOCAL_SCHEMA_SAMPLE);
        this.schemaError = '';
    }

    private isLocalHost(): boolean {
        const host = window.location.hostname;
        return host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
    }

    private schemaRows(data: any): SchemaColumn[] {
        const rows = Array.isArray(data) ? data : data?.value || data?.elements || [];
        if (!Array.isArray(rows)) {
            return [];
        }
        return rows
            .map((row: any) => ({
                dbname: String(row?.dbname || '').trim(),
                elementname: String(row?.elementname || row?.table_name || row?.tableName || '').trim(),
                column_name: String(row?.column_name || row?.columnName || '').trim()
            }))
            .filter(row => row.elementname && row.column_name);
    }

    private groupSchemaRows(rows: SchemaColumn[]): SchemaTable[] {
        const tables = new Map<string, SchemaTable>();
        rows.forEach(row => {
            const key = `${row.dbname}\u0000${row.elementname}`;
            const table = tables.get(key) || {
                dbname: row.dbname,
                elementname: row.elementname,
                columns: []
            };
            if (!table.columns.includes(row.column_name)) {
                table.columns.push(row.column_name);
            }
            tables.set(key, table);
        });
        return Array.from(tables.values());
    }

}

interface SchemaColumn {
    dbname: string;
    elementname: string;
    column_name: string;
}

interface SchemaTable {
    dbname: string;
    elementname: string;
    columns: string[];
}

const LOCAL_SCHEMA_SAMPLE: SchemaColumn[] = [
    { dbname: 'tdp_finance', elementname: 'accounting_calendar', column_name: 'calendar_month' },
    { dbname: 'tdp_finance', elementname: 'accounting_calendar', column_name: 'fiscal_period' },
    { dbname: 'tdp_finance', elementname: 'accounting_calendar', column_name: 'quarter_name' },
    { dbname: 'tdp_finance', elementname: 'accounting_calendar', column_name: 'gas_price_avg' },
    { dbname: 'tdp_finance', elementname: 'accounting_calendar', column_name: 'created_at' },
    { dbname: 'tdp_finance', elementname: 'reference_calendar', column_name: 'calendar_date' },
    { dbname: 'tdp_finance', elementname: 'reference_calendar', column_name: 'month_name' },
    { dbname: 'tdp_finance', elementname: 'reference_calendar', column_name: 'quarter_number' },
    { dbname: 'tdp_finance', elementname: 'reference_calendar', column_name: 'year_number' }
];
