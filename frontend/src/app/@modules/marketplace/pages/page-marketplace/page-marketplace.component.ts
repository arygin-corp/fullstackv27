import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Subject } from 'rxjs';
import {
    finalize,
    switchMap,
    takeUntil,
} from 'rxjs/operators';

import { ShopSidebarService } from '../../services/shop-sidebar.service';
import { PageMarketplaceService } from '../../services/page-marketplace.service';
import { PageDomainService } from '../../services/page-domain.service';
import { Link } from '../../../../@shared/interfaces/link';
import { RootService } from '../../../../@shared/services/root.service';
import { parseProductsListParams } from '../../resolvers/products-list-resolver.service';
import { ShopService } from '../../../../@shared/api/shop.service';

@Component({
    selector: 'app-grid',
    templateUrl: './page-marketplace.component.html',
    styleUrls: ['./page-marketplace.component.scss'],
    providers: [
        {
            provide: PageMarketplaceService,
            useClass: PageMarketplaceService,
        },
        {
            provide: PageDomainService,
            useExisting: PageMarketplaceService,
        },
        {
            provide: ShopSidebarService,
            useClass: ShopSidebarService,
        },
    ],
})
export class PageMarketplaceComponent implements OnDestroy {
    destroy$: Subject<void> = new Subject<void>();

    currentGrid:
        | 'grid-3-sidebar'
        | 'grid-4-full'
        | 'grid-5-full' = 'grid-3-sidebar';

    columns: 3 | 4 | 5 = 3;

    viewMode:
        | 'grid'
        | 'grid-with-features'
        | 'list' = 'grid';

    sidebarPosition: 'start' | 'end' = 'start';

    breadcrumbs: Link[] = [];
    pageHeader = '';

    constructor(
        private root: RootService,
        private router: Router,
        private route: ActivatedRoute,
        private pageService: PageMarketplaceService,
        private shop: ShopService,
        private location: Location,
    ) {
        /*
         * Page information only.
         *
         * Do NOT make another product API request here.
         */
        this.route.data
            .pipe(takeUntil(this.destroy$))
            .subscribe(data => {
                this.breadcrumbs = [
                    {
                        label: 'Domains',
                        url: this.root.home(),
                    },
                    {
                        label: 'Marketplace',
                        url: this.root.shop(),
                    },
                ];

                const slug = this.getDomainSlug();

                this.pageHeader = !slug
                    ? 'Marketplace'
                    : (data.domain?.name || 'Marketplace');
            });

        /*
         * Initialize options from the URL.
         *
         * PageMarketplaceService remains responsible for
         * pagination, sorting, and filter state.
         */
        this.route.queryParams
            .pipe(takeUntil(this.destroy$))
            .subscribe(queryParams => {
                this.pageService.setOptions(
                    parseProductsListParams(queryParams),
                    false,
                );
            });

        /*
         * SINGLE product-loading pipeline.
         *
         * Important:
         * - Do NOT overwrite filterValues with {}
         * - Do NOT make a second optionsChange$ subscription
         * - Do NOT call getMarketplaceProducts()
         *
         * When page, limit, sort, or filters change,
         * this request becomes the source of truth.
         */
        this.pageService.optionsChange$
            .pipe(
                switchMap(() => {
                    this.updateUrl();

                    this.pageService.setIsLoading(true);

                    console.log(
                        'Marketplace request options:',
                        this.pageService.options,
                    );

                    return this.shop.getProductsList(
                        this.getDomainSlug(),
                        this.pageService.options,
                    ).pipe(
                        finalize(() => {
                            this.pageService.setIsLoading(false);
                        }),
                    );
                }),

                takeUntil(this.destroy$),
            )
            .subscribe(list => {
                /*
                 * ShopService already returns ProductsList.
                 *
                 * Don't convert:
                 * response.products -> items
                 * response.count -> total
                 *
                 * in this component.
                 */
                console.log(
                    'Marketplace ProductsList:',
                    list,
                );

                this.pageService.setList(list);
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    updateUrl(): void {
        const tree = this.router.parseUrl(
            this.router.url,
        );

        tree.queryParams = this.getQueryParams();

        this.location.replaceState(
            tree.toString(),
        );
    }

    getQueryParams(): Params {
        const params: Params = {};
        const options = this.pageService.options;

        /*
         * Pagination.
         */
        if (
            'page' in options &&
            options.page !== 1
        ) {
            params.page = options.page;
        }

        if (
            'limit' in options &&
            options.limit !== 12
        ) {
            params.limit = options.limit;
        }

        /*
         * Sorting.
         */
        if (
            'sort' in options &&
            options.sort !== 'default'
        ) {
            params.sort = options.sort;
        }

        /*
         * IMPORTANT:
         * Preserve selected filters in the URL.
         *
         * The exact URL serialization depends on the
         * structure returned by parseProductsListParams().
         */
        if (
            'filterValues' in options &&
            options.filterValues &&
            Object.keys(options.filterValues).length
        ) {
            Object.keys(options.filterValues).forEach(key => {
                const value =
                    options.filterValues[key];

                if (
                    value !== null &&
                    value !== undefined &&
                    value !== '' &&
                    (
                        !Array.isArray(value) ||
                        value.length > 0
                    )
                ) {
                    params[key] = value;
                }
            });
        }

        return params;
    }

    /*
     * The root marketplace represents all domains.
     *
     * If your API explicitly requires "all" instead
     * of null, change the final null back to "all".
     */
    getDomainSlug(): string | null {
        return (
            this.route.snapshot.params.domainSlug ||
            this.route.snapshot.data.domainSlug ||
            null
        );
    }

    getProductsViewLayout():
        | 'grid-3-sidebar'
        | 'grid-4-full'
        | 'grid-5-full' {

        return (
            'grid-' +
            this.columns +
            '-full'
        ) as
            | 'grid-3-sidebar'
            | 'grid-4-full'
            | 'grid-5-full';
    }

    get offcanvasMode():
        | 'always'
        | 'mobile' {

        return 'mobile';
    }

    onGridChange(
        grid:
            | 'grid-3-sidebar'
            | 'grid-4-full'
            | 'grid-5-full',
    ): void {
        this.currentGrid = grid;
    }
}