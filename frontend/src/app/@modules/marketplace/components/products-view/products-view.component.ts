import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnDestroy,
    OnInit
} from '@angular/core';

import {
    FormBuilder,
    FormGroup
} from '@angular/forms';

import {
    Subject
} from 'rxjs';

import {
    filter,
    finalize,
    takeUntil
} from 'rxjs/operators';

import {
    ShopSidebarService
} from '../../services/shop-sidebar.service';

import {
    PageMarketplaceService
} from '../../services/page-marketplace.service';

import {
    ShopService,
    ListOptions
} from '../../../../@shared/api/shop.service';

import {
    ProductsList
} from '../../../../@shared/interfaces/list';


export type Layout =
    'grid' |
    'grid-with-features' |
    'list';


@Component({
    selector: 'app-products-view',
    templateUrl: './products-view.component.html',
    styleUrls: ['./products-view.component.scss']
})
export class ProductsViewComponent implements OnInit, OnDestroy {
    @Input() layout: Layout ='grid';
    @Input() grid:'grid-3-sidebar' | 'grid-4-full' | 'grid-5-full' = 'grid-3-sidebar';
    @Input() offcanvas: 'always' | 'mobile' = 'mobile';
    @Input() domainSlug: string | null = null;
    @Output() gridChange = new EventEmitter<'grid-3-sidebar' | 'grid-4-full' | 'grid-5-full'>();
    destroy$ = new Subject<void>();
    listOptionsForm!: FormGroup;
    filtersCount = 0;

    constructor(
        private fb: FormBuilder,
        private shop: ShopService,
        public sidebar: ShopSidebarService,
        public pageService: PageMarketplaceService
    ) {}


    ngOnInit(): void {

        // -------------------------------------------------
        // Toolbar form
        // -------------------------------------------------

        this.listOptionsForm =
            this.fb.group({

                page:
                    this.fb.control(
                        this.pageService.options.page ||
                        1
                    ),

                limit:
                    this.fb.control(
                        this.pageService.options.limit ||
                        12
                    ),

                sort:
                    this.fb.control(
                        this.pageService.options.sort ||
                        'default'
                    )
            });


        // -------------------------------------------------
        // Pagination / limit / sorting
        // -------------------------------------------------

        this.listOptionsForm
            .valueChanges
            .pipe(
                takeUntil(this.destroy$)
            )
            .subscribe(value => {

                this.pageService.updateOptions({
                    page:
                        Number(value.page || 1),

                    limit:
                        Number(value.limit || 12),

                    sort:
                        value.sort || 'default'
                });
            });


        // -------------------------------------------------
        // IMPORTANT:
        // Reload products whenever options change.
        //
        // This includes filterValues coming from
        // WidgetFiltersComponent.
        // -------------------------------------------------

        this.pageService.optionsChange$
            .pipe(
                takeUntil(this.destroy$)
            )
            .subscribe(options => {

                console.log(
                    'OPTIONS CHANGED:',
                    options
                );

                this.loadProducts(options);
            });


        // -------------------------------------------------
        // Listen for returned product lists
        // -------------------------------------------------

        this.pageService.list$
            .pipe(
                filter(
                    (value): value is ProductsList =>
                        value !== null
                ),

                takeUntil(this.destroy$)
            )
            .subscribe(list => {

                console.log(
                    'PRODUCT LIST UPDATED:',
                    list
                );

                /*
                 * Count selected filter groups.
                 */
                this.filtersCount =
                    Object.values(
                        list.filterValues || {}
                    )
                    .filter(
                        value =>
                            typeof value === 'string' &&
                            value.trim() !== ''
                    )
                    .length;


                /*
                 * Update toolbar without triggering
                 * another product request.
                 */
                this.listOptionsForm.patchValue(
                    {
                        page:
                            list.page || 1,

                        limit:
                            list.limit || 12,

                        sort:
                            list.sort || 'default'
                    },
                    {
                        emitEvent: false
                    }
                );
            });


        // -------------------------------------------------
        // Initial marketplace load
        // -------------------------------------------------

        this.loadProducts(
            this.pageService.options
        );
    }


    // =====================================================
    // Load products
    // =====================================================

    private loadProducts(
        options: ListOptions
    ): void {

        console.log(
            'LOADING PRODUCTS WITH OPTIONS:',
            options
        );

        console.log(
            'LOADING PRODUCTS WITH FILTERS:',
            options.filterValues
        );


        this.pageService.setIsLoading(
            true
        );


        this.shop
            .getShopProductsList(
                this.domainSlug,
                options
            )
            .pipe(
                takeUntil(
                    this.destroy$
                ),

                finalize(() => {

                    this.pageService
                        .setIsLoading(
                            false
                        );
                })
            )
            .subscribe({

                next: list => {

                    console.log(
                        'PRODUCT LOAD RESULT:',
                        list
                    );

                    console.log(
                        'PRODUCT LOAD TOTAL:',
                        list.total
                    );


                    this.pageService.setList(
                        list
                    );
                },

                error: error => {

                    console.error(
                        'PRODUCT LOAD ERROR:',
                        error
                    );
                }
            });
    }


    // =====================================================
    // Destroy
    // =====================================================

    ngOnDestroy(): void {

        this.destroy$.next();

        this.destroy$.complete();
    }


    // =====================================================
    // Layout
    // =====================================================

    setLayout(
        value: Layout
    ): void {

        this.layout = value;
    }


    setGrid(
        value:
            'grid-3-sidebar' |
            'grid-4-full' |
            'grid-5-full'
    ): void {

        this.grid = value;
    }


    setViewMode(
        mode:
            'grid-4-full' |
            'grid-with-features'
    ): void {

        if (
            mode === 'grid-4-full'
        ) {

            this.grid =
                'grid-4-full';

            this.layout =
                'grid';

        } else {

            this.grid =
                'grid-3-sidebar';

            this.layout =
                'grid-with-features';
        }


        this.gridChange.emit(
            this.grid
        );
    }


    // =====================================================
    // Filters
    // =====================================================

    resetFilters(): void {

        this.pageService.resetFilters();
    }
}