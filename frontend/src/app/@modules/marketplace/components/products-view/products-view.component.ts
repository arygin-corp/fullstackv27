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

import { ActivatedRoute, Router } from '@angular/router';

import {
    Subject
} from 'rxjs';

import {
    filter,
    takeUntil
} from 'rxjs/operators';

import {
    ShopSidebarService
} from '../../services/shop-sidebar.service';

import {
    PageMarketplaceService
} from '../../services/page-marketplace.service';

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
        private router: Router,
        private route: ActivatedRoute,
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
                const page = Number(value.page || 1);
                const limit = Number(value.limit || 12);
                const sort = value.sort || 'default';

                this.router.navigate([], {
                    relativeTo: this.route,
                    queryParams: {
                        page: page > 1 ? page : null,
                        limit: limit !== 12 ? limit : null,
                        sort: sort !== 'default' ? sort : null,
                    },
                    queryParamsHandling: 'merge',
                });
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
        this.router.navigate(['/marketplace'], { queryParams: {} });
    }
}