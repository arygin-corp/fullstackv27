import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { HttpClient, HttpUrlEncodingCodec } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common'; 
import { Description, Documentation, Resource, Sample, Product } from '../../../../@shared/interfaces/product';
import { Review } from '../../../../@shared/interfaces/review';
import { reviews } from '../../../../../data/product-reviews';
import { documentation } from '../../../../../data/product-documentation';
import { IntendedUse } from '../../../../@shared/interfaces/intended-use';
import { intended } from '../../../../../data/intended-use';
import { WhatsIncluded } from '../../../../@shared/interfaces/whats-included'; 
import { included } from '../../../../../data/whats-included';
import { sample } from '../../../../../data/product-sample-data';
import { resource } from '../../../../../data/product-resource';
import { description } from '../../../../../data/product-description';
import { SampleData } from '../../../../@shared/interfaces/sample-data';
import { environment } from '../../../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-product-tabs',
    templateUrl: './product-tabs.component.html',
    styleUrls: ['./product-tabs.component.scss']
})

export class ProductTabsComponent {
    @Input() withSidebar = false;
    @Input() product!: Product;
    @Input() sampleData: any[] = []; 
    @Input() tab: 'description'|'resource'|'sample'|'reviews'|'tables'|'intended'|'included'|'documentation' = 'description';
    description: Description[] = description;
    resource: Resource[] = resource;
    sample: Sample[] = sample;
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

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['product'] && this.product?.sample_data?.length > 0) {
            this.formatSampleData();
        }
    }

    private formatSampleData(): void {
        const raw = this.product.sample_data[0];
        const formatted = [];

        // Loop through the 10 possible field pairs in your JSON
        for (let i = 1; i <= 10; i++) {
            const name = raw[`field_name_${i}`];
            const value = raw[`field_value_${i}`];
            const axonid = raw[`glossary_id_${i}`];

            if (name || value) {
                formatted.push({
                    name: name || '',
                    value: value || '',
                    sort: i.toString(),
                    axonid: axonid,
                    showPop: false,
                    popupText: '',
                    popupName: ''
                });
            }
        }
        this.sampleData = formatted;
    }

    ShowPopover(index: string): void {
        this.sampleData = this.sampleData.map(item => {
            if (index === item.sort) {
                item.showPop = true;
                if (item.axonid != null) {
                    this.httpClient.get(`${environment.gdx.axonFacets}?id=${item.axonid}`, { responseType: 'text' }).subscribe(
                        (data: any) => item.popupText = data.replace(/<[^>]*>/g, ''),
                        () => item.popupText = this.errorMessage
                    );
                    this.httpClient.get(`${environment.gdx.axonGlossary}?id=${item.axonid}`, { responseType: 'text' }).subscribe(
                        (data: any) => item.popupName = data.replace(/<[^>]*>/g, ''),
                        () => item.popupName = this.errorMessage
                    );
                } else {
                    item.popupText = this.errorMessage;
                    item.popupName = this.errorMessage;
                }
            } else {
                item.showPop = false;
            }
            return item;
        });
    }

    HidePopover(index: string): void {
        this.sampleData.forEach(item => item.showPop = false);
    }

    showTablesAndColumns(currentState: boolean) {
        if (!currentState) {
            const adgroup = (this.product as any).adGroup || (this.product as any).adgroup;
            if (adgroup != null) {
                this.httpClient.get<any>(this.tableUrl).subscribe(
                    data => this.denodos = data.elements,
                    () => this.denodos = []
                );
            }
        }
    }

}
