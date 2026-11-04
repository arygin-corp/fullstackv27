// src/app/@pages/domains/subdomains/subdomains-two/subdomains-two.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomainsService } from '../../../../@shared/services/domains.service';

@Component({
  selector: 'app-subdomains-two',
  templateUrl: './subdomains-two.component.html',
  styleUrls: ['./subdomains-two.component.scss']
})
export class SubdomainsTwoComponent implements OnInit {
  level1Domain: any;      // Vehicle
  parentDomain: any;      // Sales
  subdomains: any[] = []; // The Level 3 items to show
  isLoading: boolean = true;
  currentType: string = '';
  currentSubtype: string = '';

  constructor(
    private route: ActivatedRoute,
    private domainsService: DomainsService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.currentType = params.get('type') || '';
      this.currentSubtype = params.get('subtype') || '';
      this.fetchData();
    });
  }

  fetchData(): void {
    this.isLoading = true;
    this.domainsService.getDomains().subscribe({
      next: (data) => {
        // 1. Find the Level 1 Domain (e.g., Vehicle)
        this.level1Domain = data.find(d => 
          d.slug === this.currentType || d.name.toLowerCase().replace(/ /g, '-') === this.currentType
        );

        if (this.level1Domain) {
          // 2. Find the Level 2 Parent within Level 1 (e.g., Sales)
          this.parentDomain = this.level1Domain.subdomains?.find((s: any) => 
            s.slug === this.currentSubtype || s.name.toLowerCase().replace(/ /g, '-') === this.currentSubtype
          );

          // 3. Set the Level 3 subdomains to be displayed
          if (this.parentDomain) {
            this.subdomains = (this.parentDomain.subdomains || [])
              .map((sub: any) => ({
                ...sub,
                image: this.formatImageUrl(sub.image)
              }))
              .sort((a: any, b: any) => (b.product_count || 0) - (a.product_count || 0));
          }
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  private formatImageUrl(imagePath: string | null): string {
    if (!imagePath) return 'assets/images/placeholder.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:8000${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  }

  resolveNavigation(subdomain: any): any[] {
    // Level 3 items lead directly to domains in the product list
    return ['/products', subdomain.slug || 'domain', subdomain.id];
  }

  getDescription(item: any): string {
    return item.desc || item.description || item.name;
  }
}