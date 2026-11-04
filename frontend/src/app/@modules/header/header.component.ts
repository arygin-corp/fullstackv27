import { Component, Input } from '@angular/core';
import { OffcanvasCartService } from '../../@shared/services/offcanvas-cart.service';
import { OffcanvasProductService } from '../../@shared/services/offcanvas-product.service';
import { OffcanvasRequestService } from '../../@shared/services/offcanvas-request.service';
import { StoreService } from '../../@shared/services/store.service';
import { RootService } from '../../@shared/services/root.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
    @Input() layout: 'classic'|'compact' = 'classic';

    constructor(
        public store: StoreService,
        public offcanvasNewProduct: OffcanvasProductService,
        public offcanvasNewRequest: OffcanvasRequestService,
        public offcanvasCart: OffcanvasCartService,
        public root: RootService,
    ) { 

    }
}
