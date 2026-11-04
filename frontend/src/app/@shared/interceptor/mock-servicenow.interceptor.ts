import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable()
export class MockServiceNowInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const matches = /\/submitOrder(\?|$)/.test(req.url);
    const shouldMock = environment.useMockServiceNow && req.method === 'POST' && matches;
    console.log('MockServiceNowInterceptor intercept called', { url: req.url, method: req.method, useMock: environment.useMockServiceNow, matches, shouldMock });
    if (!shouldMock) {
      return next.handle(req);
    }
    const orderNumber = 'REQ-' + Date.now().toString().slice(-8);
    const body = { result: { number: orderNumber } };
    console.log('MockServiceNowInterceptor returning mock response for', req.url, orderNumber);
    return of(new HttpResponse({ status: 200, body })).pipe(delay(1500));
  }
}