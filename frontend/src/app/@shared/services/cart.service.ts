import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin, of, Subject } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { ProductAssociation } from '../interfaces/product-associations';
import { Product } from '../interfaces/product';
import { CartItem } from '../interfaces/cart-item';
import { UserActivityService } from './user-activity.service';
import { AiSuggestedProductService } from './ai-suggested-product.service';

export interface CartTotal {
    title: string;
    price: number;
    type: 'shipping' | 'fee' | 'tax' | 'other';
}

export interface BulkCartAddResult {
    added: Product[];
    alreadyInCart: Product[];
    skipped: Product[];
}

export interface MarketplaceState {
    items: CartItem[];
    catalogItems: CartItem[];
    darRequests: any[];
    productRequests: any[];
}

type CartProduct = Product & {
    productAssociation?: ProductAssociation;
};

@Injectable({ providedIn: 'root' })
export class CartService {
    private data = {
        items: [] as CartItem[],
        darRequests: [] as any[],
        productRequests: [] as any[],
        quantity: 0,
        subtotal: 0,
        totals: [] as CartTotal[],
        total: 0
    };

    private lastReceipt: any = null;
    private itemsSubject$ = new BehaviorSubject<CartItem[]>([]);
    private quantitySubject$ = new BehaviorSubject<number>(0);
    private subtotalSubject$ = new BehaviorSubject<number>(0);
    private totalsSubject$ = new BehaviorSubject<CartTotal[]>([]);
    private totalSubject$ = new BehaviorSubject<number>(0);
    private stateSubject$ = new BehaviorSubject<MarketplaceState>({
        items: [],
        catalogItems: [],
        darRequests: [],
        productRequests: []
    });

    readonly items$ = this.itemsSubject$.asObservable();
    readonly quantity$ = this.quantitySubject$.asObservable();
    readonly subtotal$ = this.subtotalSubject$.asObservable();
    readonly totals$ = this.totalsSubject$.asObservable();
    readonly total$ = this.totalSubject$.asObservable();
    readonly state$ = this.stateSubject$.asObservable();

    get items(): ReadonlyArray<CartItem> {
        return this.data.items;
    }

    constructor(
        @Inject(PLATFORM_ID) private platformId: object,
        private activity: UserActivityService,
        private aiSuggestions: AiSuggestedProductService
    ) {
        if (isPlatformBrowser(this.platformId)) {
            this.loadFromStorage();
        }
    }

    public setReceipt(data: any): void {
        this.lastReceipt = data;
        if (!isPlatformBrowser(this.platformId)) return;
        try {
            sessionStorage.setItem('lastReceipt', JSON.stringify(data));
        } catch {}
    }

    public loadFromStorage(): void {
        if (!isPlatformBrowser(this.platformId)) return;

        try {
            const items = sessionStorage.getItem('cartItems');
            const dataRequests = sessionStorage.getItem('darRequests');
            const productRequests = sessionStorage.getItem('productRequests');

            this.data.items = items ? JSON.parse(items) : [];
            this.data.darRequests = dataRequests ? JSON.parse(dataRequests) : [];
            this.data.productRequests = productRequests ? JSON.parse(productRequests) : [];
        } catch {
            this.data.items = [];
            this.data.darRequests = [];
            this.data.productRequests = [];
        }

        this.calc();
    }

    public getSavedCart(): any | null {
        return this.readSavedCart();
    }

    public retrieveCart(): boolean {
        const saved = this.readSavedCart();
        if (!saved) {
            return false;
        }
        this.data.items = saved.items || [];
        this.data.darRequests = saved.darRequests || [];
        this.data.productRequests = saved.productRequests || [];
        localStorage.removeItem('savedCart');
        this.persistAndPublish();
        return true;
    }

    public saveCart(): Date | null {
        if (!isPlatformBrowser(this.platformId)) {
            return null;
        }
        if (!this.data.items.length && !this.data.darRequests.length) {
            return null;
        }
        const expiresAt = this.addBusinessDays(new Date(), 7);
        try {
            localStorage.setItem('savedCart', JSON.stringify({
                expiresAt: expiresAt.toISOString(),
                items: this.data.items,
                darRequests: this.data.darRequests,
                productRequests: this.data.productRequests,
            }));
        } catch {
            return null;
        }
        this.data.items = [];
        this.data.darRequests = [];
        this.data.productRequests = [];
        this.persistAndPublish();
        return expiresAt;
    }

    public savedCartExpiresAt(): Date | null {
        const saved = this.readSavedCart();
        if (!saved?.expiresAt) {
            return null;
        }
        const expiresAt = new Date(saved.expiresAt);
        return Number.isNaN(expiresAt.getTime()) ? null : expiresAt;
    }

    private save(): void {
        if (!isPlatformBrowser(this.platformId)) return;

        try {
            sessionStorage.setItem('cartItems', JSON.stringify(this.data.items));
            sessionStorage.setItem('darRequests', JSON.stringify(this.data.darRequests));
            sessionStorage.setItem('productRequests', JSON.stringify(this.data.productRequests));
        } catch {}
    }

    private calc(): void {
        const productQuantity = this.data.items.reduce(
            (total, item) => total + item.quantity,
            0
        );

        const subtotal = this.data.items.reduce((total, item) => {
            const price = Number(item.product.price) || 0;
            return total + price * item.quantity;
        }, 0);

        const dataRequestQuantity = this.data.darRequests?.length || 0;
        this.data.quantity = productQuantity + dataRequestQuantity;
        this.data.subtotal = subtotal;
        this.data.total = subtotal + this.data.totals.reduce(
            (total, item) => total + (Number(item.price) || 0),
            0
        );

        const cartItems = [...this.data.items];
        const dataRequests = [...(this.data.darRequests || [])];
        const productRequests = [...(this.data.productRequests || [])];

        this.itemsSubject$.next(cartItems);
        this.quantitySubject$.next(this.data.quantity);
        this.subtotalSubject$.next(this.data.subtotal);
        this.totalsSubject$.next([...this.data.totals]);
        this.totalSubject$.next(this.data.total);
        this.stateSubject$.next({
            items: cartItems,
            catalogItems: cartItems,
            darRequests: dataRequests,
            productRequests
        });
    }

    public getReceipt(): any {
        if (this.lastReceipt) return this.lastReceipt;

        if (isPlatformBrowser(this.platformId)) {
            const storedReceipt = sessionStorage.getItem('lastReceipt');
            if (storedReceipt) {
                try {
                    return JSON.parse(storedReceipt);
                } catch {}
            }
        }

        return {
            items: [...this.data.items],
            darRequests: [...(this.data.darRequests || [])]
        };
    }

    public add(
        product: Product,
        quantity = 1,
        options: any[] = [],
        formData?: any
    ): Observable<CartItem> {
        const safeQuantity = Number.isFinite(quantity) && quantity > 0
            ? Math.floor(quantity)
            : 1;

        const incomingProduct = this.cloneProduct(product);
        let item = this.findItem(product.id);

        if (item) {
            item.quantity += safeQuantity;
            item.product = this.mergeProduct(item.product, incomingProduct);
            if (formData !== undefined) item.formData = formData;
            if (options.length > 0) item.options = options;
            this.keepAiSuggestion(item, incomingProduct);
        } else {
            item = {
                id: incomingProduct.id,
                product: incomingProduct,
                quantity: safeQuantity,
                options,
                formData,
                aiSuggested: this.aiSuggestions.isSuggested(incomingProduct)
            };
            this.data.items.push(item);
        }

        this.persistAndPublish();
        this.recordCartAdd(incomingProduct, safeQuantity);
        return of(item);
    }

    public saveRequest(product: Product, formData: any): Observable<CartItem> {
        const existing = this.findItem(product.id);
        if (!existing) {
            return this.add(product, 1, [], formData);
        }
        existing.formData = formData;
        existing.product = this.mergeProduct(existing.product, this.cloneProduct(product));
        this.keepAiSuggestion(existing, product);
        this.persistAndPublish();
        return of(existing);
    }

    public addOnce(
        product: Product,
        options: any[] = [],
        formData?: any
    ): Observable<CartItem> {
        const incomingProduct = this.cloneProduct(product);
        const existingItem = this.findItem(incomingProduct.id);

        if (existingItem) {
            existingItem.product = this.mergeProduct(existingItem.product, incomingProduct);
            if (formData !== undefined) existingItem.formData = formData;
            if (options.length > 0) existingItem.options = options;
            this.keepAiSuggestion(existingItem, incomingProduct);
            this.persistAndPublish();
            return of(existingItem);
        }

        const item: CartItem = {
            id: incomingProduct.id,
            product: incomingProduct,
            quantity: 1,
            options,
            formData,
            aiSuggested: this.aiSuggestions.isSuggested(incomingProduct)
        };

        this.data.items.push(item);
        this.persistAndPublish();
        this.recordCartAdd(incomingProduct, 1);
        return of(item);
    }

    public addSelectedAssociatedProducts(
        primaryProduct: Product,
        associations: ProductAssociation[],
        selectedAssociationIds: ReadonlyArray<number>,
        includePrimaryProduct = true
    ): Observable<BulkCartAddResult> {
        const selectedIds = new Set(selectedAssociationIds);
        const selectedAssociations = associations.filter(
            association => selectedIds.has(association.id)
        );

        return this.addAssociationGroup(
            primaryProduct,
            selectedAssociations,
            includePrimaryProduct
        );
    }

    public addAllAssociatedProducts(
        primaryProduct: Product,
        associations: ProductAssociation[],
        includePrimaryProduct = true
    ): Observable<BulkCartAddResult> {
        return this.addAssociationGroup(
            primaryProduct,
            associations,
            includePrimaryProduct
        );
    }

    public addAssociatedProductsOnly(
        associations: ProductAssociation[]
    ): Observable<BulkCartAddResult> {
        return this.addAssociationGroup(null, associations, false);
    }

    private addAssociationGroup(
        primaryProduct: Product | null,
        associations: ProductAssociation[],
        includePrimaryProduct: boolean
    ): Observable<BulkCartAddResult> {
        const result: BulkCartAddResult = {
            added: [],
            alreadyInCart: [],
            skipped: []
        };

        const products: CartProduct[] = [];

        if (includePrimaryProduct && primaryProduct) {
            products.push(this.cloneProduct(primaryProduct));
        }

        associations.slice(0, 5).forEach(association => {
            const product = this.createAssociationCartProduct(association);
            if (product) {
                products.push(product);
            } else if ((association as any)?.associated_product) {
                result.skipped.push((association as any).associated_product);
            }
        });

        const uniqueProducts = new Map<Product['id'], CartProduct>();
        products.forEach(product => {
            if (this.isUsableProduct(product)) {
                const current = uniqueProducts.get(product.id);
                uniqueProducts.set(
                    product.id,
                    current ? this.mergeProduct(current, product) : product
                );
            } else if (product) {
                result.skipped.push(product);
            }
        });

        uniqueProducts.forEach(product => {
            const existingItem = this.findItem(product.id);

            if (existingItem) {
                existingItem.product = this.mergeProduct(existingItem.product, product);
                result.alreadyInCart.push(product);
                return;
            }

            const item: CartItem = {
                id: product.id,
                product,
                quantity: 1,
                options: []
            };

            this.data.items.push(item);
            result.added.push(product);
        });

        if (result.added.length > 0 || result.alreadyInCart.length > 0) {
            this.persistAndPublish();
        }

        return of(result);
    }

    private createAssociationCartProduct(
        association: ProductAssociation
    ): CartProduct | null {
        const product = association?.associated_product;

        if (!this.isUsableProduct(product)) {
            return null;
        }

        return {
            ...this.cloneSerializable(product),
            productAssociation: this.cloneSerializable(association)
        } as CartProduct;
    }

    private cloneProduct(product: Product): CartProduct {
        return this.cloneSerializable(product) as CartProduct;
    }

    private mergeProduct(current: Product, incoming: Product): CartProduct {
        const currentData: any = current || {};
        const incomingData: any = incoming || {};

        return {
            ...currentData,
            ...incomingData,
            dataSteward: this.firstDefined(
                incomingData.dataSteward,
                incomingData.dataStewardName,
                incomingData.data_steward,
                incomingData.steward,
                currentData.dataSteward,
                currentData.dataStewardName,
                currentData.data_steward,
                currentData.steward
            ),
            domain: this.firstDefined(
                incomingData.domain,
                incomingData.domainName,
                incomingData.dataDomain,
                incomingData.dataDomainName,
                incomingData.data_domain,
                currentData.domain,
                currentData.domainName,
                currentData.dataDomain,
                currentData.dataDomainName,
                currentData.data_domain
            ),
            classification: this.firstDefined(
                incomingData.classification,
                incomingData.classificationName,
                incomingData.dataClassification,
                incomingData.data_classification,
                currentData.classification,
                currentData.classificationName,
                currentData.dataClassification,
                currentData.data_classification
            ),
            productAssociation: incomingData.productAssociation ?? currentData.productAssociation
        } as CartProduct;
    }

    private cloneSerializable<T>(value: T): T {
        if (value === null || value === undefined) return value;
        try {
            return JSON.parse(JSON.stringify(value));
        } catch {
            return value;
        }
    }

    private firstDefined(...values: any[]): any {
        return values.find(value => {
            if (value === null || value === undefined) return false;
            if (typeof value === 'string') return value.trim().length > 0;
            return true;
        });
    }

    private isUsableProduct(
        product: Product | null | undefined
    ): product is Product {
        return Boolean(
            product &&
            product.id !== null &&
            product.id !== undefined
        );
    }

    public isInCart(productOrId: Product | Product['id']): boolean {
        const productId = typeof productOrId === 'object'
            ? productOrId.id
            : productOrId;
        return Boolean(this.findItem(productId));
    }

    private findItem(productId: Product['id']): CartItem | undefined {
        return this.findItemByNormalizedId(productId);
    }

    private findItemByNormalizedId(productId: Product['id']): CartItem | undefined {
        return this.data.items.find(
            item =>
                String(item.product.id) ===
                String(productId)
        );
    }

    private keepAiSuggestion(item: CartItem, product: Product): void {
        if (this.aiSuggestions.isSuggested(product)) {
            item.aiSuggested = true;
        }
    }

    private recordCartAdd(product: Product, quantity: number): void {
        const name = product?.name || 'Catalog product';
        this.activity.record('cart_add', name, String(product?.id || ''), {
            order_type: 'product',
            source: this.aiSuggestions.isSuggested(product) ? 'ai_suggested' : 'standard',
            ai_suggested: this.aiSuggestions.isSuggested(product),
            product_id: product?.id ?? '',
            name,
            domain: product?.domain || '',
            datatype: product?.datatype || '',
            classification: product?.classification || '',
            quantity,
        });
    }

    public addDataRequest(dataRequest: any): Observable<void> {
        this.data.darRequests.push(dataRequest);
        this.persistAndPublish();
        const form = dataRequest?.formData || dataRequest || {};
        const detail = dataRequest?.product?.name
            || form?.v_dar_platform
            || 'Data access request';
        this.activity.record('cart_add', detail, '', {
            order_type: 'dar',
            name: detail,
            platform: form?.v_dar_platform || '',
            domain: form?.v_dar_dataDomainSelect || '',
            environment: form?.v_dar_environment || '',
            access_type: form?.v_dat_data_access_type || '',
        });
        return of(void 0);
    }

    public setProductRequest(productRequest: any): Observable<void> {
        const productId = productRequest?.productId ?? productRequest?.product?.id;
        const cartItemId = productRequest?.cartItemId;

        const index = this.data.productRequests.findIndex(request =>
            (cartItemId !== undefined && request?.cartItemId === cartItemId) ||
            (productId !== undefined && (
                request?.productId === productId ||
                request?.product?.id === productId
            ))
        );

        if (index >= 0) {
            this.data.productRequests[index] = productRequest;
        } else {
            this.data.productRequests.push(productRequest);
        }

        this.persistAndPublish();
        return of(void 0);
    }

    public update(
        updates: { item: CartItem; quantity: number }[]
    ): Observable<void> {
        updates.forEach(update => {
            const item = this.data.items.find(current => current === update.item);
            if (!item) return;
            const quantity = Math.floor(Number(update.quantity));
            if (Number.isFinite(quantity) && quantity > 0) {
                item.quantity = quantity;
            }
        });

        this.persistAndPublish();
        return of(void 0);
    }

    public remove(item: CartItem): Observable<void> {
        this.data.items = this.data.items.filter(current => current !== item);
        const productId = item?.product?.id;
        this.data.productRequests = this.data.productRequests.filter(request =>
            request?.cartItemId !== item?.id &&
            request?.productId !== productId &&
            request?.product?.id !== productId
        );
        this.persistAndPublish();
        this.activity.record('cart_remove', item?.product?.name || 'Catalog product', String(item?.product?.id || ''));
        return of(void 0);
    }

    public removeDar(dataRequest: any): Observable<void> {
        this.data.darRequests = (this.data.darRequests || []).filter(
            current => current !== dataRequest
        );
        this.persistAndPublish();
        return of(void 0);
    }

    public clear(): void {
        this.data.items = [];
        this.data.darRequests = [];
        this.data.productRequests = [];
        if (isPlatformBrowser(this.platformId)) {
            try {
                localStorage.removeItem('savedCart');
            } catch {}
        }
        this.persistAndPublish();
    }

    private readSavedCart(): any | null {
        if (!isPlatformBrowser(this.platformId)) {
            return null;
        }
        try {
            const raw = localStorage.getItem('savedCart');
            if (!raw) {
                return null;
            }
            const saved = JSON.parse(raw);
            const expiresAt = new Date(saved?.expiresAt || 0).getTime();
            if (!expiresAt || expiresAt <= Date.now()) {
                localStorage.removeItem('savedCart');
                return null;
            }
            return saved;
        } catch {
            return null;
        }
    }

    private addBusinessDays(start: Date, days: number): Date {
        const result = new Date(start.getTime());
        let added = 0;
        while (added < days) {
            result.setDate(result.getDate() + 1);
            const day = result.getDay();
            if (day !== 0 && day !== 6) {
                added += 1;
            }
        }
        return result;
    }

    private persistAndPublish(): void {
        this.save();
        this.calc();
    }

    public addProductGroup(products: Product[]): Observable<BulkCartAddResult> {
        const result: BulkCartAddResult = {
            added: [],
            alreadyInCart: [],
            skipped: []
        };

        const uniqueProducts = new Map<string, Product>();

        products.forEach(product => {
            if (!this.isUsableProduct(product)) {
                if (product) {
                    result.skipped.push(product);
                }

                return;
            }

            const key = String(product.id);
            const current = uniqueProducts.get(key);

            uniqueProducts.set(
                key,
                current
                    ? this.mergeProduct(current, product)
                    : this.cloneProduct(product)
            );
        });

        uniqueProducts.forEach(product => {
            const existingItem = this.findItemByNormalizedId(product.id);

            if (existingItem) {
                existingItem.product =
                    this.mergeProduct(
                        existingItem.product,
                        product
                    );

                result.alreadyInCart.push(product);
                return;
            }

            const item: CartItem = {
                id: product.id,
                product: this.cloneProduct(product),
                quantity: 1,
                options: []
            };

            this.data.items.push(item);
            result.added.push(product);
        });

        if (
            result.added.length > 0 ||
            result.alreadyInCart.length > 0
        ) {
            this.persistAndPublish();
        }

        return of(result);
    }
}
