import { Injectable, Component, EventEmitter, Output } from '@angular/core';
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

    constructor(
        private msalService: MsalService,
        private http: HttpClient,
        private picService: PicService
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
}
