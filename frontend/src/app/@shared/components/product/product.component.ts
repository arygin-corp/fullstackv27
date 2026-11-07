import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of, Subject } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { Product } from '../../interfaces/product';
import { QuickviewService } from '../../services/quickview.service';
import { AppService } from '../../../@shared/services/app.service';
import { ProductService } from '../../../@shared/services/product.service';
import { CartService } from '../../services/cart.service';
import { FavoritesService } from '../../services/favorites.service';
import { CompareService } from '../../services/compare.service';
import { RootService } from '../../services/root.service';
import { OffcanvasProductService } from '../../services/offcanvas-product.service';
import { OffcanvasRequestService } from '../../services/offcanvas-request.service';
import { DropcartType } from '../../../@modules/header/components/dropcart/dropcart.component';
import { ProductAssociation } from '../../interfaces/product-associations';
import {EndToEndSolution, MarketplaceProduct} from '../../../../@models/end-to-end-solution.model';

export type ProductLayout = 'standard' | 'sidebar' | 'columnar' | 'quickview';

interface RouterData {
    headerLayout?: 'classic' | 'compact';
    dropcartType?: DropcartType;
}

interface AssociationCartResult {
    added: any[];
    alreadyInCart: any[];
    skipped: any[];
}

@Component({
    selector: 'app-product',
    templateUrl: './product.component.html',
    styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit, OnChanges, OnDestroy {
    @Input() layout: ProductLayout = 'standard';
    @Input() product!: any;
    @Input() email = '';
    @Input() message = '';

    headerLayout: 'classic' | 'compact' = 'classic';
    dropcartType: DropcartType = 'dropdown';
    readonly quantity = new FormControl(1, [Validators.required, Validators.min(1)]);

    addingToCart = false;
    addingAssociatedProducts = false;
    addingToForm = false;
    addingToWishlist = false;
    addingToCompare = false;
    keywords: any[] = [];

    readonly maxAssociatedProducts = 15;
    readonly initialAssociatedProductsToShow = 5;
    showAllAssociatedProducts = false;
    selectedAssociationIds = new Set<number>();
    private readonly destroy$ = new Subject<void>();

    cartProductIds: Array<string | number> = [];
    addingSolutionProducts = false;

    constructor(
        public route: ActivatedRoute,
        public offcanvasProduct: OffcanvasProductService,
        public offcanvasRequest: OffcanvasRequestService,
        private readonly productService: ProductService,
        private readonly cart: CartService,
        private readonly favorites: FavoritesService,
        private readonly compare: CompareService,
        private readonly quickview: QuickviewService,
        public root: RootService,
        public appSvc: AppService
    ) {
        this.route.data.pipe(takeUntil(this.destroy$)).subscribe((data: RouterData) => {
            this.headerLayout = data.headerLayout ?? 'classic';
            this.dropcartType = data.dropcartType ?? 'dropdown';
        });
    }

    ngOnInit(): void {
        this.resetAssociationState();
        this.refreshSolutionCartProductIds();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['product']) {
            this.resetAssociationState();
            this.refreshSolutionCartProductIds();
        }
    }

    ngOnDestroy(): void { 
        this.destroy$.next(); this.destroy$.complete(); 
    }

    get endToEndSolution(): EndToEndSolution | null {
        if (this.layout === 'quickview') {
            return null;
        }

        return this.product?.end_to_end_solution ?? null;
    }

    addSelectedSolutionProducts(products: MarketplaceProduct[]): void {
        this.addSolutionProducts(
            products,
            false
        );
    }

    addCompleteSolutionProducts(products: MarketplaceProduct[]): void {
        this.addSolutionProducts(
            products,
            true
        );
    }

    private addSolutionProducts(
        solutionProducts: MarketplaceProduct[],
        includeMainProduct: boolean
    ): void {
        if (
            this.addingSolutionProducts ||
            !Array.isArray(solutionProducts)
        ) {
            return;
        }

        const uniqueSolutionProducts =
            Array.from(
                new Map(
                    solutionProducts
                        .filter(product =>
                            product?.id !== null &&
                            product?.id !== undefined &&
                            String(product.id).trim().length > 0
                        )
                        .map(product => [
                            String(product.id),
                            product
                        ])
                ).values()
            );

        if (
            !includeMainProduct &&
            uniqueSolutionProducts.length === 0
        ) {
            this.notify(
                'No End-to-End products were selected.'
            );
            return;
        }

        this.addingSolutionProducts = true;

        const productRequests =
            uniqueSolutionProducts.map(product =>
                this.productService
                    .getProduct(product.id)
                    .pipe(
                        catchError(() => of(null))
                    )
            );

        const loadProducts$ =
            productRequests.length > 0
                ? forkJoin(productRequests)
                : of([]);

        loadProducts$
            .pipe(
                finalize(() => {
                    this.addingSolutionProducts = false;
                }),
                takeUntil(this.destroy$)
            )
            .subscribe(loadedProducts => {
                const validLoadedProducts =
                    loadedProducts.filter(
                        (product): product is Product =>
                            product !== null &&
                            product !== undefined
                    );

                const failedLoadCount =
                    uniqueSolutionProducts.length -
                    validLoadedProducts.length;

                const productsForCart: Product[] = [];

                if (
                    includeMainProduct &&
                    this.product
                ) {
                    productsForCart.push(
                        this.getCartReadyPrimaryProduct()
                    );
                }

                productsForCart.push(
                    ...validLoadedProducts
                );

                if (productsForCart.length === 0) {
                    this.notify(
                        'No products could be loaded for the cart.'
                    );
                    return;
                }

                this.cart
                    .addProductGroup(productsForCart)
                    .pipe(
                        takeUntil(this.destroy$)
                    )
                    .subscribe({
                        next: result => {
                            this.handleSolutionCartResult(
                                result,
                                failedLoadCount
                            );

                            this.refreshSolutionCartProductIds();
                        },

                        error: () => {
                            this.notify(
                                'The End-to-End suite could not be added to your cart.'
                            );
                        }
                    });
            });
    }

    openSolutionProductQuickView(clickedProduct: MarketplaceProduct): void {
        if (
            !clickedProduct ||
            clickedProduct.id === null ||
            clickedProduct.id === undefined
        ) {
            this.notify(
                'This product could not be opened in Quick View.'
            );
            return;
        }

        const clickedProductId = clickedProduct.id;

        this.productService
            .getProduct(clickedProductId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: loadedProduct => {
                    if (
                        !loadedProduct ||
                        String(loadedProduct.id) !==
                            String(clickedProductId)
                    ) {
                        this.notify(
                            'This product could not be loaded for Quick View.'
                        );
                        return;
                    }

                    this.quickview.show(loadedProduct);
                },

                error: () => {
                    this.notify(
                        'This product could not be loaded for Quick View.'
                    );
                }
            });
    }

    get associatedProducts(): ProductAssociation[] {
        const associations = this.product?.associated_products;
        if (!Array.isArray(associations)) { return []; }
        return associations.filter((association: ProductAssociation) =>
            !!association && Number.isFinite(association.id) && !!association.associated_product
        ).slice(0, this.maxAssociatedProducts);
    }

    get displayedAssociatedProducts(): ProductAssociation[] {
        return this.showAllAssociatedProducts
            ? this.associatedProducts
            : this.associatedProducts.slice(0, this.initialAssociatedProductsToShow);
    }

    get selectableAssociatedProducts(): ProductAssociation[] {
        return this.associatedProducts.filter(a => !this.isAssociatedProductInCart(a));
    }

    get selectableRelatedProducts(): ProductAssociation[] {
        return this.selectableAssociatedProducts.filter(a =>
            a.association_type === 'related' || a.association_type === 'both');
    }

    get selectableSimilarProducts(): ProductAssociation[] {
        return this.selectableAssociatedProducts.filter(a =>
            a.association_type === 'additional' || a.association_type === 'both');
    }

    get hasAssociatedProducts(): boolean { return this.associatedProducts.length > 0; }
    get hasSelectableAssociatedProducts(): boolean { return this.selectableAssociatedProducts.length > 0; }
    get hasSelectableRelatedProducts(): boolean { return this.selectableRelatedProducts.length > 0; }
    get hasSelectableSimilarProducts(): boolean { return this.selectableSimilarProducts.length > 0; }
    get hasMoreAssociatedProducts(): boolean {
        return this.associatedProducts.length > this.initialAssociatedProductsToShow;
    }
    get hiddenAssociatedProductCount(): number {
        return Math.max(this.associatedProducts.length - this.initialAssociatedProductsToShow, 0);
    }
    toggleAssociatedProductsView(): void { this.showAllAssociatedProducts = !this.showAllAssociatedProducts; }

    get selectedAssociationCount(): number { return this.selectedAssociationIds.size; }
    isAssociationSelected(association: ProductAssociation): boolean {
        return !!association && Number.isFinite(association.id) && this.selectedAssociationIds.has(association.id);
    }
    toggleAssociation(association: ProductAssociation, selected: boolean): void {
        if (this.addingAssociatedProducts || !association || !Number.isFinite(association.id) ||
            this.isAssociatedProductInCart(association)) { return; }
        const updated = new Set<number>(this.selectedAssociationIds);
        selected ? updated.add(association.id) : updated.delete(association.id);
        this.selectedAssociationIds = updated;
    }

    get allRelatedProductsSelected(): boolean {
        return this.areAllAssociationsSelected(this.selectableRelatedProducts);
    }
    get allSimilarProductsSelected(): boolean {
        return this.areAllAssociationsSelected(this.selectableSimilarProducts);
    }
    get allAssociatedProductsSelected(): boolean {
        return this.areAllAssociationsSelected(this.selectableAssociatedProducts);
    }
    selectAllRelatedProducts(): void { this.selectAssociations(this.selectableRelatedProducts); }
    selectAllSimilarProducts(): void { this.selectAssociations(this.selectableSimilarProducts); }
    selectAllAssociatedProducts(): void { this.selectAssociations(this.selectableAssociatedProducts); }
    clearAssociatedProductSelection(): void { this.selectedAssociationIds = new Set<number>(); }

    private areAllAssociationsSelected(associations: ProductAssociation[]): boolean {
        return associations.length > 0 && associations.every(a => this.selectedAssociationIds.has(a.id));
    }
    private selectAssociations(associations: ProductAssociation[]): void {
        if (this.addingAssociatedProducts || associations.length === 0) { return; }
        const updated = new Set<number>(this.selectedAssociationIds);
        associations.forEach(a => {
            if (Number.isFinite(a.id) && !this.isAssociatedProductInCart(a)) { updated.add(a.id); }
        });
        this.selectedAssociationIds = updated;
    }
    private resetAssociationState(): void {
        this.clearAssociatedProductSelection();
        this.showAllAssociatedProducts = false;
    }

    isAssociatedProductInCart(association: ProductAssociation): boolean {
        const productId = association?.associated_product?.id;
        return productId ? this.cart.isInCart(productId) : false;
    }
    get isPrimaryProductInCart(): boolean {
        return this.product?.id ? this.cart.isInCart(this.product.id) : false;
    }

    getAssociationBadgeLabel(association: ProductAssociation): string {
        switch (association?.association_type) {
            case 'related': return 'Related Product';
            case 'additional': return 'Similar Product';
            case 'both': return 'Related + Similar';
            default: return association?.badge_label || 'Similar Product';
        }
    }
    getAssociationBadgeClass(association: ProductAssociation): string {
        switch (association?.association_type) {
            case 'related': return 'association-badge--related';
            case 'additional': return 'association-badge--additional';
            case 'both': return 'association-badge--both';
            default: return 'association-badge--default';
        }
    }
    getAssociationCheckboxLabel(association: ProductAssociation): string {
        return `Select ${association?.associated_product?.name || 'associated product'}`;
    }
    trackAssociationById(index: number, association: ProductAssociation): number { return association.id; }

    private getCartReadyAssociations(associations: ProductAssociation[]): ProductAssociation[] {
        return associations.filter(a => !!a?.associated_product).map(association => {
            const sourceAssociation: any = association;
            const sourceProduct: any = association.associated_product;
            return {
                ...association,
                associated_product: {
                    ...sourceProduct,
                    dataSteward: this.firstDefined(sourceProduct.dataSteward, sourceProduct.data_steward,
                        sourceProduct.steward, sourceAssociation.dataSteward, sourceAssociation.data_steward,
                        sourceAssociation.steward),
                    domain: this.firstDefined(sourceProduct.domain, sourceProduct.dataDomain,
                        sourceProduct.data_domain, sourceAssociation.domain, sourceAssociation.dataDomain,
                        sourceAssociation.data_domain),
                    classification: this.firstDefined(sourceProduct.classification,
                        sourceProduct.dataClassification, sourceProduct.data_classification,
                        sourceAssociation.classification, sourceAssociation.dataClassification,
                        sourceAssociation.data_classification)
                }
            } as ProductAssociation;
        });
    }

    private getCartReadyPrimaryProduct(): any {
        return {
            ...this.product,
            dataSteward: this.firstDefined(this.product?.dataSteward, this.product?.data_steward, this.product?.steward),
            domain: this.firstDefined(this.product?.domain, this.product?.dataDomain, this.product?.data_domain),
            classification: this.firstDefined(this.product?.classification,
                this.product?.dataClassification, this.product?.data_classification)
        };
    }

    addSelectedAssociatedProducts(): void {
        if (this.addingAssociatedProducts || !this.product || this.selectedAssociationCount === 0) { return; }
        const validIds = new Set(this.selectableAssociatedProducts.map(a => a.id));
        const selectedIds = Array.from(this.selectedAssociationIds).filter(id => validIds.has(id));
        if (!selectedIds.length) { this.clearAssociatedProductSelection(); return; }
        this.addingAssociatedProducts = true;
        this.cart.addSelectedAssociatedProducts(this.getCartReadyPrimaryProduct(),
            this.getCartReadyAssociations(this.associatedProducts), selectedIds, true)
            .pipe(finalize(() => this.addingAssociatedProducts = false), takeUntil(this.destroy$))
            .subscribe({
                next: (result: AssociationCartResult) => {
                    this.handleAssociationCartResult(result);
                    this.clearAssociatedProductSelection();
                },
                error: () => this.notify('The selected products could not be added to your cart.')
            });
    }

    addAllAssociatedProducts(): void {
        if (this.addingAssociatedProducts || !this.product || !this.hasSelectableAssociatedProducts) { return; }
        this.addingAssociatedProducts = true;
        this.cart.addAllAssociatedProducts(this.getCartReadyPrimaryProduct(),
            this.getCartReadyAssociations(this.selectableAssociatedProducts), true)
            .pipe(finalize(() => this.addingAssociatedProducts = false), takeUntil(this.destroy$))
            .subscribe({
                next: (result: AssociationCartResult) => {
                    this.handleAssociationCartResult(result);
                    this.clearAssociatedProductSelection();
                },
                error: () => this.notify('The products could not be added to your cart.')
            });
    }

    private handleAssociationCartResult(result: AssociationCartResult): void {
        const added = Array.isArray(result?.added) ? result.added : [];
        const already = Array.isArray(result?.alreadyInCart) ? result.alreadyInCart : [];
        const skipped = Array.isArray(result?.skipped) ? result.skipped : [];
        const messages: string[] = [];
        if (added.length) messages.push(`${added.length} ${added.length === 1 ? 'product' : 'products'} added`);
        if (already.length) messages.push(`${already.length} ${already.length === 1 ? 'product is' : 'products are'} already in the cart`);
        if (skipped.length) messages.push(`${skipped.length} ${skipped.length === 1 ? 'product was' : 'products were'} skipped`);
        this.notify(messages.length ? `${messages.join(', ')}.` : 'No new products were added to your cart.');
    }

    addToCart(): void { this.addPrimaryProductToCart(); }
    viewDetails(): void { this.addPrimaryProductToCart(); }
    private addPrimaryProductToCart(): void {
        const quantity = this.getValidQuantity();
        if (this.addingToCart || !this.product || quantity === null) { return; }
        this.addingToCart = true;
        this.cart.add(this.getCartReadyPrimaryProduct(), quantity)
            .pipe(finalize(() => this.addingToCart = false), takeUntil(this.destroy$))
            .subscribe({ error: () => this.notify('The product could not be added to your cart.') });
    }

    openRequestForm(): void {
        if (!this.product) return;
        if (this.isPrimaryProductInCart) {
            this.notify(`"${this.product.name}" is already in your cart.`);
            return;
        }
        this.offcanvasRequest.open();
    }
    addToForm(): void {
        const quantity = this.getValidQuantity();
        if (this.addingToForm || !this.product || quantity === null) return;
        this.addingToForm = true;
        this.productService.setProductData(this.getCartReadyPrimaryProduct(), quantity);
        this.showForm();
    }
    showForm(): void { window.location.href = 'marketplace/product/request'; }
    onFormSubmit(formData: any): void {
        const quantity = this.getValidQuantity();
        if (!formData?.valid || !this.product || quantity === null || this.addingToCart) return;
        this.addingToCart = true;
        this.cart.add(this.getCartReadyPrimaryProduct(), quantity)
            .pipe(finalize(() => this.addingToCart = false), takeUntil(this.destroy$))
            .subscribe({ error: () => this.notify('The product could not be added to your cart.') });
    }
    addToWishlist(): void {
        if (this.addingToWishlist || !this.product) return;
        this.addingToWishlist = true;
        this.favorites.add(this.product)
            .pipe(finalize(() => this.addingToWishlist = false), takeUntil(this.destroy$))
            .subscribe({ error: () => this.notify('The product could not be added to your wishlist.') });
    }
    addToCompare(): void {
        if (this.addingToCompare || !this.product) return;
        this.addingToCompare = true;
        this.compare.add(this.product)
            .pipe(finalize(() => this.addingToCompare = false), takeUntil(this.destroy$))
            .subscribe({ error: (err) => this.notify(err?.message || 'The product could not be added for comparison.') });
    }

    getTeamsLink(contact: any): string {
        if (!contact?.email || !this.product) return '';
        const email = encodeURIComponent(contact.email);
        const name = encodeURIComponent(this.product.name);
        const message = encodeURIComponent(`Hi, ${contact.name}! I have an inquiry about ${this.product.name} in Data Marketplace.`);
        return `https://teams.microsoft.com/l/chat/0/0?users=${email}&topicName=${name}&message=${message}`;
    }
    getMailtoLink(contact: any): string {
        if (!contact?.email || !this.product) return '';
        const subject = encodeURIComponent(`Inquiry About ${this.product.name} product in Data Marketplace!`);
        const body = encodeURIComponent(`Hi ${contact.name},\n\nI was inquiring about the ${this.product.name} product in the Data Marketplace.`);
        return `mailto:${contact.email}?subject=${subject}&body=${body}`;
    }

    private firstDefined(...values: any[]): any {
        return values.find(value => value !== null && value !== undefined &&
            (typeof value !== 'string' || value.trim().length > 0));
    }
    private getValidQuantity(): number | null {
        const quantity = Number(this.quantity.value);
        if (!Number.isFinite(quantity) || quantity <= 0) {
            this.quantity.markAsTouched();
            return null;
        }
        return quantity;
    }
    private notify(message: string): void { this.appSvc.notifyInfo?.(message); }

    private handleSolutionCartResult(result: {
        added: Product[];
        alreadyInCart: Product[];
        skipped: Product[];
    },
    failedLoadCount = 0): void {
        const added = Array.isArray(result?.added) ? result.added : [];
        const alreadyInCart = Array.isArray(result?.alreadyInCart) ? result.alreadyInCart : [];
        const skipped = Array.isArray(result?.skipped) ? result.skipped : [];
        const messages: string[] = [];

        if (added.length > 0) {
            messages.push(`${added.length} ${
                added.length === 1 ? 'product' : 'products'
            } added`);
        }

        if (alreadyInCart.length > 0) {
            messages.push(`${alreadyInCart.length} ${
                alreadyInCart.length === 1 ? 'product was' : 'products were'
            } already in the cart`);
        }

        const totalSkipped = skipped.length + failedLoadCount;

        if (totalSkipped > 0) {
            messages.push(`${totalSkipped} ${
                totalSkipped === 1 ? 'product was' : 'products were'
            } skipped`);
        }

        this.notify(messages.length > 0 ? `${messages.join(', ')}.` : 'No new products were added to your cart.');
    }

    private refreshSolutionCartProductIds(): void {
        const solutionProducts = this.product?.end_to_end_solution?.products;

        if (!Array.isArray(solutionProducts)) {
            this.cartProductIds = [];
            return;
        }

        this.cartProductIds = solutionProducts.map((entry: any) => entry?.product?.id).filter(
            (productId: string | number | null | undefined): productId is string | number =>
            productId !== null &&
            productId !== undefined &&
            this.cart.isInCart(productId as any)
        );
    }
}
