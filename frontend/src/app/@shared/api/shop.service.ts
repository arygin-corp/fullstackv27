import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Domain } from '../interfaces/domain';
import { Product } from '../interfaces/product';
import { ProductsList } from '../interfaces/list';
import { Brand } from '../interfaces/brand';
import { SerializedFilterValues } from '../interfaces/filter';
import { environment } from '../../../environments/environment';
import Fuse from 'fuse.js';

export interface ListOptions {
    domains?: string[];
    datatypes?: string[];
    page?: number;
    limit?: number;
    sort?: string;
    filterValues?: { [k: string]: string };
    status?: string;
    query?: string;
    campaign?: boolean;
}

@Injectable({
    providedIn: 'root'
})

export class ShopService {
    private readonly apiBase = `${environment.apiUrl}/marketplace/api`;
    private readonly Base = `${environment.apiUrl}/marketplace/`;

    constructor(private http: HttpClient) { }

    // Add near the top of the class
    private productsCache: any[] | null = null;

    // Fetch and cache products-json (used for quick client-side filtering)
    private loadLocalProducts(): Observable<any[]> {
        if (this.productsCache) return of(this.productsCache);
        return this.http.get<any>(`${this.apiBase}/products/`).pipe(
            map(r => r.products || r.items || []),
            map(items => {
                const normalized = items.map((p: any) => ({
                    ...p,
                    images: Array.isArray(p.images) && p.images.length
                        ? p.images.map((img: any) => this.buildImageUrl(img))
                        : (p.image ? [this.buildImageUrl(p.image)] : ['assets/images/product-placeholder.png']),
                    short_desc: p.short_desc || p.brief_desc || p.summary || '',
                    sku: p.sku || p.product_sku || '',
                    slug: p.slug || p.product_slug || '',
                    data_steward: p.data_steward || null,
                    poc_name: p.poc_name || null
                }));
                this.productsCache = normalized;
                return normalized;
            }),
            catchError(() => of([]))
        );
    }

    // Lightweight client-side search across multiple fields
    localSearch(query: string, limit: number = 6): Observable<{ items: any[], did_you_mean: string | null }> {
        const q = (query || '').toString().toLowerCase().trim();
        if (!q) return of({ items: [], did_you_mean: null });

        return this.loadLocalProducts().pipe(
            map(items => {
            const matched = items.filter((p: any) => {
                if (!p) return false;
                if ((p.name || '').toString().toLowerCase().includes(q)) return true;
                if ((p.short_desc || p.brief_desc || p.summary || '').toString().toLowerCase().includes(q)) return true;
                if ((p.sku || '').toString().toLowerCase().includes(q)) return true;
                if ((p.datatype || '').toString().toLowerCase().includes(q)) return true;
                if ((p.domain || p.domain_name || '').toString().toLowerCase().includes(q)) return true;
                if (p.data_steward && ((p.data_steward.name || '').toString().toLowerCase().includes(q) || (p.data_steward.email || '').toString().toLowerCase().includes(q))) return true;
                if (p.poc_name && ((p.poc_name.name || '').toString().toLowerCase().includes(q) || (p.poc_name.email || '').toString().toLowerCase().includes(q))) return true;
                const tags = p.tags || p.keywords || [];
                if (Array.isArray(tags) && tags.some((t: any) => (t.name || t || '').toString().toLowerCase().includes(q))) return true;
                return false;
            });
            const sliced = matched.slice(0, limit);
            const did_you_mean = this.computeDidYouMean(query, sliced, 0.35);
            return { items: sliced, did_you_mean };
            }),
            catchError(() => of({ items: [], did_you_mean: null }))
        );
    }






    private normalizeProduct(product: any): Product {
        return {
            ...product,

            images:
                Array.isArray(product.images) &&
                product.images.length
                    ? product.images.map(
                        (image: string) =>
                            this.buildImageUrl(image)
                    )
                    : product.image
                        ? [
                            this.buildImageUrl(
                                product.image
                            )
                        ]
                        : [
                            'assets/images/product-placeholder.png'
                        ],

            short_desc:
                product.short_desc ||
                product.brief_desc ||
                product.summary ||
                '',

            sku:
                product.sku ||
                product.product_sku ||
                '',

            slug:
                product.slug ||
                product.product_slug ||
                '',

            data_steward:
                product.data_steward ||
                null,

            poc_name:
                product.poc_name ||
                null
        } as Product;
    }

    private buildProductFilters(
        products: Product[],
        selectedFilters: SerializedFilterValues = {}
    ): any[] {

        const definitions = [
            {
                slug: 'domain',
                name: 'Domain'
            },
            {
                slug: 'datatype',
                name: 'Data Type'
            },
            {
                slug: 'classification',
                name: 'Classification'
            },
            {
                slug: 'org_abbrev',
                name: 'Organization'
            }
        ];

        return definitions.map(definition => {

            /*
            * Apply all selected filters EXCEPT the current
            * filter we're calculating counts for.
            *
            * Example:
            *
            * When calculating Data Type:
            *   Domain=Vehicle applies.
            *
            * When calculating Domain:
            *   Domain=Vehicle does NOT apply.
            */
            const otherFilterValues:
                SerializedFilterValues = {};

            Object.entries(selectedFilters)
                .forEach(([slug, value]) => {

                    if (
                        slug !== definition.slug &&
                        value &&
                        value.trim() !== ''
                    ) {
                        otherFilterValues[slug] =
                            value;
                    }
                });


            /*
            * Candidate products for this facet.
            */
            const candidateProducts =
                this.applyProductFilters(
                    products,
                    otherFilterValues
                );


            /*
            * Count values.
            */
            const counts =
                new Map<string, number>();

            candidateProducts.forEach(
                (product: any) => {

                    const rawValue =
                        product?.[
                            definition.slug
                        ];

                    if (
                        rawValue === null ||
                        rawValue === undefined ||
                        rawValue === ''
                    ) {
                        return;
                    }


                    const values =
                        Array.isArray(rawValue)
                            ? rawValue
                            : [rawValue];


                    values.forEach(value => {

                        const normalizedValue =
                            typeof value === 'object'
                                ? value?.name
                                : value;

                        if (
                            normalizedValue === null ||
                            normalizedValue === undefined ||
                            normalizedValue === ''
                        ) {
                            return;
                        }


                        const key =
                            String(
                                normalizedValue
                            ).trim();


                        counts.set(
                            key,
                            (counts.get(key) || 0) + 1
                        );
                    });
                }
            );


            /*
            * Preserve checkbox selection.
            */
            const serializedSelection =
                selectedFilters[
                    definition.slug
                ] || '';


            const selectedValues =
                serializedSelection
                    .split(',')
                    .map(value => value.trim())
                    .filter(Boolean);


            /*
            * IMPORTANT:
            *
            * Keep selected options visible even if their
            * current calculated count becomes zero.
            */
            selectedValues.forEach(
                selectedValue => {

                    if (
                        !counts.has(
                            selectedValue
                        )
                    ) {
                        counts.set(
                            selectedValue,
                            0
                        );
                    }
                }
            );


            return {
                type: 'check',
                slug: definition.slug,
                name: definition.name,

                value:
                    selectedValues,

                items:
                    Array
                        .from(
                            counts.entries()
                        )
                        .map(
                            ([value, count]) => ({
                                slug: value,
                                name: value,
                                count
                            })
                        )

                        // Highest count first.
                        .sort((a, b) => {

                            if (
                                b.count !==
                                a.count
                            ) {
                                return (
                                    b.count -
                                    a.count
                                );
                            }

                            return (
                                a.name
                                    .localeCompare(
                                        b.name
                                    )
                            );
                        })
            };
        });
    }

    private applyProductFilters(
        products: Product[],
        filterValues: SerializedFilterValues = {}
    ): Product[] {

        const activeFilters =
            Object.entries(filterValues)
                .filter(
                    ([, value]) =>
                        typeof value === 'string' &&
                        value.trim() !== ''
                );

        if (!activeFilters.length) {
            return products;
        }

        return products.filter(
            (product: any) => {

                return activeFilters.every(
                    ([filterSlug, serializedValue]) => {

                        const selectedValues =
                            serializedValue
                                .split(',')
                                .map(value => value.trim())
                                .filter(Boolean);

                        if (!selectedValues.length) {
                            return true;
                        }

                        const productValue =
                            product?.[filterSlug];

                        if (
                            productValue === null ||
                            productValue === undefined ||
                            productValue === ''
                        ) {
                            return false;
                        }

                        // Handle array-valued product properties.
                        if (
                            Array.isArray(
                                productValue
                            )
                        ) {

                            const productValues =
                                productValue.map(
                                    value =>
                                        String(
                                            typeof value ===
                                                'object'
                                                ? value?.name
                                                : value
                                        )
                                );

                            return selectedValues.some(
                                selected =>
                                    productValues.includes(
                                        selected
                                    )
                            );
                        }

                        const normalizedValue =
                            String(
                                typeof productValue ===
                                    'object'
                                    ? productValue?.name
                                    : productValue
                            );

                        return selectedValues.includes(
                            normalizedValue
                        );
                    }
                );
            }
        );
    }

    private applyProductSearch(
        products: Product[],
        query?: string
    ): Product[] {

        const normalizedQuery =
            (query || '').trim().toLowerCase();

        if (!normalizedQuery) {
            return products;
        }

        return products.filter((product: any) => {
            const searchableValues = [
                product.name,
                product.sku,
                product.short_desc,
                product.brief_desc,
                product.domain,
                product.subdomain_2,
                product.subdomain_3,
                product.datatype,
                product.classification,
                product.org,
                product.org_abbrev,
                product.catalog,
                product.platform,
                product.one_ts_domain,
                product.data_steward?.name,
                product.data_steward?.email,
                product.poc_name?.name,
                product.poc_name?.email
            ];

            const directMatch =
                searchableValues.some(value =>
                    String(value || '')
                        .toLowerCase()
                        .includes(normalizedQuery)
                );

            const keywords = Array.isArray(
                product.keywords
            )
                ? product.keywords
                : [];

            const keywordMatch =
                keywords.some((keyword: any) =>
                    String(
                        keyword?.name ?? keyword ?? ''
                    )
                        .toLowerCase()
                        .includes(normalizedQuery)
                );

            return directMatch || keywordMatch;
        });
    }

    private applyProductSorting(
        products: Product[],
        sort?: string
    ): Product[] {

        const result = [...products];

        switch (sort) {
            case 'name_asc':
                return result.sort((a: any, b: any) =>
                    String(a.name || '').localeCompare(
                        String(b.name || '')
                    )
                );

            case 'name_desc':
                return result.sort((a: any, b: any) =>
                    String(b.name || '').localeCompare(
                        String(a.name || '')
                    )
                );

            case 'newest':
                return result.sort((a: any, b: any) =>
                    new Date(
                        b.created_at || 0
                    ).getTime() -
                    new Date(
                        a.created_at || 0
                    ).getTime()
                );

            default:
                return result;
        }
    }


    /**
     * Returns paginated products list with CLIENT-SIDE filtering.
     * Restored to work with products-json for high-performance demo data listing.
     */
    getProductsList(
        domainSlug: string | null,
        options: ListOptions
    ): Observable<ProductsList> {

        const page = Math.max(
            Number(options.page || 1),
            1
        );

        const limit = Math.max(
            Number(options.limit || 12),
            1
        );

        const sort =
            options.sort || 'default';

        let params = new HttpParams()
            .set('page', String(page))
            .set('limit', String(limit))
            .set('sort', sort);

        /*
        * Domain page.
        */
        if (
            domainSlug &&
            domainSlug !== 'all' &&
            domainSlug.trim() !== ''
        ) {
            params = params.set(
                'domain',
                domainSlug
            );
        }

        /*
        * Search query.
        */
        if (
            options.query &&
            options.query.trim() !== ''
        ) {
            params = params.set(
                'query',
                options.query.trim()
            );
        }

        /*
        * Optional status.
        */
        if (
            options.status &&
            options.status.trim() !== ''
        ) {
            params = params.set(
                'status',
                options.status.trim()
            );
        }

        if (options.campaign) {
            params = params.set('campaign', '1');
        }

        /*
        * Sidebar filters.
        *
        * Example:
        * domain=Vehicle
        * datatype=Webservices (APIs)
        */
        const filterValues =
            options.filterValues || {};

        Object.keys(filterValues)
            .forEach(filterSlug => {

                const value =
                    filterValues[filterSlug];

                if (
                    value !== undefined &&
                    value !== null &&
                    String(value).trim() !== ''
                ) {
                    params = params.set(
                        filterSlug,
                        String(value)
                    );
                }
            });

        console.log(
            'MARKETPLACE REQUEST:',
            {
                domainSlug,
                page,
                limit,
                sort,
                filterValues
            }
        );

        return this.http.get<any>(
            `${this.apiBase}/products/`,
            { params }
        ).pipe(

            map(response => {

                console.log(
                    'RAW MARKETPLACE RESPONSE:',
                    response
                );

                /*
                * Products returned for CURRENT PAGE.
                */
                const rawProducts: any[] =
                    Array.isArray(response?.products)
                        ? response.products
                        : Array.isArray(response?.items)
                            ? response.items
                            : Array.isArray(response)
                                ? response
                                : [];

                const items: Product[] =
                    rawProducts.map(product =>
                        this.normalizeProduct(product)
                    );

                /*
                * CRITICAL:
                *
                * Do NOT use:
                *
                *     items.length
                *
                * for total.
                *
                * items.length is only the number of products
                * on the current page.
                *
                * The API's count is the complete result count.
                */
                const total =
                    Number(
                        response?.count ??
                        response?.total ??
                        items.length
                    );

                /*
                * Prefer pagination metadata supplied
                * directly by the API.
                */
                const responsePage =
                    Number(
                        response?.page ??
                        page
                    );

                const responseLimit =
                    Number(
                        response?.limit ??
                        response?.page_size ??
                        limit
                    );

                const pages =
                    Number(
                        response?.pages ??
                        response?.total_pages ??
                        (
                            total > 0
                                ? Math.ceil(
                                    total /
                                    responseLimit
                                )
                                : 0
                        )
                    );

                const from =
                    Number(
                        response?.from ??
                        (
                            total > 0
                                ? (
                                    (responsePage - 1) *
                                    responseLimit
                                ) + 1
                                : 0
                        )
                    );

                const to =
                    Number(
                        response?.to ??
                        Math.min(
                            from +
                            items.length -
                            1,
                            total
                        )
                    );

                /*
                * IMPORTANT:
                *
                * Use server-generated filters.
                *
                * The server has visibility into all matching
                * products. The browser only has the current
                * page of products.
                */
                const filters =
                    Array.isArray(response?.filters)
                        ? response.filters
                        : [];

                const result: ProductsList = {
                    items,

                    total,

                    page: responsePage,

                    limit: responseLimit,

                    sort,

                    filters,

                    filterValues,

                    pages,

                    from,

                    to
                };

                console.log(
                    'NORMALIZED MARKETPLACE LIST:',
                    result
                );

                return result;
            }),

            catchError(error => {

                console.error(
                    'GET PRODUCTS ERROR:',
                    error
                );

                return of({
                    items: [],
                    total: 0,

                    page,
                    limit,

                    sort,

                    filters: [],

                    filterValues,

                    pages: 0,
                    from: 0,
                    to: 0
                } as ProductsList);
            })
        );
    }


     /**
     * Returns paginated products list with CLIENT-SIDE filtering.
     * Restored to work with products-json for high-performance demo data listing.
     */
    getShopProductsList(
        domainSlug: string | null,
        options: ListOptions
    ): Observable<ProductsList> {
        return this.getProductsList(
            domainSlug,
            options
        );
    }
    // getShopProductsList(domainSlug: string | null, options: ListOptions): Observable<ProductsList> {
    //     // Use the local products.json file for development
    //     return this.http.get<any>(`${this.apiBase}/products/`).pipe(
    //         map(response => {
    //             // Normalize: accept array or { items: [...] }
    //             let items: any[] = Array.isArray(response) ? response : (response.items || []);

    //             if (domainSlug && domainSlug !== 'all' && domainSlug !== '') {
    //                 items = items.filter(item => 
    //                     item.domain_slug === domainSlug || 
    //                     item.subdomain_2_slug === domainSlug || 
    //                     item.subdomain_3_slug === domainSlug
    //                 );
    //             }

    //             if (options.filterValues) {
    //                 Object.keys(options.filterValues).forEach(filterSlug => {
    //                     const valueStr = options.filterValues![filterSlug];
    //                     if (valueStr && valueStr.trim() !== '') {
    //                         const selectedValues = valueStr.split(',');
    //                         items = items.filter(item => {
    //                             const itemValue = item[filterSlug] || item[`${filterSlug}_slug`];
    //                             return selectedValues.includes(itemValue);
    //                         });
    //                     }
    //                 });
    //             }

    //             if (options.sort === 'name_asc') {
    //                 items.sort((a, b) => a.name.localeCompare(b.name));
    //             } else if (options.sort === 'name_desc') {
    //                 items.sort((a, b) => b.name.localeCompare(a.name));
    //             }

    //             const total = items.length;
    //             const limit = options.limit || 12;
    //             const page = options.page || 1;
    //             const pages = Math.ceil(total / limit);
    //             const from = (page - 1) * limit;
    //             const to = Math.min(from + limit, total);

    //             return {
    //                 items: items.slice(from, to),
    //                 total,
    //                 page,
    //                 limit,
    //                 sort: options.sort || 'default',
    //                 filters: response.filters || [],
    //                 filterValues: options.filterValues || {},
    //                 pages,
    //                 from: from + 1,
    //                 to
    //             };
    //         }),
    //         catchError(error => {
    //             console.error('Error fetching product list:', error);
    //             return of({
    //                 items: [], total: 0, page: 1, limit: 12, sort: 'default',
    //                 filters: [], filterValues: {}, pages: 1, from: 1, to: 0
    //             });
    //         })
    //     );
    // }

    /**
     * Returns products related to the provided product.
     */
    getRelatedProducts(product: Partial<Product>, limit: number = 8): Observable<Product[]> {
        let params = new HttpParams().set('limit', limit.toString());
        if (product?.slug) {
            params = params.set('for', product.slug);
        }
        return this.http.get<Product[]>(`${this.apiBase}/products/related/`, { params });
    }

    /**
     * Returns domains by a list of slugs.
     */
    getDomainsBySlug(slugs: string[], depth: number = 0): Observable<Domain[]> {
        let params = new HttpParams()
            .set('slugs', slugs.join(','))
            .set('depth', depth.toString());
        return this.http.get<Domain[]>(`${this.apiBase}/domains/`, { params });
    }

    private normalizeSuggestion(p: any): any {
        return {
            ...p,
            // images array with fallback
            images: Array.isArray(p.images) && p.images.length
            ? p.images.map((img: any) => this.buildImageUrl(img))
            : (p.image ? [this.buildImageUrl(p.image)] : ['assets/images/product-placeholder.png']),
            // steward flattened
            data_steward_name: p.data_steward?.name || p.data_steward_name || '',
            data_steward_email: p.data_steward?.email || p.data_steward_email || '',
            // point-of-contact flattened
            poc_name: p.poc_name?.name || (typeof p.poc_name === 'string' ? p.poc_name : '') || '',
            poc_email: p.poc_name?.email || p.poc_email || '',
            // common fields normalized
            short_desc: p.short_desc || p.brief_desc || p.summary || '',
            sku: p.sku || p.product_sku || '',
            slug: p.slug || p.product_slug || '',
            domain: p.domain || p.domain_name || '',
            owner: p.owner || p.owner_name || p.business_contact_name || '',
            tags: p.tags || p.keywords || [],
            id: p.id ?? p.product_id ?? p.sku ?? p.slug ?? null
        };
    }

    private suggestionsCache = new Map<string, { ts: number, value: any }>();
    private cacheTTL = 60 * 1000;


    getSuggestions(
        query: string,
        limit: number = 8,
        opts: {
            domain?: string;
            page?: number;
        } = {}
    ): Observable<any> {

        const normalizedQuery = (query || '').trim();
        const page = opts.page || 1;

        /*
        * Page MUST be part of the cache key.
        * Otherwise page 2 could return cached page 1.
        */
        const key =
            `${opts.domain || 'all'}::${normalizedQuery}::${limit}::${page}`;

        const now = Date.now();
        const cached = this.suggestionsCache.get(key);

        if (
            cached &&
            (now - cached.ts) < this.cacheTTL
        ) {
            return of(cached.value);
        }

        let params = new HttpParams()
            .set('q', normalizedQuery)
            .set('limit', String(limit))
            .set('page', String(page));

        if (opts.domain) {
            params = params.set('domain', opts.domain);
        }

        return this.http.get<any>(
            `${this.apiBase}/search/suggestions/`,
            { params }
        ).pipe(

            map(res => {

                console.log(
                    'RAW SUGGESTIONS API RESPONSE:',
                    res
                );

                /*
                * New API response:
                *
                * {
                *   count,
                *   page,
                *   page_size,
                *   total_pages,
                *   suggestions: [...]
                * }
                */

                const suggestions = Array.isArray(res?.suggestions)
                    ? res.suggestions.map(
                        (p: any) => this.normalizeSuggestion(p)
                    )
                    : [];

                const result = {
                    query:
                        res?.query ??
                        normalizedQuery,

                    normalized_query:
                        res?.normalized_query ??
                        normalizedQuery,

                    search_query_used:
                        res?.search_query_used ??
                        normalizedQuery,

                    intent:
                        res?.intent ??
                        null,

                    did_you_mean:
                        res?.did_you_mean ??
                        null,

                    spelling_confidence:
                        res?.spelling_confidence ??
                        null,

                    correction_applied:
                        res?.correction_applied ??
                        false,

                    count:
                        Number(res?.count ?? 0),

                    page:
                        Number(res?.page ?? page),

                    page_size:
                        Number(res?.page_size ?? limit),

                    total_pages:
                        Number(res?.total_pages ?? 1),

                    has_previous:
                        Boolean(res?.has_previous),

                    has_next:
                        Boolean(res?.has_next),

                    suggestions
                };

                console.log(
                    'NORMALIZED SUGGESTIONS:',
                    result
                );

                this.suggestionsCache.set(
                    key,
                    {
                        ts: now,
                        value: result
                    }
                );

                /*
                * Prevent unlimited cache growth.
                */
                if (this.suggestionsCache.size > 200) {

                    const oldestKey =
                        Array
                            .from(this.suggestionsCache.entries())
                            .sort(
                                ([, a], [, b]) =>
                                    a.ts - b.ts
                            )[0]?.[0];

                    if (oldestKey) {
                        this.suggestionsCache.delete(oldestKey);
                    }
                }

                return result;
            }),

            catchError(error => {

                console.error(
                    'GET SUGGESTIONS ERROR:',
                    error
                );

                return of({
                    query: normalizedQuery,
                    normalized_query: normalizedQuery,
                    search_query_used: normalizedQuery,

                    intent: null,

                    did_you_mean: null,
                    spelling_confidence: null,
                    correction_applied: false,

                    count: 0,

                    page,
                    page_size: limit,
                    total_pages: 1,

                    has_previous: false,
                    has_next: false,

                    suggestions: []
                });
            })
        );
    }

    getDomain(slug: string): Observable<any> {
        return this.http.get<any>(`${this.apiBase}/domains/${slug}/`);
    }

    getDomains(parent: Partial<Domain> | null = null, depth: number = 0): Observable<Domain[]> {
        let params = new HttpParams().set('depth', depth.toString());
        if (parent?.slug) params = params.set('parent', parent.slug);
        return this.http.get<Domain[]>(`${this.apiBase}/domains/`, { params });
    }

    getProduct(productSlug: string): Observable<Product> {
        return this.http.get<Product>(`${this.apiBase}/products/${productSlug}/`);
    }

    getPopularBrands(): Observable<Brand[]> {
        return this.http.get<Brand[]>(`${this.apiBase}/brands/`);
    }

    getLatestProducts(domainSlug: string | null = null, limit: number | null = null): Observable<Product[]> {
        let params = new HttpParams();
        if (domainSlug) params = params.set('domain', domainSlug);
        if (limit) params = params.set('limit', limit.toString());
        return this.http.get<Product[]>(`${this.apiBase}/products/latest/`, { params });
    }

    getBestsellers(limit: number | null = null): Observable<Product[]> {
        let params = new HttpParams();
        if (limit) params = params.set('limit', limit.toString());
        return this.http.get<Product[]>(`${this.apiBase}/products/bestsellers/`, { params });
    }

    private buildImageUrl(image: string): string {
        if (!image) return 'assets/images/product-placeholder.png';
        const trimmed = image.toString().trim();
        if (/^https?:\/\//i.test(trimmed)) return trimmed;
        const base = (this.Base || '').replace(/\/$/, '');
        return `${base}/products/${trimmed.replace(/^\/+/, '')}`;
    }


    private computeDidYouMean(query: string, items: any[], threshold = 0.35): string | null {
        if (!query || query.trim().length < 3 || !items || items.length === 0) return null;

        const canonicalMap: Record<string, string> = {
            'toyata': 'toyota',
            'toyataa': 'toyota',
            'toyatah': 'toyota'
        };

        const qLower = query.toString().toLowerCase().trim();
        const usedQuery = canonicalMap[qLower] || query;
        const fuseQuery = usedQuery;

        const options: Fuse.IFuseOptions<any> = {
            includeScore: true,
            shouldSort: true,
            threshold,
            keys: [
            { name: 'name',              weight: 0.7 },
            { name: 'short_desc',        weight: 0.12 },
            { name: 'datatype',          weight: 0.06 },
            { name: 'classification',    weight: 0.03 },
            { name: 'tags',              weight: 0.04 },
            { name: 'data_steward_name', weight: 0.03 },
            { name: 'poc_name',          weight: 0.02 }
            ]
        };

        try {
            const fuse = new Fuse(items, options);
            const results = fuse.search(fuseQuery);
            if (!results || results.length === 0) return null;

            const best = results[0];
            if (best?.score != null && best.score <= threshold) {
            const candidate = best.item?.name || best.item?.slug || null;
            if (!candidate) return null;
            if (candidate.toString().toLowerCase().trim() === qLower) return null;
            return candidate;
            }
            return null;
        } catch {
            return null;
        }
    }
}