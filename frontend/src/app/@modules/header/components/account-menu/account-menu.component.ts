import { Injectable, Component, EventEmitter, Output } from '@angular/core';
import { ProfileStatus, ProfileStatusService } from '../../services/profile-status.service';
import { HttpClient } from '@angular/common/http';
import { MsalService } from '@azure/msal-angular';
import { PicService } from '../../../../@shared/services/pic.service';
import { Observable } from 'rxjs';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { map } from 'rxjs/operators';
import { AuthError, InteractionRequiredAuthError } from '@azure/msal-browser';

const GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0/me?$select=id,displayName,givenName,surname,jobTitle,userPrincipalName,mail,businessPhones,officeLocation,employeeId,department,companyName,streetAddress,city,state,postalCode,country,extension_f9db8ce126544afb895293c1adb4b749_extensionAttribute3';

@Component({
    selector: 'app-account-menu',
    templateUrl: './account-menu.component.html',
    styleUrls: ['./account-menu.component.scss'],
    providers: [PicService],
})

export class AccountMenuComponent {
    profile:any;
    // photo:any;
    sanitizer: any; 
    
    @Output() closeMenu: EventEmitter<void> = new EventEmitter<void>();
    photo: SafeUrl;
    statusOpen = false;

    constructor(
        private msalService: MsalService,
        private http: HttpClient,
        private picService: PicService,
        public profileStatus: ProfileStatusService
    ) { }

    ngOnInit() {
        this.getProfile();
        this.picService.getUserPhoto().subscribe(photo => this.photo = photo);
    }

    getProfile() {
        this.http.get(GRAPH_ENDPOINT).subscribe({
            next: (profile) => {
            this.profile = profile;
            },
            error: (err: AuthError) => {
            if (InteractionRequiredAuthError.isInteractionRequiredError(err.errorCode)) {
                this.msalService.acquireTokenPopup({
                scopes: ["user.read"]
                }).subscribe({
                next: (result) => {
                    this.http.get(GRAPH_ENDPOINT).subscribe(profile => {
                    this.profile = profile;
                    });
                }
                });
            }
            }
        });
    }

    getUserPhoto(): Observable<SafeUrl> {
        let requestUrl = `https://graph.microsoft.com/v1.0/me/photos/48x48/$value`;
        return this.http.get(requestUrl, { responseType: "blob" }).pipe(map(result => {
          let url = window.URL;
          return this.sanitizer.bypassSecurityTrustUrl(url.createObjectURL(result));
        }));
    }

    logout() {
        this.msalService.logout();
        sessionStorage.clear();
    }

    toggleStatus(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        this.statusOpen = !this.statusOpen;
    }

    setStatus(status: ProfileStatus, event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        this.profileStatus.set(status);
        this.statusOpen = false;
    }

    get jobTitleLabel(): string {
        const title = String(this.profile?.jobTitle || '');
        const cut = title.indexOf(' -');
        return (cut === -1 ? title : title.slice(0, cut)).trim();
    }

    get lastSignInLabel(): string {
        const account = this.msalService.instance.getActiveAccount() || this.msalService.instance.getAllAccounts()[0];
        const claims = account?.idTokenClaims as { auth_time?: number; iat?: number } | undefined;
        const seconds = claims?.auth_time || claims?.iat;
        if (!seconds) {
            return '';
        }
        return this.formatSignIn(new Date(seconds * 1000));
    }

    private formatSignIn(date: Date): string {
        const months = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const suffix = hours >= 12 ? 'p.m.' : 'a.m.';
        hours = hours % 12 || 12;
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}, ${hours}:${minutes} ${suffix}`;
    }
}
