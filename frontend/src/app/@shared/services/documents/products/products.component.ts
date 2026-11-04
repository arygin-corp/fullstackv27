import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Data } from '@angular/router';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent {
  data:Data;

  constructor(http:HttpClient) {
    const data$:Observable<Data> = http.get<Data>('/assets/api/products/products.json');
    data$.subscribe( data=>{
      this.data = data;
      console.log(data);
    });
  }

}
