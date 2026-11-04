import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AppService } from '../../../@shared/services/app.service'; 
import { MsalService } from "@azure/msal-angular";
import { PicService } from '../../../@shared/services/pic.service';
import { SafeUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

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
