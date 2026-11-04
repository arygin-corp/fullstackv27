import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ShopService, ListOptions } from '../../../@shared/api/shop.service';

export function parseProductsListParams(params: any): ListOptions {
    const options: ListOptions = {};

    if (params.page) {
        options.page = parseFloat(params.page);
    }
    if (params.limit) {
        options.limit = parseFloat(params.limit);
    }
    if (params.sort) {
        options.sort = params.sort;
    }

    const filterValues: any = {};
    Object.keys(params).forEach(param => {
        const mr = param.match(/^filter_([_a-z0-9]+)$/);
        if (mr) {
            filterValues[mr[1]] = params[param];
        }
    });

    if (Object.keys(filterValues).length > 0) {
        options.filterValues = filterValues;
    }

    return options;
}

@Injectable({
    providedIn: 'root'
})

export class ProductsListResolverService implements Resolve<any> {
    constructor(
        private shop: ShopService, 
        private router: Router
    ) { }

    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        const domainSlug = route.params.domainSlug || route.data.domainSlug || null;
        
        // Inline parsing to avoid declaration conflicts
        const options = {
            page: parseFloat(route.queryParams.page || '1'),
            limit: parseFloat(route.queryParams.limit || '12'),
            sort: route.queryParams.sort || 'default'
        };

        return this.shop.getProductsList(domainSlug, options).pipe(
            catchError(() => {
                if (domainSlug) this.router.navigate(['/404']);
                // Return a valid empty structure so the component doesn't crash
                return of({ items: [], total: 0, count: 0, page: 1, limit: 12, pages: 1 });
            })
        );
    }
}