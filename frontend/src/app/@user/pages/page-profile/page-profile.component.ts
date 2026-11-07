import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppService } from '../../../@shared/services/app.service';
import { MsalService } from "@azure/msal-angular";
import { PicService } from '../../../@shared/services/pic.service';
import { SafeUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

interface ProfileActivity {
    id: string;
    title: string;
    detail: string;
    reference: string;
    status: string;
    tone: string;
    occurred_at: string;
}

@Component({
    selector: 'app-page-profile',
    templateUrl: './page-profile.component.html',
    styleUrls: ['./page-profile.component.scss']
})

export class PageProfileComponent implements OnInit {
    loggedInUser = false;
    sanitizer: any; 
        
    @Output() closeMenu: EventEmitter<void> = new EventEmitter<void>();
    photo: SafeUrl;
    activity: ProfileActivity[] = [];
    activityLoading = true;
    activityError = '';

    constructor (
        private msalService: MsalService,
        public appSvc: AppService,
        private picService: PicService,
        private http: HttpClient,
    ) {

    }

    ngOnInit() {
        this.picService.getUserPhoto().subscribe(photo => this.photo = photo);
        this.loadActivity();
    }

    get visibleActivity(): ProfileActivity[] {
        return this.activity.slice(0, 5);
    }

    get extraActivity(): ProfileActivity[] {
        return this.activity.slice(5);
    }

    statusClass(tone: string): string {
        if (tone === 'success') {
            return 'badge bg-soft-success text-success rounded-pill';
        }
        if (tone === 'danger') {
            return 'badge bg-soft-danger text-danger rounded-pill';
        }
        if (tone === 'primary') {
            return 'badge bg-soft-primary text-primary rounded-pill';
        }
        return 'badge bg-soft-secondary text-secondary rounded-pill';
    }

    indicatorClass(tone: string): string {
        if (tone === 'success') {
            return 'legend-indicator bg-success';
        }
        if (tone === 'danger') {
            return 'legend-indicator bg-danger';
        }
        if (tone === 'primary') {
            return 'legend-indicator bg-primary';
        }
        return 'legend-indicator bg-secondary';
    }

    private async loadActivity(): Promise<void> {
        const headers = await this.authHeaders();
        if (!headers) {
            this.activityLoading = false;
            this.activityError = 'Sign in is required to view activity.';
            return;
        }
        this.http.get<ProfileActivity[]>(`${environment.apiUrl}/api/orders/activity/`, { headers }).subscribe({
            next: (items) => {
                this.activity = items || [];
                this.activityLoading = false;
            },
            error: () => {
                this.activityLoading = false;
                this.activityError = 'Activity could not be loaded.';
            }
        });
    }

    private async authHeaders(): Promise<HttpHeaders | null> {
        const account = this.msalService.instance.getActiveAccount()
            || this.msalService.instance.getAllAccounts()[0];
        if (!account) {
            return null;
        }
        try {
            const result = await this.msalService.instance.acquireTokenSilent({
                scopes: ['openid', 'profile'],
                account
            });
            if (!result.idToken) {
                return null;
            }
            return new HttpHeaders({ Authorization: `Bearer ${result.idToken}` });
        } catch {
            return null;
        }
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
