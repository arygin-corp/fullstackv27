import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { CarouselComponent, SlidesOutputData } from 'ngx-owl-carousel-o';
import { ShopService } from '../../@shared/api/shop.service';
import { DomainsService } from '../../@shared/services/domains.service';
import { Product } from '../../@shared/interfaces/product';
import { Domain } from '../../../@models/domain.model';
import { environment } from '../../../environments/environment';

interface CampaignSlide {
  title: string;
  text: string;
  image: string;
  fragment: string;
}

@Component({
  selector: 'app-campaigns',
  templateUrl: './campaigns.component.html',
  styleUrls: ['./campaigns.component.scss']
})
export class CampaignsComponent implements OnInit {
  domains: Domain[] = [];
  mostRequestedAll: Product[] = [];
  mostRequested: Product[] = [];
  mostRequestedGroups: { name: string; current: boolean }[] = [];
  showMostRequested = true;
  newProducts: Product[] = [];
  newProductsPage = 0;
  featuredAll: Product[] = [];
  featuredProducts: Product[] = [];
  featuredGroups: { name: string; current: boolean }[] = [];
  featuredPage = 0;
  loading = true;
  error = '';
  rowEdges: { [key: string]: { prev: boolean; next: boolean } } = {
    mostRequested: { prev: false, next: false }
  };
  readonly brands = [
    { name: 'Toyota', src: 'assets/images/toyota/FullToyota-dark.svg' },
    { name: 'OneTech', src: 'assets/images/toyota/OneTech-dark.svg' },
    { name: 'Toyota Connected', src: 'assets/images/toyota/ToyotaConnected-dark.svg' },
    { name: 'Toyota Financial Services', src: 'assets/images/toyota/ToyotaFinancial.svg' },
    { name: 'Woven by Toyota', src: 'assets/images/toyota/WovenPlanet.svg' },
    { name: 'One Toyota Service', src: 'assets/images/toyota/1ts-full.svg' }
  ];
  readonly slides: CampaignSlide[] = [
    {
      title: 'Most Requested',
      text: 'Start with catalog products people open first, then request access from the product page.',
      image: 'assets/images/banners/hero-most-requested.jpg',
      fragment: 'most-requested'
    },
    {
      title: 'Popular Domains',
      text: 'Browse a data domain such as Vehicle, Manufacturing, or Customer before you pick a product.',
      image: 'assets/images/banners/hero-popular-domains.jpg',
      fragment: 'popular-domains'
    },
    {
      title: 'New Products',
      text: 'See products recently added to the catalog, then compare them with the featured products below.',
      image: 'assets/images/banners/hero-new-products.jpg',
      fragment: 'new-products'
    }
  ];
  readonly heroOptions = {
    items: 1,
    loop: true,
    dots: true,
    nav: false,
    autoplay: true,
    autoplayTimeout: 7000,
    autoplayHoverPause: true,
    mouseDrag: true,
    touchDrag: true
  };
  readonly rowOptions = {
    items: 4,
    margin: 16,
    loop: false,
    dots: false,
    nav: false,
    mouseDrag: true,
    touchDrag: true,
    responsive: {
      0: { items: 1 },
      768: { items: 2 },
      1200: { items: 4 }
    }
  };

  @ViewChild('mostRequestedCarousel') mostRequestedCarousel: CarouselComponent;

  constructor(
    private domainsService: DomainsService,
    private shop: ShopService
  ) {}

  @HostListener('window:resize')
  onWindowResize(): void {
    this.refreshRowEdges();
  }

  get newProductSmalls(): Product[] {
    const start = 1 + this.newProductsPage * 6;
    return this.newProducts.slice(start, start + 6);
  }

  get canPageNewProductsPrev(): boolean {
    return this.newProductsPage > 0;
  }

  get canPageNewProductsNext(): boolean {
    return (this.newProductsPage + 1) * 6 < this.newProducts.length - 1;
  }

  get featuredVisible(): Product[] {
    const start = this.featuredPage * 6;
    return this.featuredProducts.slice(start, start + 6);
  }

  get canPageFeaturedPrev(): boolean {
    return this.featuredPage > 0;
  }

  get canPageFeaturedNext(): boolean {
    return (this.featuredPage + 1) * 6 < this.featuredProducts.length;
  }

  pageNewProducts(direction: number): void {
    const nextPage = this.newProductsPage + direction;
    const lastPage = Math.ceil(Math.max(this.newProducts.length - 1, 0) / 6) - 1;
    if (nextPage < 0 || nextPage > lastPage) {
      return;
    }
    this.newProductsPage = nextPage;
  }

  pageFeatured(direction: number): void {
    const nextPage = this.featuredPage + direction;
    const lastPage = Math.ceil(this.featuredProducts.length / 6) - 1;
    if (nextPage < 0 || nextPage > lastPage) {
      return;
    }
    this.featuredPage = nextPage;
  }

  selectFeatured(name: string): void {
    if (this.featuredGroups.find(group => group.current)?.name === name) {
      return;
    }
    this.featuredGroups.forEach(group => {
      group.current = group.name === name;
    });
    this.featuredProducts = name === 'All'
      ? this.featuredAll
      : this.featuredAll.filter(product => product.domain === name);
    this.featuredPage = 0;
  }

  selectMostRequested(name: string): void {
    if (this.mostRequestedGroups.find(group => group.current)?.name === name) {
      return;
    }
    this.mostRequestedGroups.forEach(group => {
      group.current = group.name === name;
    });
    this.mostRequested = name === 'All'
      ? this.mostRequestedAll
      : this.mostRequestedAll.filter(product => product.domain === name);
    this.rowEdges.mostRequested = { prev: false, next: false };
    this.showMostRequested = false;
    setTimeout(() => {
      this.showMostRequested = true;
    });
  }

  onRowMoved(key: string, total: number, data: SlidesOutputData): void {
    const start = data?.startPosition || 0;
    const visible = data?.slides?.length || 0;
    this.rowEdges[key] = {
      prev: start > 0,
      next: visible > 0 && start + visible < total
    };
  }

  private refreshRowEdges(): void {
    const rows: { key: string; carousel: CarouselComponent; total: number }[] = [
      { key: 'mostRequested', carousel: this.mostRequestedCarousel, total: this.mostRequested.length }
    ];
    rows.forEach(row => this.syncEdges(row.key, row.carousel, row.total));
  }

  private syncEdges(key: string, carousel: CarouselComponent, total: number): void {
    if (!carousel?.slidesData?.length) {
      return;
    }
    const slides = carousel.slidesData.filter(slide => !slide.isCloned);
    const active = slides
      .map((slide, index) => slide.isActive ? index : -1)
      .filter(index => index >= 0);
    if (!active.length) {
      return;
    }
    this.rowEdges[key] = {
      prev: active[0] > 0,
      next: active[active.length - 1] < slides.length - 1
    };
  }

  ngOnInit(): void {
    this.domainsService.getCampaignDomains().subscribe({
      next: (domains) => {
        this.domains = (domains || [])
          .map(domain => ({
            ...domain,
            image: this.imageUrl(domain.image),
            desc: this.clipText(domain.desc)
          }))
          .filter(domain => domain.name && !/^test/i.test(domain.name.trim()))
          .sort((a, b) => (b.product_count || 0) - (a.product_count || 0))
          .slice(0, 8);
      },
      error: () => {
        this.error = 'The campaign domains could not be loaded.';
      }
    });

    this.shop.getProductsList(null, { page: 1, limit: 20, sort: 'most_requested', campaign: true }).subscribe({
      next: (list) => {
        this.mostRequestedAll = this.catalogProducts(list.items);
        this.mostRequestedGroups = this.domainGroups(this.mostRequestedAll);
        this.mostRequested = this.mostRequestedAll;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = this.error || 'The campaign products could not be loaded.';
      }
    });

    this.shop.getProductsList(null, { page: 1, limit: 24, sort: 'default', campaign: true }).subscribe({
      next: (list) => {
        this.featuredAll = this.catalogProducts(list.items);
        this.featuredGroups = this.domainGroups(this.featuredAll);
        this.featuredProducts = this.featuredAll;
        this.featuredPage = 0;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = this.error || 'The campaign products could not be loaded.';
      }
    });

    this.shop.getProductsList(null, { page: 1, limit: 25, sort: 'newest', campaign: true }).subscribe({
      next: (list) => {
        this.newProducts = this.catalogProducts(list.items);
        this.newProductsPage = 0;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = this.error || 'The campaign products could not be loaded.';
      }
    });
  }

  private domainGroups(products: Product[]): { name: string; current: boolean }[] {
    const counts = new Map<string, number>();
    products.forEach(product => {
      const name = (product.domain || '').trim();
      if (name) {
        counts.set(name, (counts.get(name) || 0) + 1);
      }
    });
    const names = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);
    return [{ name: 'All', current: true }, ...names.map(name => ({ name, current: false }))];
  }

  private catalogProducts(products: Product[] | null | undefined): Product[] {
    return (products || [])
      .filter(product => product.name && !/^test/i.test(product.name.trim()))
      .map(product => ({
        ...product,
        short_desc: this.clipText(product.short_desc)
      }));
  }

  subdomainLink(domain: Domain, subdomain: Domain): string[] {
    const domainSlug = domain.slug || domain.name.toLowerCase().replace(/ /g, '-');
    const subSlug = subdomain.slug || subdomain.name.toLowerCase().replace(/ /g, '-');
    if (subdomain.subdomains?.length) {
      return ['/', domainSlug, subSlug];
    }
    if (subdomain.slug) {
      return ['/marketplace/products', subdomain.slug];
    }
    return this.domainLink(domain);
  }

  domainLink(domain: Domain): string[] {
    if (domain.product_count === 1 && domain.products?.length) {
      const product = domain.products[0];
      const productSlug = product.slug || String(product.name || '').toLowerCase().replace(/ /g, '-');
      return ['/marketplace/product', productSlug];
    }
    const slug = domain.slug || domain.name.toLowerCase().replace(/ /g, '-');
    return ['/', slug];
  }

  private clipText(value: string | null | undefined, limit = 100): string {
    const text = (value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text.length <= limit) {
      return text;
    }
    const cut = text.slice(0, limit).replace(/\s+\S*$/, '').trim();
    return `${cut || text.slice(0, limit).trim()}.....`;
  }

  private imageUrl(imagePath: string | null): string {
    if (!imagePath) {
      return 'assets/images/domains/cover/default.jpg';
    }
    if (imagePath.startsWith('http') || imagePath.startsWith('assets/')) {
      return imagePath;
    }
    const base = environment.apiUrl.replace(/\/$/, '');
    const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${base}${path}`;
  }
}
