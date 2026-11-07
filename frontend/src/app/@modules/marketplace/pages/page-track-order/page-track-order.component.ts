import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { AppService } from '../../../../../app/@shared/services/app.service';
import { UserActivityService } from '../../../../@shared/services/user-activity.service';

export interface TrackTask {
    task_number: string;
    state: string;
    assignment_group: string;
    assignment_group_manager: string;
    assigned_to: string;
    created: string;
    due: string;
}

export interface TrackRequestRecord {
    request_number: string;
    ritm_id: string;
    ritm_number: string;
    product_id: string;
    approval_stage: string;
    ritm_state: string;
    stage: string;
    opened_at: string;
    closed_at: string;
    tasks: TrackTask[];
}

export interface TrackOrderResult {
    marketplace_order_id: string;
    sync_status: string;
    created_at: string;
    updated_at: string;
    requests: TrackRequestRecord[];
}

@Component({
    selector: 'app-track-order',
    templateUrl: './page-track-order.component.html',
    styleUrls: ['./page-track-order.component.scss']
})
export class PageTrackOrderComponent {
    requestNumber = '';
    ritmNumber = '';
    searching = false;
    searched = false;
    error = '';
    result: TrackOrderResult = null;

    constructor(
        private http: HttpClient,
        private msalService: MsalService,
        public appSvc: AppService,
        private activity: UserActivityService
    ) { }

    isSyncStatus(value: string): boolean {
        return ['PENDING', 'PROCESSING', 'SYNCHRONIZED', 'PARTIAL', 'FAILED'].indexOf(value) !== -1;
    }

    get canTrack(): boolean {
        const hasRequest = !!this.requestNumber.trim();
        const hasRitm = !!this.ritmNumber.trim();
        return hasRequest !== hasRitm && !this.searching;
    }

    async track(event: Event): Promise<void> {
        event.preventDefault();
        this.error = '';
        this.result = null;
        this.searched = false;

        const requestNumber = this.requestNumber.trim();
        const ritmNumber = this.ritmNumber.trim();
        if (!requestNumber && !ritmNumber) {
            this.error = 'Enter a request number or an RITM number.';
            return;
        }
        if (requestNumber && ritmNumber) {
            this.error = 'Enter either a request number or an RITM number, not both.';
            return;
        }

        const headers = await this.authHeaders();
        if (!headers) {
            this.error = 'Sign in with your Toyota account to track a request.';
            return;
        }

        let params = new HttpParams();
        params = requestNumber
            ? params.set('request_number', requestNumber)
            : params.set('ritm_number', ritmNumber);

        this.searching = true;
        this.http.get<TrackOrderResult>('/api/orders/track-order/', { headers, params }).subscribe({
            next: (order) => {
                this.result = order;
                this.searched = true;
                this.searching = false;
                const reference = requestNumber || ritmNumber;
                this.activity.record('track_request', reference, reference);
            },
            error: (err: HttpErrorResponse) => {
                this.searching = false;
                this.searched = true;
                if (err.status === 404) {
                    this.error = 'No request matched that number for your account.';
                    return;
                }
                const detail = err.error && err.error.detail;
                this.error = typeof detail === 'string' ? detail : 'The request could not be tracked.';
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
}
