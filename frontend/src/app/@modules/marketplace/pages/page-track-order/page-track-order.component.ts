import { Component } from '@angular/core';
import { AppService } from '../../../../../app/@shared/services/app.service'; 
import { MsalService } from "@azure/msal-angular";

const GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0/me?$select=id,displayName,givenName,surname,jobTitle,userPrincipalName,mail,businessPhones,officeLocation,employeeId,department,companyName,streetAddress,city,state,postalCode,country,extension_f9db8ce126544afb895293c1adb4b749_extensionAttribute3';

@Component({
    selector: 'app-track-order',
    templateUrl: './page-track-order.component.html',
    styleUrls: ['./page-track-order.component.scss']
})
export class PageTrackOrderComponent {
    loggedInUser = false;

    constructor(
        private msalService: MsalService,
        public appSvc: AppService
    ) { 

    }

    ngOnInit() {

    }

    checkAccount() {
        const accounts = this.msalService.instance.getAllAccounts();
        this.loggedInUser = accounts.length > 0;
    }

}
