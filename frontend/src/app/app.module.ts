import { NgModule } from '@angular/core';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { MockServiceNowInterceptor } from './@shared/interceptor/mock-servicenow.interceptor';
import { environment } from "../environments/environment";

import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { LocalizationService } from './@shared/internationalization/localization.service';
import { HttpClientInMemoryWebApiModule } from "angular-in-memory-web-api";

// msal (identity)
import { MsalModule, MsalInterceptor, MsalGuard } from "@azure/msal-angular";
import { PublicClientApplication, InteractionType, BrowserCacheLocation } from "@azure/msal-browser";

// modules (angular)
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule, BrowserTransferStateModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RxReactiveFormsModule } from "@rxweb/reactive-form-validators"

// modules (third-party)
import { CarouselModule } from 'ngx-owl-carousel-o';
import { ToastrModule } from 'ngx-toastr';

// modules
import { AppRoutingModule } from './app-routing.module';
import { BlocksModule } from './@modules/blocks/blocks.module';
import { PagesModule } from './@pages/pages.module';
import { UserModule } from './@user/user.module';
import { FooterModule } from './@modules/footer/footer.module';
import { HeaderModule } from './@modules/header/header.module';
import { MobileModule } from './@modules/mobile/mobile.module';
import { SharedModule } from './@shared/shared.module';
import { WidgetsModule } from './@modules/widgets/widgets.module';
import { Forms2Module } from './@pages/forms2/forms2.module';
import { DocsModule } from './@docs/docs.module';
import { ServiceWorkerModule } from '@angular/service-worker';

// pages
import { ZoomScaleComponent } from './@components/zoom-scale/zoom-scale.component';
import { AppComponent } from './app.component';
import { RootComponent } from './@components/root/root.component';

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}

const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;
export const apiScope = environment.ai.chatApiScope;

// **** MSAL CONFIGURATIONS **** //
export const msalConfig = {
  auth: {
    clientId: environment.clientId,
    authority: environment.authority,
    redirectUri: environment.redirectUri,
    postLogoutRedirectUri: environment.postLogoutRedirectUri,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: BrowserCacheLocation.SessionStorage,
    storeAuthStateInCookie: isIE,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: any, message: string, containsPii: boolean) => {
        if (containsPii) {
          return;
        }
        // console.log(`MSAL: ${message}`);
      },
      piiLoggingEnabled: false
    },
    windowHashTimeout: 60000,
    iframeHashTimeout: 6000,
    loadFrameTimeout: 0,
    asyncPopups: false
  }
};

export const msalInterceptorConfig: {
  interactionType: InteractionType.Redirect | InteractionType.Popup;
  protectedResourceMap: Map<string, string[]>; } = {
  interactionType: InteractionType.Redirect,
  protectedResourceMap: new Map<string, string[]>([
    ['https://graph.microsoft.com/v1.0/me', ['user.read']],
    ...(environment.ai.chatApiScope
      ? [[`${environment.apiUrl}/api/integrations/people-finder/*`, [environment.ai.chatApiScope]] as [string, string[]]]
      : []),
    ...(environment.ai.chatApiScope && environment.ai.chatProtectedResource
      ? [[`${environment.ai.chatProtectedResource}/*`, [environment.ai.chatApiScope]] as [string, string[]]]
      : [])
  ])
};

export const msalGuardConfig: {
  interactionType: InteractionType.Redirect | InteractionType.Popup;
  authRequest: {scopes: string[];};} = {
  interactionType: InteractionType.Redirect,
  authRequest: {
    scopes: [
      'openid',
      'profile',
      'user.read',
      environment.ai.chatApiScope
    ]
  }
};

@NgModule({
  declarations: [
    // components
    ZoomScaleComponent,
    AppComponent,
    RootComponent,
    // pages
  ],
 imports: [
    // modules (angular)
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    Forms2Module,
    PagesModule,
    // modules (third-party)
    CarouselModule,
    ToastrModule.forRoot(),
    // modules
    AppRoutingModule,
    BlocksModule,
    UserModule,
    FooterModule,
    HeaderModule,
    MobileModule,
    SharedModule,
    WidgetsModule,
    HttpClientModule,
    RxReactiveFormsModule,
    FormsModule,
    DocsModule,
    ReactiveFormsModule,
    BrowserTransferStateModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      },
      //defaultLanguage: "en"
    }),
    MsalModule.forRoot(
      new PublicClientApplication(msalConfig),
      msalGuardConfig,
      msalInterceptorConfig
    ),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true,
    },
    { 
      provide: HTTP_INTERCEPTORS, 
      useClass: MockServiceNowInterceptor, 
      multi: true 
    },
    { 
      provide: 'isBrowser', 
      useValue: true,
    },
    LocalizationService
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
