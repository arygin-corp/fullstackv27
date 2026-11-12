import {
    AfterViewChecked,
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnChanges,
    OnDestroy,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { AppService } from '../../../../@shared/services/app.service';
import { CartService } from '../../../services/cart.service';
import { ProductAssociation } from '../../../interfaces/product-associations';

interface AssociationCartResult {
    added: any[];
    alreadyInCart: any[];
    skipped: any[];
}

@Component({
    selector: 'app-product-associations',
    templateUrl: './product-associations.component.html',
    styleUrls: ['./product-associations.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductAssociationsComponent
    implements AfterViewChecked, AfterViewInit, OnChanges, OnDestroy {

    /**
     * Primary product displayed by the product page.
     *
     * Expected association source:
     * product.associated_products
     */
    @Input() product: any = null;

    /**
     * Maximum number of association records accepted from the API.
     */
    @Input() maxProducts = 15;

    /**
     * Number of cards initially displayed.
     */
    @Input() initialProductsToShow = 5;

    @ViewChild('associationList')
    associationList?: ElementRef<HTMLElement>;

    addingAssociatedProducts = false;
    showAllAssociatedProducts = false;
    rowSize = 3;

    selectedAssociationIds = new Set<number>();

    private readonly destroy$ = new Subject<void>();
    private rowObserver?: ResizeObserver;

    constructor(
        private readonly cart: CartService,
        private readonly appSvc: AppService,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (
            changes['product'] ||
            changes['maxProducts'] ||
            changes['initialProductsToShow']
        ) {
            this.maxProducts = this.normalizePositiveInteger(
                this.maxProducts,
                15
            );

            this.initialProductsToShow =
                this.normalizePositiveInteger(
                    this.initialProductsToShow,
                    5
                );

            this.resetAssociationState();
        }
    }

    ngAfterViewInit(): void {
        this.watchRowSize();
    }

    ngAfterViewChecked(): void {
        this.watchRowSize();
    }

    ngOnDestroy(): void {
        this.rowObserver?.disconnect();
        this.destroy$.next();
        this.destroy$.complete();
    }

    // =========================================================
    // Association Collections
    // =========================================================

    get associatedProducts(): ProductAssociation[] {
        const associations = this.product?.associated_products;

        if (!Array.isArray(associations)) {
            return [];
        }

        return associations
            .filter(
                (association: ProductAssociation) =>
                    !!association &&
                    Number.isFinite(Number(association.id)) &&
                    !!association.associated_product
            )
            .slice(0, this.maxProducts);
    }

    get displayedAssociatedProducts(): ProductAssociation[] {
        if (this.showAllAssociatedProducts) {
            return this.associatedProducts;
        }

        return this.associatedProducts.slice(0, this.rowSize);
    }

    get selectableAssociatedProducts(): ProductAssociation[] {
        return this.associatedProducts.filter(
            association =>
                !this.isAssociatedProductInCart(association)
        );
    }

    get selectableRelatedProducts(): ProductAssociation[] {
        return this.selectableAssociatedProducts.filter(
            association =>
                association.association_type === 'related' ||
                association.association_type === 'both'
        );
    }

    get selectableSimilarProducts(): ProductAssociation[] {
        return this.selectableAssociatedProducts.filter(
            association =>
                association.association_type === 'additional' ||
                association.association_type === 'both'
        );
    }

    // =========================================================
    // Display State
    // =========================================================

    get hasAssociatedProducts(): boolean {
        return this.associatedProducts.length > 0;
    }

    get hasSelectableAssociatedProducts(): boolean {
        return this.selectableAssociatedProducts.length > 0;
    }

    get hasSelectableRelatedProducts(): boolean {
        return this.selectableRelatedProducts.length > 0;
    }

    get hasSelectableSimilarProducts(): boolean {
        return this.selectableSimilarProducts.length > 0;
    }

    get hasMoreAssociatedProducts(): boolean {
        return this.associatedProducts.length > this.rowSize;
    }

    get hiddenAssociatedProductCount(): number {
        return Math.max(
            this.associatedProducts.length - this.rowSize,
            0
        );
    }

    toggleAssociatedProductsView(): void {
        this.showAllAssociatedProducts =
            !this.showAllAssociatedProducts;
    }

    // =========================================================
    // Selection
    // =========================================================

    get selectedAssociationCount(): number {
        return this.selectedAssociationIds.size;
    }

    isAssociationSelected(
        association: ProductAssociation
    ): boolean {
        return (
            !!association &&
            Number.isFinite(Number(association.id)) &&
            this.selectedAssociationIds.has(
                Number(association.id)
            )
        );
    }

    toggleAssociation(
        association: ProductAssociation,
        selected: boolean
    ): void {
        if (
            this.addingAssociatedProducts ||
            !association ||
            !Number.isFinite(Number(association.id)) ||
            this.isAssociatedProductInCart(association)
        ) {
            return;
        }

        const associationId = Number(association.id);
        const updated = new Set<number>(
            this.selectedAssociationIds
        );

        if (selected) {
            updated.add(associationId);
        } else {
            updated.delete(associationId);
        }

        this.selectedAssociationIds = updated;
    }

    get allRelatedProductsSelected(): boolean {
        return this.areAllAssociationsSelected(
            this.selectableRelatedProducts
        );
    }

    get allSimilarProductsSelected(): boolean {
        return this.areAllAssociationsSelected(
            this.selectableSimilarProducts
        );
    }

    get allAssociatedProductsSelected(): boolean {
        return this.areAllAssociationsSelected(
            this.selectableAssociatedProducts
        );
    }

    selectAllRelatedProducts(): void {
        this.selectAssociations(
            this.selectableRelatedProducts
        );
    }

    selectAllSimilarProducts(): void {
        this.selectAssociations(
            this.selectableSimilarProducts
        );
    }

    selectAllAssociatedProducts(): void {
        this.selectAssociations(
            this.selectableAssociatedProducts
        );
    }

    clearAssociatedProductSelection(): void {
        if (this.addingAssociatedProducts) {
            return;
        }

        this.resetSelection();
    }

    private areAllAssociationsSelected(
        associations: ProductAssociation[]
    ): boolean {
        return (
            associations.length > 0 &&
            associations.every(association =>
                this.selectedAssociationIds.has(
                    Number(association.id)
                )
            )
        );
    }

    private selectAssociations(
        associations: ProductAssociation[]
    ): void {
        if (
            this.addingAssociatedProducts ||
            associations.length === 0
        ) {
            return;
        }

        const updated = new Set<number>(
            this.selectedAssociationIds
        );

        associations.forEach(association => {
            const associationId = Number(association.id);

            if (
                Number.isFinite(associationId) &&
                !this.isAssociatedProductInCart(association)
            ) {
                updated.add(associationId);
            }
        });

        this.selectedAssociationIds = updated;
    }

    private resetAssociationState(): void {
        this.selectedAssociationIds = new Set<number>();
        this.showAllAssociatedProducts = false;
    }

    private watchRowSize(): void {
        const element = this.associationList?.nativeElement;
        if (!element || this.rowObserver) {
            return;
        }

        this.updateRowSize();
        if (typeof ResizeObserver === 'undefined') {
            return;
        }

        this.rowObserver = new ResizeObserver(() => this.updateRowSize());
        this.rowObserver.observe(element);
    }

    private updateRowSize(): void {
        const element = this.associationList?.nativeElement;
        if (!element) {
            return;
        }

        const columns = getComputedStyle(element)
            .gridTemplateColumns
            .split(' ')
            .filter(Boolean).length;
        const next = Math.max(columns, 1);
        if (next === this.rowSize) {
            return;
        }

        this.rowSize = next;
        this.changeDetectorRef.markForCheck();
    }

    // =========================================================
    // Cart State
    // =========================================================

    isAssociatedProductInCart(association: ProductAssociation): boolean {
        const productId = association?.associated_product?.id;

        return productId !== null && productId !== undefined ? this.cart.isInCart(productId) : false;
    }

    // =========================================================
    // Presentation
    // =========================================================

    getAssociationBadgeLabel(
        association: ProductAssociation
    ): string {
        switch (association?.association_type) {
            case 'related':
                return 'Related Product';

            case 'additional':
                return 'Similar Product';

            case 'both':
                return 'Related + Similar';

            default:
                return (
                    association?.badge_label ||
                    'Similar Product'
                );
        }
    }

    getAssociationBadgeClass(
        association: ProductAssociation
    ): string {
        switch (association?.association_type) {
            case 'related':
                return 'association-badge--related';

            case 'additional':
                return 'association-badge--additional';

            case 'both':
                return 'association-badge--both';

            default:
                return 'association-badge--default';
        }
    }

    getAssociationCheckboxLabel(
        association: ProductAssociation
    ): string {
        if (this.isAssociatedProductInCart(association)) {
            return `${
                association?.associated_product?.name ||
                'Associated product'
            } is already in the cart`;
        }

        return `Select ${
            association?.associated_product?.name ||
            'associated product'
        }`;
    }

    getAssociatedProductImage(association: ProductAssociation): string {
        const firstImage = association?.associated_product?.images?.[0];

        return typeof firstImage === 'string' && firstImage.trim().length > 0 ? firstImage : 'assets/images/product_images/default-product.png';
    }

    trackAssociationById(_index: number, association: ProductAssociation): number {
        return Number(association.id);
    }

    // =========================================================
    // Add Selected
    // =========================================================

    addSelectedAssociatedProducts(): void {
        if (
            this.addingAssociatedProducts ||
            !this.product ||
            this.selectedAssociationCount === 0
        ) {
            return;
        }

        const validIds = new Set(
            this.selectableAssociatedProducts.map(
                association => Number(association.id)
            )
        );

        const selectedIds = Array.from(
            this.selectedAssociationIds
        ).filter(id => validIds.has(id));

        if (selectedIds.length === 0) {
            this.clearAssociatedProductSelection();
            return;
        }

        this.addingAssociatedProducts = true;

        this.cart
            .addSelectedAssociatedProducts(
                this.getCartReadyPrimaryProduct(),
                this.getCartReadyAssociations(
                    this.associatedProducts
                ),
                selectedIds,
                true
            )
            .pipe(
                finalize(() => {
                    this.addingAssociatedProducts = false;
                    this.changeDetectorRef.markForCheck();
                }),
                takeUntil(this.destroy$)
            )
            .subscribe({
                next: (
                    result: AssociationCartResult
                ) => {
                    this.handleAssociationCartResult(result);
                    this.resetSelection();
                    this.changeDetectorRef.markForCheck();
                },
                error: () => {
                    this.notify(
                        'The selected products could not be added to your cart.'
                    );
                }
            });
    }

    // =========================================================
    // Add All
    // =========================================================

    addAllAssociatedProducts(): void {
        if (
            this.addingAssociatedProducts ||
            !this.product ||
            !this.hasSelectableAssociatedProducts
        ) {
            return;
        }

        this.addingAssociatedProducts = true;

        this.cart
            .addAllAssociatedProducts(
                this.getCartReadyPrimaryProduct(),
                this.getCartReadyAssociations(
                    this.selectableAssociatedProducts
                ),
                true
            )
            .pipe(
                finalize(() => {
                    this.addingAssociatedProducts = false;
                    this.changeDetectorRef.markForCheck();
                }),
                takeUntil(this.destroy$)
            )
            .subscribe({
                next: (
                    result: AssociationCartResult
                ) => {
                    this.handleAssociationCartResult(result);
                    this.resetSelection();
                    this.changeDetectorRef.markForCheck();
                },
                error: () => {
                    this.notify(
                        'The products could not be added to your cart.'
                    );
                }
            });
    }

    private handleAssociationCartResult(
        result: AssociationCartResult
    ): void {
        const added = Array.isArray(result?.added)
            ? result.added
            : [];

        const already = Array.isArray(
            result?.alreadyInCart
        )
            ? result.alreadyInCart
            : [];

        const skipped = Array.isArray(result?.skipped)
            ? result.skipped
            : [];

        const messages: string[] = [];

        if (added.length) {
            messages.push(
                `${added.length} ${
                    added.length === 1
                        ? 'product'
                        : 'products'
                } added`
            );
        }

        if (already.length) {
            messages.push(
                `${already.length} ${
                    already.length === 1
                        ? 'product is'
                        : 'products are'
                } already in the cart`
            );
        }

        if (skipped.length) {
            messages.push(
                `${skipped.length} ${
                    skipped.length === 1
                        ? 'product was'
                        : 'products were'
                } skipped`
            );
        }

        this.notify(
            messages.length
                ? `${messages.join(', ')}.`
                : 'No new products were added to your cart.'
        );
    }

    // =========================================================
    // Cart Mapping
    // =========================================================

    private getCartReadyAssociations(
        associations: ProductAssociation[]
    ): ProductAssociation[] {
        return associations
            .filter(
                association =>
                    !!association?.associated_product
            )
            .map(association => {
                const sourceAssociation: any =
                    association;

                const sourceProduct: any =
                    association.associated_product;

                return {
                    ...association,
                    associated_product: {
                        ...sourceProduct,

                        dataSteward: this.firstDefined(
                            sourceProduct.dataSteward,
                            sourceProduct.data_steward,
                            sourceProduct.steward,
                            sourceAssociation.dataSteward,
                            sourceAssociation.data_steward,
                            sourceAssociation.steward
                        ),

                        domain: this.firstDefined(
                            sourceProduct.domain,
                            sourceProduct.dataDomain,
                            sourceProduct.data_domain,
                            sourceAssociation.domain,
                            sourceAssociation.dataDomain,
                            sourceAssociation.data_domain
                        ),

                        classification: this.firstDefined(
                            sourceProduct.classification,
                            sourceProduct.dataClassification,
                            sourceProduct.data_classification,
                            sourceAssociation.classification,
                            sourceAssociation.dataClassification,
                            sourceAssociation.data_classification
                        )
                    }
                } as ProductAssociation;
            });
    }

    private getCartReadyPrimaryProduct(): any {
        return {
            ...this.product,

            dataSteward: this.firstDefined(
                this.product?.dataSteward,
                this.product?.data_steward,
                this.product?.steward
            ),

            domain: this.firstDefined(
                this.product?.domain,
                this.product?.dataDomain,
                this.product?.data_domain
            ),

            classification: this.firstDefined(
                this.product?.classification,
                this.product?.dataClassification,
                this.product?.data_classification
            )
        };
    }

    private firstDefined(...values: any[]): any {
        return values.find(
            value =>
                value !== null &&
                value !== undefined &&
                (
                    typeof value !== 'string' ||
                    value.trim().length > 0
                )
        );
    }

    private normalizePositiveInteger(
        value: unknown,
        fallback: number
    ): number {
        const normalized = Number(value);

        return Number.isInteger(normalized) &&
            normalized > 0
            ? normalized
            : fallback;
    }

    private notify(message: string): void {
        this.appSvc.notifyInfo?.(message);
    }

    private resetSelection(): void {
        this.selectedAssociationIds = new Set<number>();
    }
}