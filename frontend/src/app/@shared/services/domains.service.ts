// src/app/@shared/services/domains.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Domain } from '../../../@models/domain.model';
import { environment } from '../../../environments/environment';
import { map, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class DomainsService {
  private domains$?: Observable<Domain[]>;
  private apiUrl = `${environment.apiUrl}/api/marketplace/domains/`; 

  constructor(private http: HttpClient) { }

  getDomains(): Observable<Domain[]> {
    if (!this.domains$) {
      this.domains$ = this.http.get<Domain[]>(this.apiUrl).pipe(
        map(domains => this.withProducts(domains)),
        shareReplay(1) // Stores the result and shares it with all future subscribers
      );
    }
    return this.domains$;
  }

  getCampaignDomains(): Observable<Domain[]> {
    return this.http.get<Domain[]>(`${this.apiUrl}?campaign=1`).pipe(
      map(domains => this.withProducts(domains))
    );
  }

  singleProduct(domain: Domain): { name?: string; slug: string } | null {
    if (!domain || (domain.product_count || 0) !== 1) {
      return null;
    }
    const product = domain.products?.[0];
    return product?.slug ? product : null;
  }

  catalogLink(domain: Domain, level: 'domain' | 'subdomain' | 'subdomain2', parents: string[] = []): { commands: any[]; queryParams?: { [key: string]: string } } {
    if ((domain?.subdomains || []).length) {
      const slug = domain.slug || String(domain.name || '').toLowerCase().replace(/ /g, '-');
      return { commands: ['/', ...parents.filter(Boolean), slug] };
    }
    const product = this.singleProduct(domain);
    if (product?.slug) {
      return { commands: ['/marketplace/product', product.slug] };
    }
    const queryParams: { [key: string]: string } = {};
    if (level === 'domain') {
      queryParams.domain_id = String(domain.id);
    } else if (level === 'subdomain') {
      queryParams.subdomain_id = String(domain.id);
    } else {
      queryParams.subdomain2_id = String(domain.id);
    }
    if (domain.name) {
      queryParams.domain_name = domain.name;
    }
    return { commands: ['/marketplace'], queryParams };
  }

  private withProducts(domains: Domain[] | null | undefined): Domain[] {
    return (domains || [])
      .map(domain => this.plainDomain(domain))
      .filter((domain): domain is Domain => !!domain);
  }

  private plainDomain(domain: Domain): Domain | null {
    const subdomains = this.withProducts(domain?.subdomains);
    const hasProducts = (domain?.products?.length || 0) > 0
      || (domain?.product_count || 0) > 0
      || subdomains.length > 0;
    if (!hasProducts) {
      return null;
    }
    return {
      ...domain,
      desc: this.stripHtml(domain?.desc),
      subdomains
    };
  }

  private stripHtml(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    const withBreaks = value
      .replace(/<\s*br\s*\/?\s*>/gi, ' ')
      .replace(/<\/\s*(p|div|li|h[1-6])\s*>/gi, ' ');
    const text = typeof DOMParser !== 'undefined'
      ? new DOMParser().parseFromString(withBreaks, 'text/html').body.textContent || ''
      : withBreaks.replace(/<[^>]*>/g, ' ');
    return text.replace(/\s+/g, ' ').trim();
  }
}