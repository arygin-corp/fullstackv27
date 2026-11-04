// src/app/@pages/domains/domains.component.ts
import { Component, OnInit } from '@angular/core';
import { DomainsService } from './../../@shared/services/domains.service';
import { Domain } from '../../../@models/domain.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-domains',
  templateUrl: './domains.component.html',
  styleUrls: ['./domains.component.scss']
})

export class DomainsComponent implements OnInit {
  domainData: Domain[] = [];
  isLoading = true;
  private baseUrl = environment.apiUrl;
  constructor(private domainsService: DomainsService) {}

  ngOnInit(): void {
    this.domainsService.getDomains().subscribe({
      next: (data) => {
        this.domainData = data.map(domain => ({
          ...domain,
          image: this.formatImageUrl(domain.image)
        })).sort((a, b) => (b.product_count || 0) - (a.product_count || 0));
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  private formatImageUrl(imagePath: string | null): string {
    if (!imagePath) return 'assets/images/placeholder.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    
    const base = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    
    return `${base}${path}`;
  }

  getDescription(domain: Domain): string {
    return (domain as any).desc || (domain as any).description || `Explore products in ${domain.name}`;
  }

  resolveNavigation(domain: Domain): any[] {
    // 1. Single Product Redirect logic
    if (domain.product_count === 1 && domain.products?.length > 0) {
      const product = domain.products[0];
      // Ensure we use the slug from the product object
      const productSlug = product.slug || product.name.toLowerCase().replace(/ /g, '-');
      
      // FIX: Changed 'products' to 'product' to match MarketplaceRoutingModule
      return ['/marketplace/product', productSlug];
    }
    
    // 2. Domain/Subdomain Navigation logic
    const slug = domain.slug || domain.name.toLowerCase().replace(/ /g, '-');
    
    // Using an absolute path is safer to ensure it always maps back to your root :type route
    return ['/', slug];
  }
}