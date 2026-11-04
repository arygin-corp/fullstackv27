import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { EMPTY, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { RootService } from '../../../@shared/services/root.service';
import { ShopService } from '../../../@shared/api/shop.service';

@Injectable({
    providedIn: 'root'
})
export class MarketplaceResolverService implements Resolve<any> {
    constructor(
        private root: RootService,
        private router: Router,
        private shop: ShopService,
    ) { }

    resolve(route: ActivatedRouteSnapshot): Observable<any> | Promise<any> | any {
        // This looks for 'domainSlug' in params or data
        const domainSlug = route.params.domainSlug || route.data.domainSlug || null;

        if (domainSlug === null) {
            return null; // This is correct for /marketplace (root)
        }

        return this.shop.getDomain(domainSlug).pipe(
            catchError(error => {
                if (error instanceof HttpErrorResponse && error.status === 404) {
                    // This is likely where your 404 redirect is coming from!
                    this.router.navigateByUrl(this.root.notFound()).then();
                }
                return EMPTY;
            })
        );
    }
}
