import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Product } from '../interfaces/product';

@Injectable({
    providedIn: 'root'
})
export class OffcanvasRequestService {
    private openSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private productSubject$ = new BehaviorSubject<Product | null>(null);

    isOpen$: Observable<boolean> = this.openSubject$.asObservable();
    readonly product$: Observable<Product | null> = this.productSubject$.asObservable();

    constructor(
        @Inject(PLATFORM_ID)
        private platformId: any
    ) { }

    open(product?: Product): void {
        this.productSubject$.next(product || null);
        if (isPlatformBrowser(this.platformId)) {
            const bodyWidth = document.body.offsetWidth;

            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = (document.body.offsetWidth - bodyWidth) + 'px';

            this.openSubject$.next(true);
        }
    }

    close(): void {
        if (isPlatformBrowser(this.platformId)) {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';

            this.openSubject$.next(false);
        }
    }

    toggle(): void {
        this.openSubject$.next(!this.openSubject$.value);
    }
}
