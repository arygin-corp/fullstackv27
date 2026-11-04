import { Component, OnInit } from '@angular/core';
import { Product } from '../../../../@shared/interfaces/product';
import { ShopService } from '../../../../@shared/api/shop.service';
import { Domain } from '../../../../@shared/interfaces/domain';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-product-sidebar',
    templateUrl: './product-sidebar.component.html',
    styleUrls: ['./product-sidebar.component.scss']
})
export class ProductSidebarComponent implements OnInit {
    domains$!: Observable<Domain[]>;
    bestsellers$!: Observable<Product[]>;

    constructor(
        private shop: ShopService,
    ) { }

    ngOnInit(): void {
       this.domains$ = this.shop.getDomains(null, 1);
       this.bestsellers$ = this.shop.getBestsellers().pipe(map(x => x.slice(0, 5)));
    }
}
