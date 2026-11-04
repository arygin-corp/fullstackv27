import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { CartService } from '../../../../@shared/services/cart.service';
import { RootService } from '../../../../@shared/services/root.service';
import { OffcanvasRequestService } from '../../../../@shared/services/offcanvas-request.service';
import { OffcanvasDARService } from '../../../../@shared/services/offcanvas-dar.service';
import { CartItem } from '../../../../@shared/interfaces/cart-item';

interface CartFormStatus {
    complete: boolean;
    completedForms: string[];
    incompleteForms: string[];
}

@Component({
    selector: 'app-cart',
    templateUrl: './page-cart.component.html',
    styleUrls: ['./page-cart.component.scss']
})
export class PageCartComponent implements OnInit, OnDestroy {
    private destroy$: Subject<void> = new Subject<void>();
    selectedItem: CartItem | null = null;
    selectedDar: any | null = null;
    items: any[] = [];
    productItems: any[] = [];
    darRequests: any[] = [];
    allItems: any[] = [];
    productRequests: any[] = [];
    removedItems: any[] = [];
    updating = false;
    dropcartType: 'dropdown' | 'offcanvas' = 'offcanvas';
    product: any = null;
    activeTab: 'all' | 'products' | 'dar' = 'all';

    constructor(
        public cart: CartService,
        public root: RootService,
        public offCanvasRequestService: OffcanvasRequestService,
        public offCanvasDarService: OffcanvasDARService
    ) {}

    ngOnInit(): void {
        this.cart.items$.pipe(
            takeUntil(this.destroy$),
            map(cartItems => cartItems
                .filter(ci => !!ci.product)
                .map(cartItem => ({
                    type: 'product',
                    cartItem,
                    quantity: cartItem.quantity,
                    quantityControl: new FormControl({ value: cartItem.quantity, disabled: true }, Validators.required)
                }))
            )
        ).subscribe(items => {
            this.productItems = items;
            this.items = items;
            this.rebuildAll();
        });

        this.cart.state$.pipe(takeUntil(this.destroy$)).subscribe(state => {
            this.darRequests = (state.darRequests || []).map(d => ({ type: 'dar', dar: d }));
            this.productRequests = state.productRequests || [];
            this.rebuildAll();
        });
    }

    rebuildAll(): void { this.allItems = [...this.productItems, ...this.darRequests]; }
    editItem(item: CartItem): void { this.selectedItem = item; this.offCanvasRequestService.open(); }
    editDar(dar: any): void { this.selectedDar = dar; this.offCanvasDarService.open(); }

    remove(item: CartItem): void {
        this.removedItems.push(item);
        this.cart.remove(item).subscribe({ complete: () => this.removedItems = this.removedItems.filter(i => i !== item) });
    }

    removeDar(dar: any): void {
        if (typeof (this.cart as any).removeDar === 'function') {
            this.removedItems.push(dar);
            (this.cart as any).removeDar(dar).subscribe({ complete: () => this.removedItems = this.removedItems.filter(i => i !== dar) });
        }
    }

    update(): void {
        this.updating = true;
        this.cart.update(this.items
            .filter(item => item.quantityControl.value !== item.quantity)
            .map(item => ({ item: item.cartItem, quantity: item.quantityControl.value })))
            .subscribe({ complete: () => this.updating = false });
    }

    needUpdate(): boolean {
        return this.items.some(item => item.quantityControl.value !== item.quantity && item.quantityControl.valid);
    }

    getProductRequest(item: any): any | null {
        const cartItem = item?.cartItem;
        const product = cartItem?.product;
        if (!cartItem || !product) return null;
        return this.productRequests.find(request =>
            request?.cartItemId === cartItem?.id ||
            request?.productId === product?.id ||
            request?.product?.id === product?.id ||
            (!!product?.slug && request?.productSlug === product.slug)
        ) || null;
    }

    getProductFormStatus(item: any): CartFormStatus {
        const request = this.getProductRequest(item);
        const forms = [
            { label: 'Request Details', complete: this.hasValue(request?.requestDetails ?? request?.businessPurpose) },
            { label: 'Business Justification', complete: this.hasValue(request?.businessJustification ?? request?.justification) },
            { label: 'Data Usage', complete: this.hasValue(request?.dataUsage ?? request?.intendedUse) }
        ];
        return this.buildStatus(forms);
    }

    getDarFormStatus(dar: any): CartFormStatus {
        const forms = [
            { label: 'Platform', complete: this.hasValue(dar?.v_dar_platform) },
            { label: 'Data Domain', complete: this.hasValue(dar?.v_dar_dataDomainSelect) },
            { label: 'Requested For', complete: dar?.requesting_id === 'Me' || this.hasValue(dar?.requestorName) || this.hasValue(dar?.v_dar_objectid_reqfor) },
            { label: 'Environment', complete: this.hasValue(dar?.v_dar_environment) },
            { label: 'Access Type', complete: this.hasValue(dar?.v_dat_data_access_type) }
        ];
        return this.buildStatus(forms);
    }

    getItemFormStatus(item: any): CartFormStatus {
        return item?.type === 'dar' ? this.getDarFormStatus(item.dar) : this.getProductFormStatus(item);
    }

    private buildStatus(forms: Array<{label: string; complete: boolean}>): CartFormStatus {
        const completedForms = forms.filter(f => f.complete).map(f => f.label);
        const incompleteForms = forms.filter(f => !f.complete).map(f => f.label);
        return { complete: incompleteForms.length === 0, completedForms, incompleteForms };
    }

    get hasProducts(): boolean { return this.productItems.length > 0; }
    get hasDar(): boolean { return this.darRequests.length > 0; }
    get hasMixedCart(): boolean { return this.hasProducts && this.hasDar; }
    get hasMultipleDar(): boolean { return this.darRequests.length > 1; }

    get canCheckoutProducts(): boolean {
        return this.productItems.length > 0 && this.darRequests.length === 0 &&
            this.productItems.every(item => this.getProductFormStatus(item).complete);
    }

    get canCheckoutDar(): boolean {
        return this.darRequests.length === 1 && this.productItems.length === 0 &&
            this.getDarFormStatus(this.darRequests[0].dar).complete;
    }

    get canCheckout(): boolean { return this.canCheckoutProducts || this.canCheckoutDar; }

    get checkoutMessage(): string {
        if (this.hasMixedCart) return 'Products and Data Access Requests cannot be checked out together. Remove the DAR or remove all products to continue.';
        if (this.hasMultipleDar) return 'Only one Data Access Request can be checked out at a time. Remove the additional DARs to continue.';
        if (this.hasProducts) {
            const incomplete = this.productItems.filter(item => !this.getProductFormStatus(item).complete).length;
            if (incomplete) return `${incomplete} ${incomplete === 1 ? 'product still needs' : 'products still need'} required form information before checkout.`;
        }
        if (this.darRequests.length === 1 && !this.getDarFormStatus(this.darRequests[0].dar).complete) {
            return 'Complete the required Data Access Request form before checkout.';
        }
        return '';
    }

    getProductClassification(product: any): string {
        const classification = product?.classification;
        if (!classification) return '—';
        if (typeof classification === 'string') return classification.trim() || '—';
        return classification?.name || '—';
    }

    getProductDataSteward(product: any): string {
        const steward = product?.data_steward;
        if (!steward) return '—';
        if (typeof steward === 'string') return steward.trim() || '—';
        return steward?.name || '—';
    }

    getProductDomain(product: any): string {
        const domain = product?.domain;
        if (!domain) return '—';
        if (typeof domain === 'string') return domain.trim() || '—';
        if (Array.isArray(domain)) {
            return domain
                .map((item: any) => typeof item === 'string' ? item : (item?.name || item?.slug || ''))
                .filter(Boolean)
                .join(', ') || '—';
        }
        return domain?.name || domain?.slug || '—';
    }

    getProductDatatype(product: any): string {
        const datatype = product?.datatype;
        if (!datatype) return '—';
        if (typeof datatype === 'string') return datatype.trim() || '—';
        return datatype?.name || '—';
    }

    private displayValue(value: unknown): string {
        if (value === null || value === undefined) return '—';
        if (typeof value === 'string') return value.trim() || '—';
        if (typeof value === 'number' || typeof value === 'boolean') return String(value);
        return '—';
    }

    private hasValue(value: unknown): boolean {
        if (typeof value === 'string') return value.trim().length > 0;
        if (Array.isArray(value)) return value.length > 0;
        return value !== null && value !== undefined;
    }

    getProductImage(product: any): string {
        const fallback = 'assets/images/product_images/data-access-request.jpg';
        if (!product) return fallback;
        let img = '';
        if (Array.isArray(product.images) && product.images.length) img = String(product.images[0]).trim();
        else if (product.image) img = String(product.image).trim();
        else return fallback;
        if (!img) return fallback;
        if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('//')) return img;
        if (img.startsWith('/') || img.startsWith('assets/')) return img;
        return `assets/images/product_images/${img}`;
    }

    ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
