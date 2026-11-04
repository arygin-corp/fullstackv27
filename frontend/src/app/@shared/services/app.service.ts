import { HttpClient } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { InteractionRequiredAuthError, AuthError } from "@azure/msal-browser";
import { MsalService } from "@azure/msal-angular";
import { Observable } from 'rxjs';
import { NotificationService } from "./notification.service";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class AppService implements OnDestroy {
  private apiUrl = environment.apiUrl;
  
  getProfile() {
    throw new Error('Method not implemented.');
  }
  private _userData:any;
  private subscriptions: Subscription = new Subscription();
  private microsoftGraphUrl = 'https://graph.microsoft.com/v1.0/me?$select=id,displayName,givenName,surname,jobTitle,userPrincipalName,mail,businessPhones,officeLocation,employeeId,department,companyName,streetAddress,city,state,postalCode,country,extension_f9db8ce126544afb895293c1adb4b749_extensionAttribute3';

  get userData(): any {
    return this._userData;
  }
  set userData(value: any) {
    this._userData = value;
  }

  constructor(
    private httpSvc: HttpClient, 
    private authService: MsalService,
    public notification: NotificationService
  ) { }

  getUserData() {
    this.subscriptions.add(
      this.httpSvc.get(this.microsoftGraphUrl).subscribe({
        next: (profile) => {
          this._userData = profile;
        },
        error: (err: AuthError) => {
          if (InteractionRequiredAuthError.isInteractionRequiredError(err.errorCode)) {
            this.authService.acquireTokenRedirect({
              scopes: ["user.read", "openid", "profile"],
            });
          }
        },
      })
    );
  }

  // FIX: Add these methods to satisfy the compiler and show alerts
  notifySuccess(message: string) {
    this.notification.showSuccess(message, 'Success');
  }

  notifyError(message: string) {
    this.notification.showError(message, 'Error');
  }

  notifyInfo(message: string) {
    this.notification.showInfo(message, 'Info');
  }

  notifySecondary(message: string) {
    this.notification.showWarning(message, 'Warning');
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getStatus(): Observable<any> {
    return this.httpSvc.get(`${this.apiUrl}/status/`);
  }

  getResources(): Observable<any[]> {
    return this.httpSvc.get<any[]>(`${this.apiUrl}/resources/`);
  }
}
