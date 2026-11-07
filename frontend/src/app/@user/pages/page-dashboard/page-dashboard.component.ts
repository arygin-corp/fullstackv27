import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../../../@shared/services/app.service';
import { MsalService } from "@azure/msal-angular";
import { SafeUrl } from '@angular/platform-browser';
import { PicService } from '../../../@shared/services/pic.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrderHistoryService } from '../../../@shared/services/order-history.service';
import { UserActivityService } from '../../../@shared/services/user-activity.service';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-page-dashboard',
    templateUrl: './page-dashboard.component.html',
    styleUrls: ['./page-dashboard.component.scss']
})
export class PageDashboardComponent {
    orders: any[] = [];
    ordersLoading = true;
    showAllOrders = false;
    expandedId: string | null = null;
    loggedInUser = false;
    sanitizer: any; 
        
    @Output() closeMenu: EventEmitter<void> = new EventEmitter<void>();
    photo: SafeUrl;

    constructor (
        private msalService: MsalService,
        public appSvc: AppService,
        private picService: PicService,
        private http: HttpClient,
        private ordersApi: UserActivityService,
        private orderHistoryService: OrderHistoryService,
        private router: Router,
    ) {

    }

    ngOnInit() {
        if (!this.appSvc.userData) {
            this.appSvc.getUserData();
        }
        this.picService.getUserPhoto().subscribe(photo => this.photo = photo);
        this.ordersApi.recentOrders(4).subscribe((items) => {
            const list = items || [];
            this.showAllOrders = list.length >= 4;
            this.orders = list.slice(0, 3);
            this.ordersLoading = false;
        });
    }

    openTeams(item: any): void {
        const user = item.requestedFor || item.open_by || '';
        window.open(`https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(user)}`, '_blank');
    }

    openOutlook(item: any): void {
        const to = item.requestedForEmail || item.requestedFor || '';
        const subject = encodeURIComponent(`Order ${item.id}`);
        const body = encodeURIComponent(`Details for order ${item.id}`);
        window.open(`mailto:${to}?subject=${subject}&body=${body}`, '_blank');
    }

    uploadAttachment(item: any): void {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = (ev: any) => {
            const file = ev.target.files && ev.target.files[0];
            if (!file) {
                return;
            }
            const form = new FormData();
            form.append('file', file);
            form.append('orderId', item.id);
            this.http.post(`${environment.gdx.requestProduct}/attachments`, form).subscribe(
                () => this.orderHistoryService.PutApiRequestEvent(item.id).subscribe(),
                () => this.orderHistoryService.PutApiRequestEvent(item.id).subscribe()
            );
        };
        input.click();
    }

    writeReview(item: any): void {
        this.router.navigate(['/account/write-review'], { queryParams: { orderId: item.id } });
    }

    toggleDetails(item: any): void {
        this.expandedId = this.expandedId === item.id ? null : item.id;
    }

    isExpanded(item: any): boolean {
        return this.expandedId === item.id;
    }

    getStatusClass(status: any): string {
        const value = (status || '').toString().trim().toLowerCase();
        if (value === 'cancelled') return 'status-pill-cancelled';
        if (value === 'completed') return 'status-pill-completed';
        if (value === 'pending') return 'status-pill-pending';
        if (value === 'in progress' || value === 'progress') return 'status-pill-progress';
        if (value === 'on hold' || value === 'hold') return 'status-pill-hold';
        return 'status-pill-default';
    }

    getApprovalClass(approval: any): string {
        const value = (approval || '').toString().trim().toLowerCase();
        if (value === 'requested' || value === 'pending approval') return 'approval-pill-requested';
        if (value === 'pending') return 'approval-pill-pending';
        if (value === 'approved') return 'approval-pill-approved';
        if (value === 'rejected') return 'approval-pill-rejected';
        return 'approval-pill-default';
    }

    get phone(): string {
        const phones = this.appSvc?.userData?.businessPhones;
        return Array.isArray(phones) ? (phones[0] || '') : (phones || '');
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
