import { AfterViewInit, Component, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { QuickviewService } from '../../services/quickview.service';
import { ProductService } from '../../services/product.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Product } from '../../interfaces/product';
import { of, Subject } from 'rxjs';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-quickview',
    templateUrl: './quickview.component.html',
    styleUrls: ['./quickview.component.scss']
})
export class QuickviewComponent implements AfterViewInit, OnDestroy {
    private destroy$: Subject<void> = new Subject();

    @ViewChild('modal', { read: TemplateRef }) template!: TemplateRef<any>;

    modalRef?: BsModalRef;
    product?: Product;
    loading = false;

    constructor(
        private quickview: QuickviewService,
        private modalService: BsModalService,
        private products: ProductService
    ) { }

    ngAfterViewInit(): void {
        this.quickview.show$.pipe(
            switchMap(product => {
                this.open();
                const id = product?.id;
                if (id == null) {
                    return of(product);
                }
                return this.products.getProduct(id).pipe(catchError(() => of(product)));
            }),
            takeUntil(this.destroy$)
        ).subscribe(product => {
            this.product = product;
            this.loading = false;
        });
    }

    private open(): void {
        if (this.modalRef) {
            this.modalRef.hide();
        }
        this.product = undefined;
        this.loading = true;
        this.modalRef = this.modalService.show(this.template, {class: 'modal-dialog-centered modal-xl'});
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
