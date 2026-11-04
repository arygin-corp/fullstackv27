import { Injectable } from '@angular/core';
import { Product } from '../interfaces/product';
import { Domain } from '../interfaces/domain';
import { Brand } from '../interfaces/brand';
import { Team } from '../interfaces/team';

@Injectable({
    providedIn: 'root'
})
export class RootService {
    constructor() { }

    home(): string {
        return '/';
    }

    shop(): string {
        return `/marketplace`;
    }

    domain(domain: Partial<Domain>): string {
        if (domain.type === 'shop') {
            const basePath = this.shop();

            if ('slug' in domain) {
                return `${basePath}/${domain.slug}`;
            }
            if ('id' in domain) {
                return `${basePath}/${domain.id}`;
            }

            throw Error('Provide domain with "path", "slug" or "id".');
        }
        if (domain.type === 'blog') {
            return this.blog();
        }

        throw Error('Provided domain with unknown type.');
    }

    product(product: Partial<Product>): string {
        const basePath = '/marketplace/product'; // Fixed singular and made absolute

        if ('slug' in product) {
            return `${basePath}/${product.slug}`;
        }
        if ('id' in product) {
            return `${basePath}/${product.id}`;
        }

        throw Error('Provide product with "slug" or "id".');
    }

    // noinspection JSUnusedLocalSymbols
    brand(brand: Partial<Brand>): string {
        return 'marketplace/brands';
    }

    team(brand: Partial<Team>): string {
        return 'marketplace/teams';
    }

    cart(): string {
        return 'marketplace/order/cart';
    }

    checkout(): string {
        return 'marketplace/order/cart/checkout';
    }

    compare(): string {
        return 'marketplace/user/compare';
    }

    favorites(): string {
        return 'marketplace/user/favorites';
    }

    dataAccessRequest(): string {
        return 'form/data-access-request';
    }

    blog(): string {
        return '/blog';
    }

    request(): string {
        return `/marketplace/product/request`;
    }

    post(): string {
        return `/blog/post-classic`;
    }

    login(): string {
        return '/account/login';
    }

    terms(): string {
        return '/site/terms';
    }

    notFound(): string {
        return `/site/not-found`;
    }
}
