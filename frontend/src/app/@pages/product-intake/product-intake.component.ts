import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MsalService } from '@azure/msal-angular';
import { environment } from '../../../environments/environment';

interface ProductRequest {
  id: number;
  product_name: string;
  product_domain: string;
  product_type: string;
  status: string;
  submitted_at: string;
  created_at: string;
}

@Component({
  selector: 'app-product-intake',
  templateUrl: './product-intake.component.html',
  styleUrls: ['./product-intake.component.scss']
})
export class ProductIntakeComponent implements OnInit {
  items: ProductRequest[] = [];
  loading = true;
  error = '';

  constructor(private http: HttpClient, private msal: MsalService) {}

  ngOnInit(): void {
    this.load();
  }

  statusLabel(status: string): string {
    return (status || 'draft').replace(/_/g, ' ');
  }

  private async load(): Promise<void> {
    const headers = await this.authHeaders();
    if (!headers) {
      this.loading = false;
      this.error = 'Sign in is required to view product requests.';
      return;
    }

    this.http.get<ProductRequest[] | { results: ProductRequest[] }>(
      `${environment.apiUrl}/api/new/product/intake/`,
      { headers }
    ).subscribe({
      next: (response) => {
        this.items = Array.isArray(response) ? response : (response?.results || []);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.status === 401 || err?.status === 403
          ? 'Sign in is required to view product requests.'
          : 'Product requests could not be loaded.';
      }
    });
  }

  private async authHeaders(): Promise<HttpHeaders | null> {
    const account = this.msal.instance.getActiveAccount()
      || this.msal.instance.getAllAccounts()[0];
    if (!account) {
      return null;
    }
    try {
      const result = await this.msal.instance.acquireTokenSilent({
        scopes: ['openid', 'profile'],
        account
      });
      if (!result.idToken) {
        return null;
      }
      return new HttpHeaders({ Authorization: `Bearer ${result.idToken}` });
    } catch {
      return null;
    }
  }
}
