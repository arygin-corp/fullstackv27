import {
    EventEmitter,
    Injectable
} from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { ProductsList } from '../../../@shared/interfaces/list';
import { Product } from '../../../@shared/interfaces/product';
import {
    Filter,
    SerializedFilterValues
} from '../../../@shared/interfaces/filter';

import { ListOptions } from '../../../@shared/api/shop.service';


/**
 * Mediator between:
 *
 * - PageMarketplaceComponent
 * - ProductsViewComponent
 * - WidgetFiltersComponent
 */
@Injectable()
export class PageMarketplaceService {

    // =========================================================
    // Loading state
    // =========================================================

    private isLoadingState = false;

    private isLoadingSource =
        new BehaviorSubject<boolean>(
            this.isLoadingState
        );

    isLoading$: Observable<boolean> =
        this.isLoadingSource.asObservable();


    // =========================================================
    // Product list state
    // =========================================================

    private listState: ProductsList | null = null;

    private listSource =
        new BehaviorSubject<ProductsList | null>(
            this.listState
        );

    list$: Observable<ProductsList | null> =
        this.listSource.pipe(
            filter(
                (value): value is ProductsList =>
                    value !== null
            )
        );


    // =========================================================
    // Marketplace options state
    // =========================================================

    private optionsState: ListOptions = {
        page: 1,
        limit: 16,
        sort: 'default',
        filterValues: {}
    };


    get options(): ListOptions {
        return {
            ...this.optionsState,

            filterValues: {
                ...(
                    this.optionsState.filterValues ||
                    {}
                )
            }
        };
    }


    optionsChange$ =
        new EventEmitter<ListOptions>();


    // =========================================================
    // Product list getters
    // =========================================================

    get items(): Product[] {
        return this.listState?.items || [];
    }

    get page(): number {
        return this.listState?.page || 1;
    }

    get limit(): number {
        return this.listState?.limit || 16;
    }

    get sort(): string {
        return this.listState?.sort || 'default';
    }

    get total(): number {
        return this.listState?.total || 0;
    }

    get pages(): number {
        return this.listState?.pages || 0;
    }

    get from(): number {
        return this.listState?.from || 0;
    }

    get to(): number {
        return this.listState?.to || 0;
    }

    get filters(): Filter[] {
        return this.listState?.filters || [];
    }

    /*
     * IMPORTANT:
     *
     * Selected filter state belongs to optionsState,
     * not listState.
     */
    get filterValues(): SerializedFilterValues {
        return {
            ...(
                this.optionsState.filterValues ||
                {}
            )
        };
    }


    // =========================================================
    // Loading
    // =========================================================

    setIsLoading(value: boolean): void {

        this.isLoadingState = value;

        this.isLoadingSource.next(
            value
        );
    }


    // =========================================================
    // Product list
    // =========================================================

    setList(list: ProductsList): void {

        this.listState = list;

        this.listSource.next(
            list
        );
    }


    // =========================================================
    // Set options
    // =========================================================
    setOptions(
        options: ListOptions,
        emitEvent: boolean = true
    ): void {

        const previous =
            this.optionsState;

        const next: ListOptions = {
            ...previous,
            ...options,

            filterValues: {
                ...(
                    options.filterValues ??
                    previous.filterValues ??
                    {}
                )
            }
        };

        const filtersChanged =
            JSON.stringify(
                previous.filterValues || {}
            ) !==
            JSON.stringify(
                next.filterValues || {}
            );

        const limitChanged =
            previous.limit !== next.limit;

        const sortChanged =
            previous.sort !== next.sort;

        if (
            filtersChanged ||
            limitChanged ||
            sortChanged
        ) {
            next.page = 1;
        }

        const changed =
            JSON.stringify(previous) !==
            JSON.stringify(next);

        this.optionsState = next;

        console.log(
            'PAGE MARKETPLACE OPTIONS:',
            this.optionsState
        );

        if (emitEvent && changed) {
            this.optionsChange$.emit({
                ...this.optionsState,

                filterValues: {
                    ...(
                        this.optionsState.filterValues ||
                        {}
                    )
                }
            });
        }
    }


    // =========================================================
    // Update options
    // =========================================================

    updateOptions(
        options: ListOptions,
        emitEvent: boolean = true
    ): void {

        const nextFilterValues =
            options.filterValues !== undefined
                ? {
                    ...options.filterValues
                }
                : {
                    ...(
                        this.optionsState
                            .filterValues ||
                        {}
                    )
                };


        this.setOptions(
            {
                ...this.optionsState,
                ...options,
                filterValues:
                    nextFilterValues
            },
            emitEvent
        );
    }


    // =========================================================
    // Reset filters
    // =========================================================

    resetFilters(): void {

        this.updateOptions({
            page: 1,
            filterValues: {},
            domainId: '',
            subdomainId: '',
            subdomain2Id: '',
        });
    }
}