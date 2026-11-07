import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FavoritesService } from '../../../../@shared/services/favorites.service';
import { Product } from '../../../../@shared/interfaces/product';
import { CartService } from '../../../../@shared/services/cart.service';
import { RootService } from '../../../../@shared/services/root.service';
import { OffcanvasRequestService } from '../../../../@shared/services/offcanvas-request.service';

@Component({
    selector: 'app-favorites',
    templateUrl: './page-favorites.component.html',
    styleUrls: ['./page-favorites.component.scss']
})
export class PageFavoritesComponent implements OnInit, OnDestroy {
    constructor(
        public root: RootService,
        public favorites: FavoritesService,
        public cart: CartService,
        private offcanvasRequest: OffcanvasRequestService
    ) { }

    removedProducts: Product[] = [];
    items: Product[] = [];
    clearing = false;
    page = 1;
    readonly pageSize = 7;
    private destroy$ = new Subject<void>();

    ngOnInit(): void {
        this.favorites.items$.pipe(takeUntil(this.destroy$)).subscribe((items) => {
            this.items = items || [];
            const pages = Math.max(1, Math.ceil(this.items.length / this.pageSize));
            if (this.page > pages) {
                this.page = pages;
            }
            this.removeCartedFavorites();
        });
        this.cart.items$.pipe(takeUntil(this.destroy$)).subscribe(() => this.removeCartedFavorites());
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    get pagedItems(): Product[] {
        const start = (this.page - 1) * this.pageSize;
        return this.items.slice(start, start + this.pageSize);
    }

    get pageCount(): number {
        return Math.ceil(this.items.length / this.pageSize);
    }

    onPageChange(page: number): void {
        this.page = page;
    }

    personName(person: { name?: string } | string | null | undefined): string {
        if (!person) {
            return '';
        }
        if (typeof person === 'string') {
            return person.trim();
        }
        return (person.name || '').trim();
    }

    classificationClass(value: string): string {
        const text = (value || '').toLowerCase();
        if (text.includes('highly') || text.includes('legal') || text.includes('personal information')) {
            return 'is-high';
        }
        if (text.includes('confidential') || text.includes('protected')) {
            return 'is-restricted';
        }
        return 'is-open';
    }

    clearFavorites(): void {
        if (this.clearing) {
            return;
        }
        this.clearing = true;
        this.favorites.clear().subscribe({
            complete: () => {
                this.clearing = false;
            }
        });
    }

    requestAccess(product: Product): void {
        if (this.isInCart(product)) {
            this.remove(product);
            return;
        }
        this.offcanvasRequest.open(product);
    }

    private removeCartedFavorites(): void {
        this.items.filter((product) => this.isInCart(product)).forEach((product) => this.remove(product));
    }

    private isInCart(product: Product): boolean {
        return this.cart.items.some((item) => String(item.product?.id) === String(product?.id));
    }

    remove(product: Product): void {
        if (this.removedProducts.includes(product)) {
            return;
        }

        this.removedProducts.push(product);
        this.favorites.remove(product).subscribe({
            complete: () => {
                this.removedProducts = this.removedProducts.filter(eachProduct => eachProduct !== product);
            }
        });
    }
}
