import {
    AfterViewChecked,
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';

import {
    EndToEndSolution,
    EndToEndSolutionProduct,
    EndToEndSolutionStatus,
    MarketplaceProduct,
    MarketplaceProductImage
} from '../../../../../@models/end-to-end-solution.model';

@Component({
    selector: 'app-product-end-to-end-solution',
    templateUrl: './end-to-end.component.html',
    styleUrls: ['./end-to-end.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EndToEndSolutionComponent implements AfterViewChecked, AfterViewInit, OnChanges, OnDestroy {
    @Input() solution: EndToEndSolution | null = null;
    @Input() cartProductIds: ReadonlyArray<number | string> = [];
    @Input() addingProducts = false;
    @Input() initialDisplayLimit = 6;

    @Output() readonly addSelected =
        new EventEmitter<MarketplaceProduct[]>();

    @Output() readonly addCompleteSolution =
        new EventEmitter<MarketplaceProduct[]>();

    @Output() readonly quickView =
        new EventEmitter<MarketplaceProduct>();

    @ViewChild('productGrid')
    productGrid?: ElementRef<HTMLElement>;

    showAllProducts = false;
    rowSize = 3;
    private selectedIds = new Set<string>();
    private cartIds = new Set<string>();
    private rowObserver?: ResizeObserver;

    constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

    ngAfterViewInit(): void {
        this.watchRowSize();
    }

    ngAfterViewChecked(): void {
        this.watchRowSize();
    }

    ngOnDestroy(): void {
        this.rowObserver?.disconnect();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['initialDisplayLimit']) {
            this.initialDisplayLimit =
                this.normalizePositiveInteger(this.initialDisplayLimit, 6);
        }

        if (changes['cartProductIds']) {
            this.cartIds = new Set(
                (this.cartProductIds ?? []).map(id => String(id))
            );
            this.removeCartItemsFromSelection();
        }

        if (changes['solution']) {
            this.removeUnavailableSelections();
            if (!this.hasMoreProducts) {
                this.showAllProducts = false;
            }
        }
    }

    openQuickView(product: MarketplaceProduct): void {
        if (!product) {
            return;
        }

        this.quickView.emit(product);
    }

    get canDisplaySolution(): boolean {
        const status = String(this.solution?.status ?? '')
            .trim()
            .toLowerCase();

        return status === EndToEndSolutionStatus.Published &&
            this.solutionProducts.length > 0;
    }

    get solutionProducts(): EndToEndSolutionProduct[] {
        if (!Array.isArray(this.solution?.products)) {
            return [];
        }

        return this.solution.products
            .filter((entry): entry is EndToEndSolutionProduct => {
                if (!entry?.product) {
                    return false;
                }

                const id = entry.product.id;
                return id !== null &&
                    id !== undefined &&
                    String(id).trim().length > 0;
            })
            .slice()
            .sort((left, right) =>
                this.getDisplayOrder(left) - this.getDisplayOrder(right)
            );
    }

    get displayedProducts(): EndToEndSolutionProduct[] {
        return this.showAllProducts
            ? this.solutionProducts
            : this.solutionProducts.slice(0, this.rowSize);
    }

    get selectableProducts(): EndToEndSolutionProduct[] {
        return this.solutionProducts.filter(entry => !this.isProductInCart(entry));
    }

    get selectedEntries(): EndToEndSolutionProduct[] {
        return this.selectableProducts.filter(entry => this.isSelected(entry));
    }

    get selectedProductCount(): number {
        return this.selectedEntries.length;
    }

    get hasSelectableProducts(): boolean {
        return this.selectableProducts.length > 0;
    }

    get allProductsSelected(): boolean {
        return this.selectableProducts.length > 0 &&
            this.selectableProducts.every(entry => this.isSelected(entry));
    }

    get hasMoreProducts(): boolean {
        return this.solutionProducts.length > this.rowSize;
    }

    get hiddenProductCount(): number {
        return Math.max(this.solutionProducts.length - this.rowSize, 0);
    }

    toggleProductsView(): void {
        this.showAllProducts = !this.showAllProducts;
    }

    trackBySolutionProductId(
        _index: number,
        entry: EndToEndSolutionProduct
    ): string {
        return this.getEntryId(entry);
    }

    isSelected(entry: EndToEndSolutionProduct): boolean {
        return this.selectedIds.has(this.getEntryId(entry));
    }

    toggleProduct(entry: EndToEndSolutionProduct, selected: boolean): void {
        if (this.addingProducts || this.isProductInCart(entry)) {
            return;
        }

        const updated = new Set(this.selectedIds);
        const id = this.getEntryId(entry);
        selected ? updated.add(id) : updated.delete(id);
        this.selectedIds = updated;
    }

    selectAllProducts(): void {
        if (this.addingProducts) {
            return;
        }

        const updated = new Set(this.selectedIds);
        this.selectableProducts.forEach(entry =>
            updated.add(this.getEntryId(entry))
        );
        this.selectedIds = updated;
    }

    clearSelection(): void {
        if (!this.addingProducts) {
            this.selectedIds = new Set<string>();
        }
    }

    isProductInCart(entry: EndToEndSolutionProduct): boolean {
        return this.cartIds.has(String(entry.product.id));
    }

    addSelectedProducts(): void {
        if (!this.addingProducts && this.selectedProductCount > 0) {
            this.addSelected.emit(
                this.selectedEntries.map(entry => entry.product)
            );
        }
    }

    addAllSolutionProducts(): void {
        if (!this.addingProducts && this.hasSelectableProducts) {
            this.addCompleteSolution.emit(this.selectableProducts.map(entry => entry.product));
        }
    }

    getProductImage(entry: EndToEndSolutionProduct): string {
        const image = entry.product.images?.[0];

        if (typeof image === 'string' && image.trim()) {
            return image.trim();
        }

        if (this.isProductImage(image) && image.url.trim()) {
            return image.url.trim();
        }

        return 'assets/images/product_images/default-product.png';
    }

    getProductImageAlt(entry: EndToEndSolutionProduct): string {
        const image = entry.product.images?.[0];

        if (this.isProductImage(image) && image.alt?.trim()) {
            return image.alt.trim();
        }

        return entry.product.name || 'Marketplace Product';
    }

    private getEntryId(entry: EndToEndSolutionProduct): string {
        return String(entry.id);
    }

    private getDisplayOrder(entry: EndToEndSolutionProduct): number {
        const value = Number(entry.displayOrder);
        return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
    }

    private isProductImage(
        value: string | MarketplaceProductImage | undefined
    ): value is MarketplaceProductImage {
        return typeof value === 'object' &&
            value !== null &&
            typeof value.url === 'string';
    }

    private normalizePositiveInteger(value: unknown, fallback: number): number {
        const normalized = Number(value);
        return Number.isInteger(normalized) && normalized > 0
            ? normalized
            : fallback;
    }

    private watchRowSize(): void {
        const element = this.productGrid?.nativeElement;
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
        const element = this.productGrid?.nativeElement;
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

    private removeCartItemsFromSelection(): void {
        const updated = new Set(this.selectedIds);
        this.solutionProducts.forEach(entry => {
            if (this.isProductInCart(entry)) {
                updated.delete(this.getEntryId(entry));
            }
        });
        this.selectedIds = updated;
    }

    private removeUnavailableSelections(): void {
        const ids = new Set(
            this.solutionProducts.map(entry => this.getEntryId(entry))
        );

        this.selectedIds = new Set(
            Array.from(this.selectedIds).filter(id => ids.has(id))
        );

        this.removeCartItemsFromSelection();
    }
}
