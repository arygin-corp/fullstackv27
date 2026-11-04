import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { Product } from '../interfaces/product';

@Injectable({
    providedIn: 'root'
})
export class QuickviewService {
    private readonly showSubject$ = new Subject<Product>();

    readonly show$: Observable<Product> =
        this.showSubject$.asObservable();

    show(product: Product): void {
        if (!product) {
            return;
        }

        this.showSubject$.next(product);
    }
}
