import { Component } from '@angular/core';
import { FavoritesService } from '../../../../@shared/services/favorites.service';
import { Product } from '../../../../@shared/interfaces/product';
import { CartService } from '../../../../@shared/services/cart.service';
import { RootService } from '../../../../@shared/services/root.service';

@Component({
    selector: 'app-favorites',
    templateUrl: './page-favorites.component.html',
    styleUrls: ['./page-favorites.component.scss']
})
export class PageFavoritesComponent {
    constructor(
        public root: RootService,
        public favorites: FavoritesService,
        public cart: CartService
    ) { }

    addedToCartProducts: Product[] = [];
    removedProducts: Product[] = [];

    addToCart(product: Product): void {
        if (this.addedToCartProducts.includes(product)) {
            return;
        }

        this.addedToCartProducts.push(product);
        this.cart.add(product, 1).subscribe({
            complete: () => {
                this.addedToCartProducts = this.addedToCartProducts.filter(eachProduct => eachProduct !== product);
            }
        });
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
