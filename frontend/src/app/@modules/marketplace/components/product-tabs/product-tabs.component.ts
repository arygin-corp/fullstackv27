import { Component, Input } from '@angular/core';
import { HttpClient, HttpUrlEncodingCodec } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common'; 
import { Description, Documentation, Resource, Product } from '../../../../@shared/interfaces/product';
import { Review } from '../../../../@shared/interfaces/review';
import { reviews } from '../../../../../data/product-reviews';
import { documentation } from '../../../../../data/product-documentation';
import { IntendedUse } from '../../../../@shared/interfaces/intended-use';
import { intended } from '../../../../../data/intended-use';
import { WhatsIncluded } from '../../../../@shared/interfaces/whats-included'; 
import { included } from '../../../../../data/whats-included';
import { resource } from '../../../../../data/product-resource';
import { environment } from '../../../../../environments/environment';
import { description } from '../../../../../data/product-description';

@Component({
    selector: 'app-product-tabs',
    templateUrl: './product-tabs.component.html',
    styleUrls: ['./product-tabs.component.scss']
})

export class ProductTabsComponent {
    @Input() withSidebar = false;
    @Input() product!: Product;
    @Input() tab: 'description'|'resource'|'reviews'|'tables'|'intended'|'included'|'documentation' = 'description';
    description: Description[] = description;
    resource: Resource[] = resource;
    reviews: Review[] = reviews;
    intended: IntendedUse[] = intended;
    included: WhatsIncluded[] = included;
    documentation: Documentation[] = documentation;  
    codec = new HttpUrlEncodingCodec();
    denodos: any = [];
    clicked = false;
    errorMessage = `No definition available.`;
    tableUrl: string = "";

    public dataSetFilters = {
        showHideProps: {
            text: {
                showButton: true,
                showState: false,
                show: 'Show Tables and Columns',
                hide: 'Hide Tables and Columns'
            }
        }
    }

    constructor(
        private route: ActivatedRoute,
        private location: Location,
        public router: Router,
        private httpClient: HttpClient,
    ) { }

    showTablesAndColumns(currentState: boolean) {
        if (currentState) {
            return;
        }
        const role = this.product?.ad_group || (this.product as any).adGroup || (this.product as any).adgroup;
        if (!role) {
            this.denodos = [];
            return;
        }
        const url = `${environment.gdx.denodoTables}?userrolename=${encodeURIComponent(role)}`;
        this.httpClient.get<any>(url).subscribe(
            data => this.denodos = data?.elements || data?.value || data || [],
            () => this.denodos = []
        );
    }

}
