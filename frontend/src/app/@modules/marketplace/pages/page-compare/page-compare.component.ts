import { Component, OnDestroy, OnInit } from '@angular/core';
import { CompareService } from '../../../../@shared/services/compare.service';
import { Product, ProductContact } from '../../../../@shared/interfaces/product';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RootService } from '../../../../@shared/services/root.service';

interface Feature {
    name: string;
    values: {[productId: number]: string};
}

interface CompareRow {
    label: string;
    value: (product: Product) => string;
}

@Component({
    selector: 'app-compare',
    templateUrl: './page-compare.component.html',
    styleUrls: ['./page-compare.component.scss']
})
export class PageCompareComponent implements OnInit, OnDestroy {
    private destroy$: Subject<void> = new Subject();
    products: Product[] = [];
    features: Feature[] = [];
    removedProducts: Product[] = [];
    clearing = false;
    readonly rows: CompareRow[] = [
        { label: 'SKU', value: (product) => this.text(product.sku) },
        { label: 'Domain', value: (product) => this.text(product.domain) },
        { label: 'Data type', value: (product) => this.text(product.datatype) },
        { label: 'Classification', value: (product) => this.text(product.classification) },
        { label: 'Platform', value: (product) => this.shortPlatform(product.platform) },
        { label: 'AD Group', value: (product) => this.text(product.ad_group) },
        { label: 'Personal information', value: (product) => this.text(product.pi) },
        { label: 'Sensitive personal information', value: (product) => this.text(product.sensitive_pi) },
        { label: 'Availability', value: (product) => this.text(product.availability) },
        { label: 'Data steward', value: (product) => this.contactName(product.data_steward) },
        { label: 'Contact', value: (product) => this.contactName(product.poc_name) },
    ];

    constructor(
        public root: RootService,
        private compare: CompareService
    ) { }

    ngOnInit(): void {
        this.compare.items$.pipe(takeUntil(this.destroy$)).subscribe(products => {
            const features: Feature[] = [];

            products.forEach(product => {
                if (product.attributes && Array.isArray(product.attributes)) {
                    product.attributes.forEach(productAttribute => {
                        let feature: Feature | undefined = features.find(eachFeature => eachFeature.name === productAttribute.name);

                        if (!feature) {
                            feature = {
                                name: productAttribute.name,
                                values: {}
                            };
                            features.push(feature);
                        }

                        if (productAttribute.values && Array.isArray(productAttribute.values)) {
                            feature.values[product.id] = productAttribute.values.map(x => x.name).join(', ');
                        } else {
                            feature.values[product.id] = '—';
                        }
                    });
                }
            });

            this.products = products;
            this.features = features.filter(feature => !this.rows.some(row => row.label === feature.name));
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    differs(values: string[]): boolean {
        return new Set(values.filter(value => value && value !== '—')).size > 1;
    }

    rowValues(row: CompareRow): string[] {
        return this.products.map(product => row.value(product));
    }

    featureValues(feature: Feature): string[] {
        return this.products.map(product => feature.values[product.id] || '—');
    }

    clearCompare(): void {
        if (this.clearing) {
            return;
        }
        this.clearing = true;
        this.compare.clear().subscribe({
            complete: () => {
                this.clearing = false;
            }
        });
    }

    remove(product: Product): void {
        if (this.removedProducts.includes(product)) {
            return;
        }

        this.removedProducts.push(product);
        this.compare.remove(product).subscribe({
            complete: () => {
                this.removedProducts = this.removedProducts.filter(eachProduct => eachProduct !== product);
            }
        });
    }

    private shortPlatform(value: string | null | undefined): string {
        const trimmed = (value || '').trim();
        if (!trimmed) {
            return '—';
        }
        if (trimmed.startsWith('TBDP')) {
            return 'TBDP';
        }
        if (trimmed.startsWith('API')) {
            return 'API';
        }
        return trimmed;
    }

    private text(value: string | null | undefined): string {
        const trimmed = (value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        return trimmed || '—';
    }

    private contactName(contact: ProductContact | string | null | undefined): string {
        if (!contact) {
            return '—';
        }
        if (typeof contact === 'string') {
            return contact.trim() || '—';
        }
        return (contact.name || '').trim() || '—';
    }
}
