import { Inject, Injectable, OnDestroy, PLATFORM_ID } from '@angular/core';
import { Product } from '../interfaces/product';
import { BehaviorSubject, Observable, of, Subject, timer } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { UserActivityService } from './user-activity.service';

interface CompareData {
    items: Product[];
}

@Injectable({
    providedIn: 'root'
})
export class CompareService implements OnDestroy {
    private data: CompareData = {
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
        return timer(1000).pipe(map(() => {
            const index = this.data.items.findIndex(item => item.id === product.id);
            if (index === -1) {
                // Using spread to ensure we aren't mutating the same reference everywhere
                this.data.items = [...this.data.items, product];
                this.save();
                this.activity.record('compare_add', product?.name || 'Catalog product', String(product?.id || ''));
            }
        }));
    }

    remove(product: Product): Observable<void> {
        return timer(1000).pipe(map(() => {
            const next = this.data.items.filter(item => item.id !== product.id);
            if (next.length !== this.data.items.length) {
                this.data.items = next;
                this.save();
                this.activity.record('compare_remove', product?.name || 'Catalog product', String(product?.id || ''));
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
            this.activity.record('compare_remove', 'Cleared all compare', '');
        }));
    }

    private save(): void {
        sessionStorage.setItem('compareItems', JSON.stringify(this.data.items));
        this.itemsSubject$.next([...this.data.items]); // Emit a fresh copy
    }

    private load(): void {
        const items = sessionStorage.getItem('compareItems');

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
