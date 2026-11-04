import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CartService } from '../../../../@shared/services/cart.service';
import { CartItem } from '../../../../@shared/interfaces/cart-item';
import { RootService } from '../../../../@shared/services/root.service';
import { OffcanvasCartService } from '../../../../@shared/services/offcanvas-cart.service';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

export type DropcartType = 'dropdown' | 'offcanvas';

@Component({
    selector: 'app-header-dropcart',
    templateUrl: './dropcart.component.html',
    styleUrls: ['./dropcart.component.scss']
})
export class DropcartComponent {
    private destroy$: Subject<void> = new Subject();
    allItems: any[] = []; // Unified list for the template
    removedItems: CartItem[] = [];
    @Input() type: DropcartType = 'dropdown';
    @Output() closeMenu: EventEmitter<void> = new EventEmitter<void>();

    constructor(
        public state: OffcanvasCartService,
        public cart: CartService,
        public root: RootService,
    ) { }

    ngOnInit(): void {
        this.cart.state$.pipe(
            takeUntil(this.destroy$),
            map(state => {
                const products = (state.items || []).map(item => ({ type: 'product', product: item.product, cartItem: item }));
                const dars = (state.darRequests || []).map(dar => ({ type: 'dar', dar: dar }));
                return [...products, ...dars];
            })
        ).subscribe(items => {
            this.allItems = items;
        });
    }

    remove(item: any): void {
        if (this.removedItems.includes(item)) return;
        this.removedItems.push(item);
        
        // Handle removal based on type
        if (item.type === 'product') {
            this.cart.remove(item.cartItem).subscribe({
                complete: () => this.removedItems = this.removedItems.filter(i => i !== item)
            });
        } else {
            this.cart.removeDar(item.dar).subscribe({
                complete: () => this.removedItems = this.removedItems.filter(i => i !== item)
            });
        }
    }

    getProductImage(product: any): string {
        const img = product?.images && product.images.length ? product.images[0] : null;
        // fallback image if none provided
        const fallback = 'assets/images/product_images/product-10.jpg';

        if (!img) return fallback;

        // If img is already an absolute URL (http(s) or protocol-less //), return it as-is
        if (typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('//'))) {
            return img;
        }

        // Otherwise treat it as a filename inside local assets folder
        return `assets/images/product_images/${img}`;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    close(): void {
        this.state.close();
    }
}
