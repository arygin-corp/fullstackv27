import { Component, Inject, NgZone, OnInit, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, ViewportScroller } from '@angular/common';
import { VersionCheckService } from './@shared/services/version-check.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter, first } from 'rxjs/operators';
import { environment } from "../environments/environment";
// msal
import { MsalService } from "@azure/msal-angular";
import { InteractionRequiredAuthError, AuthError } from "@azure/msal-browser";
import { InteractionStatus } from "@azure/msal-browser";
//services
import { TranslateService } from '@ngx-translate/core';
import { AppService } from "./@shared/services/app.service";
import { DeviceDetectorService } from 'ngx-device-detector';
import { CurrencyService } from './@shared/services/currency.service';
import { ToastrService } from 'ngx-toastr';
import { CartService } from './@shared/services/cart.service';
import { CompareService } from './@shared/services/compare.service';
import { FavoritesService } from './@shared/services/favorites.service';
import { HttpClient } from '@angular/common/http';

const GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0/me?$select=id,displayName,givenName,surname,jobTitle,userPrincipalName,mail,businessPhones,officeLocation,employeeId,department,companyName,streetAddress,city,state,postalCode,country,extension_f9db8ce126544afb895293c1adb4b749_extensionAttribute3';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  url: any[] = []
  title = "Home";
  deviceInfo = null;
  profile:any;
  sanitizer: any;
  loggedInUser: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService,
    private cart: CartService,
    private compare: CompareService,
    private favorites: FavoritesService,
    private zone: NgZone,
    private scroller: ViewportScroller,
    private currency: CurrencyService,
    private msalService: MsalService,
    public appSvc: AppService,
    private changeDetect: ChangeDetectorRef,
    translateService: TranslateService,
    public versionCheckService: VersionCheckService,
    private deviceService: DeviceDetectorService
  ) {
    this.epicFunction();
    this.versionCheckService.startVersionChecking('./version.json');
    translateService.addLangs(['en', 'ja', 'es', 'fr']);
    translateService.setDefaultLang('en');
    translateService.use('en');

    // Replace getAccount() with instance.getActiveAccount()
    const accounts = this.msalService.instance.getAllAccounts();
    this.loggedInUser = accounts.length > 0 ? accounts[0] : null;

    if (this.loggedInUser && !this.isCallbackOrIframe()) {
      this.appSvc.getUserData();
    }

    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        this.router.events.pipe(filter(event => event instanceof NavigationEnd), first()).subscribe(() => {
          const preloader = document.querySelector('.site-preloader');

          if (preloader === null) {
            return;
          }

          preloader.addEventListener('transitionend', (event: Event) => {
            if (event instanceof TransitionEvent && event.propertyName === 'opacity') {
              preloader.remove();
            }
          });

          preloader.classList.add('site-preloader__fade');

          if (getComputedStyle(preloader).opacity === '0' && preloader.parentNode) {
            preloader.parentNode.removeChild(preloader);
          }
        });
      });
    }
  }
    
  epicFunction() {
    this.deviceInfo = this.deviceService.getDeviceInfo();
    const isMobile = this.deviceService.isMobile();
    const isTablet = this.deviceService.isTablet();
    const isDesktopDevice = this.deviceService.isDesktop()
  }

  async ngOnInit() {
    this.currency.options = {
      code: 'USD',
      //display: 'symbol',
      //digitsInfo: '1.2-2',
      //locale: 'en-US'
    };

    try {
      await this.msalService.instance.handleRedirectPromise();
    } catch (err) {
      console.error('MSAL Redirect Error:', err);
    }

    this.router.events.subscribe((event) => {
      if ((event instanceof NavigationEnd)) {
        this.scroller.scrollToPosition([0, 0]);
      }
    });
    // this.cart.onAdding$.subscribe(product => {
    //   this.toastr.success(`Product "${product.name}" added to cart!`);
    // });

    // this.cart.onAdding$.subscribe(product => {
    //   const isAlreadyInCart = this.cart.items.some(item => item.id === product.id);

    //   if (isAlreadyInCart) {
    //     this.toastr.error(`Product "${product.name}" is already in the cart.`);
    //   } else {
    //     this.toastr.success(`Product "${product.name}" added to cart!`);
    //   }
    // });
    this.compare.onAdding$.subscribe(product => {
      this.toastr.success(`Product "${product.name}" added to compare!`);
    });
    this.favorites.onAdding$.subscribe(product => {
      this.toastr.success(`Product "${product.name}" added to wish list!`);
    });

    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
    });
    this.changeDetect.detectChanges();
    this.processAccountLogin();
    this.getProfile();
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

  processAccountLogin() {
    this.checkLoggedInAccount();

    this.msalService.instance.addEventCallback((message) => {
      if (message.eventType === 'msal:loginSuccess') {
        this.appSvc.getUserData();
      }
      if (message.eventType === 'msal:loginFailure') {
        this.checkLoggedInAccount();
      }
    });
  }

  checkLoggedInAccount() {
    const accounts = this.msalService.instance.getAllAccounts();
    this.loggedInUser = accounts.length > 0 ? accounts[0] : null;
    if (!this.loggedInUser) {
      this.performLoginRequest();
    }
  }

  performLoginRequest() {
    const loginRequestOpts = { 
      scopes: ["user.read", "openid", "profile"], 
      prompt: "select_account" 
    };
    this.msalService.loginRedirect(loginRequestOpts);
  }

  public isCallbackOrIframe(): boolean {
    const iframe = window !== window.parent && !window.opener;
    const callback = window.location.hash.includes('#code=') || window.location.hash.includes('#id_token=');
    if (environment.isIE) {
      return iframe || callback;
    } else {
      return iframe;
    }
  }
}
