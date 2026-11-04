import { Component } from '@angular/core';
// import { order } from '../../../../../data/account-order-details';
// import { Order } from '../../../../@shared/interfaces/order';
import { AppService } from '../../../../@shared/services/app.service'; 
import { MsalService } from "@azure/msal-angular";
import { RootService } from '../../../../../app/@shared/services/root.service';
import { toyota } from '../../../../../data/toyota';
import { CartService } from '../../../../@shared/services/cart.service';
import { ActivatedRoute } from '@angular/router'; // Added
import { order as mockOrder } from '../../../../../data/account-order-details';

@Component({
    selector: 'app-page-order-success',
    templateUrl: './page-order-success.component.html',
    styleUrls: ['./page-order-success.component.scss']
})

export class PageOrderSuccessComponent {
    order = mockOrder;
    loggedInUser = false;
    photo:any;
    sanitizer: any; 
    toyota = toyota;
    receipt: any;
    orderId: string = '';
    activeTab: 'products' | 'dars' = 'products'; // Default tab

    constructor(
        private route: ActivatedRoute,
        public root: RootService,
        private msalService: MsalService,
        public appSvc: AppService,
        private cart: CartService
    ) {

    }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.orderId = params['id'] || 'REQ-SUCCESS';
        });

        this.receipt = this.cart.getReceipt();

        // If receipt was set by checkout, copy over display fields so template shows them
        if (this.receipt) {
            if (this.receipt.date) {
                this.order.date = this.receipt.date;
            }
            if (this.receipt.total != null) {
                this.order.total = this.receipt.total;
            }
            if (this.receipt.id) {
                this.orderId = this.receipt.id;
            }
        }

        // Auto-select tab using receipt arrays (items / darRequests)
        if (this.receipt?.items?.length > 0) {
            this.activeTab = 'products';
        } else if (this.receipt?.darRequests?.length > 0) {
            this.activeTab = 'dars';
        }
    }

    getProductImage(product: any): string {
        const fallback = 'assets/images/product_images/data-access-request.jpg';
        if (!product) return fallback;

        let img = '';

        if (Array.isArray(product.images) && product.images.length) {
            img = String(product.images[0]).trim();
        } else if (product.image) {
            img = String(product.image).trim();
        } else {
            return fallback;
        }

        if (!img) return fallback;

        if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('//')) {
            return img;
        }

        if (img.startsWith('/') || img.startsWith('assets/')) {
            return img;
        }

        return `assets/images/product_images/${img}`;
    }

    formatPlatform(platform: string | null | undefined): string {
        if (!platform) return '';
        const normalized = (platform || '').toString().toUpperCase();
        const tbdpKeys = ['IRM', 'PASA', 'C360', 'Q360', 'IRM-PRICING'];
        return tbdpKeys.some(k => normalized.includes(k)) ? 'TBDP' : platform;
    }

    formatOrNA(value: any): string {
        if (value == null) return 'N/A';
        const s = String(value).trim();
        return s === '' ? 'N/A' : s;
    }

    checkAccount() {
        const accounts = this.msalService.instance.getAllAccounts();
        this.loggedInUser = accounts.length > 0;
    }
}
