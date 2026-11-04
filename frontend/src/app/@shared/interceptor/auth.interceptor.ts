import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { Observable } from 'rxjs/internal/Observable';
import { from } from 'rxjs/internal/observable/from';
import { switchMap } from 'rxjs/internal/operators/switchMap';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private msalService: MsalService
  ) {}

  intercept(req: HttpRequest<any>,next: HttpHandler): Observable<HttpEvent<any>> {
    const account = this.msalService.instance.getActiveAccount();

    return from(
      this.msalService.instance.acquireTokenSilent({
        scopes: ['api://496a6de0-52a2-44d9-aaab-42a964716e65/access_as_user'], account
      })).pipe(switchMap((result) => {
      const authReq = req.clone({
        setHeaders: {Authorization: `Bearer ${result.accessToken}`}
      });
        return next.handle(authReq);
      })
    );
  }
}