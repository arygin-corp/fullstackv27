// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { BehaviorSubject, Observable } from 'rxjs';
// import { Product } from '../../../@models/product.model';
// import { environment } from '../../../environments/environment';

// @Injectable({
//   providedIn: 'root'
// })

// export class ProductService {
//   private productDataSubject = new BehaviorSubject<{
//     product: Product | null, 
//     quantity: number
//   }>({
//     product: null, 
//     quantity: 1
//   });

//   // Observable for components to subscribe to product data changes
//   productData$: Observable<{
//     product: Product | null, 
//     quantity: number
//   }> = this.productDataSubject.asObservable();
//    private products = `${environment.apiUrl}/marketplace/api/products/`;

//   constructor(private http: HttpClient) { }

//   getAllProducts(): Observable<Product[]> {
//     return this.http.get<Product[]>(this.products);
//   }

//   getProduct(id: any): Observable<Product> {
//     return this.http.get<Product>(`${this.products}/${id}`);
//   }
  
//   createProduct(data: any): Observable<any> {
//     return this.http.post(this.products, data);
//   }

//   updateProduct(id: any, data: any): Observable<any> {
//     return this.http.put(`${this.products}/${id}`, data);
//   }

//   deleteProduct(id: any): Observable<any> {
//     return this.http.delete(`${this.products}/${id}`);
//   }

//   deleteAllProducts(): Observable<any> {
//     return this.http.delete(this.products);
//   }

//   findByProductName(name: any): Observable<Product[]> {
//     return this.http.get<Product[]>(`${this.products}?name=${name}`);
//   }

//   setProductData(product: Product, quantity: number): void {
//     this.productDataSubject.next({ product, quantity });
//   }

//   getCurrentProductData() {
//     return this.productDataSubject.getValue();
//   }
// }








import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../interfaces/product';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private productDataSubject = new BehaviorSubject<{ product: Product | null; quantity: number }>({ product: null, quantity: 1 });
  productData$: Observable<{ product: Product | null; quantity: number }> = this.productDataSubject.asObservable();
  private products = `${environment.apiUrl}/marketplace/api/products/`;

  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<Product[]> { return this.http.get<Product[]>(this.products); }
  getProduct(id: string | number): Observable<Product> { return this.http.get<Product>(`${this.products}${id}/`); }
  createProduct(data: any): Observable<any> { return this.http.post(this.products, data); }
  updateProduct(id: string | number, data: any): Observable<any> { return this.http.put(`${this.products}${id}/`, data); }
  deleteProduct(id: string | number): Observable<any> { return this.http.delete(`${this.products}${id}/`); }
  deleteAllProducts(): Observable<any> { return this.http.delete(this.products); }
  findByProductName(name: string): Observable<Product[]> { return this.http.get<Product[]>(`${this.products}?name=${encodeURIComponent(name)}`); }
  setProductData(product: Product, quantity: number): void { this.productDataSubject.next({ product, quantity }); }
  getCurrentProductData() { return this.productDataSubject.getValue(); }
}
