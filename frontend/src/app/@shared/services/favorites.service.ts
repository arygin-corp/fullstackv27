import { Inject, Injectable, OnDestroy, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject, timer } from 'rxjs';
import { Product } from '../interfaces/product';
import { map, takeUntil } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { UserActivityService } from './user-activity.service';

interface FavoritesData {
    items: Product[];
}

@Injectable({
    providedIn: 'root'
})
export class FavoritesService implements OnDestroy {
    private data: FavoritesData = {
        items: []
    };

    private destroy$: Subject<void> = new Subject();
    private itemsSubject$: BehaviorSubject<Product[]> = new BehaviorSubject<Product[]>([]);
    private onAddingSubject$: Subject<Product> = new Subject();

    readonly items$: Observable<Product[]> = this.itemsSubject$.pipe(takeUntil(this.destroy$));
    readonly count$: Observable<number> = this.itemsSubject$.pipe(map(items => items.length));
    readonly onAdding$: Observable<Product> = this.onAddingSubject$.asObservable();

    constructor(
        @Inject(PLATFORM_ID)
        private platformId: any,
        private activity: UserActivityService
    ) {
        if (isPlatformBrowser(this.platformId)) {
            this.load();
        }
    }

    add(product: Product): Observable<void> {
        // timer only for demo
        return timer(1000).pipe(map(() => {
            this.onAddingSubject$.next(product);

            const index = this.data.items.findIndex(item => item.id === product.id);

            if (index === -1) {
                this.data.items.push(product);
                this.save();
                this.activity.record('favorite_add', product?.name || 'Catalog product', String(product?.id || ''));
            }
        }));
    }

    remove(product: Product): Observable<void> {
        // timer only for demo
        return timer(1000).pipe(map(() => {
            const index = this.data.items.findIndex(item => item.id === product.id);

            if (index !== -1) {
                this.data.items.splice(index, 1);
                this.save();
                this.activity.record('favorite_remove', product?.name || 'Catalog product', String(product?.id || ''));
            }
        }));
    }

    clear(): Observable<void> {
        return of(undefined).pipe(map(() => {
            if (!this.data.items.length) {
                return;
            }
            this.data.items = [];
            this.save();
            this.activity.record('favorite_remove', 'Cleared all favorites', '');
        }));
    }

    private save(): void {
        sessionStorage.setItem('wishlistItems', JSON.stringify(this.data.items));

        this.itemsSubject$.next(this.data.items);
    }

    private load(): void {
        const items = sessionStorage.getItem('wishlistItems');

        if (items) {
            this.data.items = JSON.parse(items);
            this.itemsSubject$.next(this.data.items);
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
