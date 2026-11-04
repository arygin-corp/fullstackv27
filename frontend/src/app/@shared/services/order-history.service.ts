import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../../environments/environment";


@Injectable({
  providedIn: 'root'
})

export class OrderHistoryService {

  // private readonly GetRequestNumbersUrl: string = `${Global.BASE_API_URL}/requests/product`;
  // private readonly PutApiRequestEventUrl: string = `${Global.BASE_API_URL}/requests/event`;
  private readonly GetRequestNumbersUrl: string = `${environment.gdx.requestProduct}`;
  private readonly PutApiRequestEventUrl: string = `${environment.gdx.requestEvent}`;

  constructor( 
    private _http: HttpClient
  ) {}

  GetRequestNumbers(requestedFor: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    
    return this._http.get<any>(`${this.GetRequestNumbersUrl}?requestedFor=${requestedFor}`, httpOptions);
  }

  PutApiRequestEvent(requestId): Observable<any> {
    const payload = [`${requestId}`]
    return this._http.put<any>(this.PutApiRequestEventUrl, payload);
  }
  
}