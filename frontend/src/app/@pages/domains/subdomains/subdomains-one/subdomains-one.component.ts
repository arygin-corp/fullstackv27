import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomainsService } from '../../../../@shared/services/domains.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-subdomains-one',
  templateUrl: './subdomains-one.component.html',
  styleUrls: ['./subdomains-one.component.scss']
})

export class SubdomainsOneComponent implements OnInit {
  parentDomain: any;
  subdomains: any[] = [];
  isLoading: boolean = true;
  currentType: string = '';

  constructor(
    private route: ActivatedRoute,
    private domainsService: DomainsService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.currentType = params.get('type') || '';
      this.fetchData();
    });
  }

  fetchData(): void {
    this.isLoading = true;
    this.domainsService.getDomains().subscribe({
      next: (data) => {
        // Find the parent
        const found = data.find(d => 
          d.slug === this.currentType || d.name.toLowerCase().replace(/ /g, '-') === this.currentType
        );

        if (found) {
          this.parentDomain = found;
          // Map and format the images for Level 2 (subdomains)
          this.subdomains = (found.subdomains || [])
            .map((sub: any) => ({
              ...sub,
              // Ensure image is formatted if not already absolute
              image: sub.image?.startsWith('http') ? sub.image : `${environment.apiUrl}${sub.image}`
            }))
            .sort((a: any, b: any) => (b.product_count || 0) - (a.product_count || 0));
        }
        
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  resolveNavigation(subdomain: any): any[] {
    // If we have deeper sub-subdomains, go to Level 3 page
    if (subdomain.subdomains && subdomain.subdomains.length > 0) {
      const subSlug = subdomain.slug || subdomain.name.toLowerCase().replace(/ /g, '-');
      return ['/', this.currentType, subSlug]; // Result: /domain/automotive/parts
    }
    // Otherwise, go straight to products
    return ['/marketplace/products', subdomain.slug];
  }

  getDescription(item: any): string {
    return item.desc || item.description || item.name;
  }
}