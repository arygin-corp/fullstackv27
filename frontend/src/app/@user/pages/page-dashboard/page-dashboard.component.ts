import { Component, EventEmitter, Output } from '@angular/core';
import { Order } from '../../../@shared/interfaces/order';
import { orders } from '../../../../data/account-orders';
import { Address } from '../../../@shared/interfaces/address';
import { addresses } from '../../../../data/account-addresses';
import { AppService } from '../../../@shared/services/app.service'; 
import { MsalService } from "@azure/msal-angular";
import { SafeUrl } from '@angular/platform-browser';
import { PicService } from '../../../@shared/services/pic.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-page-dashboard',
    templateUrl: './page-dashboard.component.html',
    styleUrls: ['./page-dashboard.component.scss']
})
export class PageDashboardComponent {
    address: Address = addresses[0];
    orders: Partial<Order>[] = orders.slice(0, 3);
    loggedInUser = false;
    sanitizer: any; 
        
    @Output() closeMenu: EventEmitter<void> = new EventEmitter<void>();
    photo: SafeUrl;

    constructor (
        private msalService: MsalService,
        public appSvc: AppService,
        private picService: PicService,
        private http: HttpClient,
    ) {

    }

    ngOnInit() {
        this.picService.getUserPhoto().subscribe(photo => this.photo = photo);
    }

    getUserPhoto(): Observable<SafeUrl> {
        let requestUrl = `https://graph.microsoft.com/v1.0/me/photos/48x48/$value`;
        return this.http.get(requestUrl, { responseType: "blob" }).pipe(map(result => {
            let url = window.URL;
            return this.sanitizer.bypassSecurityTrustUrl(url.createObjectURL(result));
        }));
    }
    
    checkAccount() {
        const accounts = this.msalService.instance.getAllAccounts();
        this.loggedInUser = accounts.length > 0;
    }
}
