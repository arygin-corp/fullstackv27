import { Component, OnInit } from '@angular/core';
import { Observable, Subject, merge } from 'rxjs';
import { Brand } from '../../@shared/interfaces/brand';
import { Product } from '../../@shared/interfaces/product';
import { Domain } from '../../@shared/interfaces/domain';
import { BlockHeaderGroup } from '../../@shared/interfaces/block-header-group';
import { takeUntil, tap } from 'rxjs/operators';

// ✅ IMPORT YOUR MOCK SERVICE
import { CampaignService } from '../../@shared/services/campaign.service';

interface ProductsCarouselGroup extends BlockHeaderGroup {
  products$: Observable<Product[]>;
}

interface ProductsCarouselData {
  abort$: Subject<void>;
  loading: boolean;
  products: Product[];
  groups: ProductsCarouselGroup[];
}

@Component({
  selector: 'app-campaigns',
  templateUrl: './campaigns.component.html',
  styleUrls: ['./campaigns.component.scss']
})

export class CampaignsComponent implements OnInit {

  destroy$ = new Subject<void>();

  bestsellers$!: Observable<Product[]>;
  brands$!: Observable<Brand[]>;
  popularDomains$!: Observable<Domain[]>;

  columnTopRated$!: Observable<Product[]>;
  columnSpecialOffers$!: Observable<Product[]>;
  columnBestsellers$!: Observable<Product[]>;

  featuredProducts!: ProductsCarouselData;
  latestProducts!: ProductsCarouselData;

  // ✅ FIXED HERE
  constructor(private shop: CampaignService) {}

  ngOnInit(): void {
    // ✅ CORE DATA
    this.bestsellers$ = this.shop.getBestsellers(7);
    this.brands$ = this.shop.getPopularBrands();
    this.popularDomains$ = this.shop.getDomainsBySlug([
      'vehicles',
      'parts',
      'customer',
      'manufacturing',
      'telematics',
      'quality',
      'finance-accounting',
      'dealership',
    ], 1);

    // ✅ COLUMN DATA
    this.columnTopRated$ = this.shop.getTopRated(3);
    this.columnSpecialOffers$ = this.shop.getSpecialOffers(3);
    this.columnBestsellers$ = this.shop.getBestsellers(3);

    // ✅ FEATURED CAROUSEL
    this.featuredProducts = {
      abort$: new Subject<void>(),
      loading: false,
      products: [],
      groups: [
        { name: 'All', current: true, products$: this.shop.getFeaturedProducts(null, 8) },

        { name: 'AI & Machine Learning', current: false, products$: this.shop.getFeaturedProducts('ai-ml', 8) },

        { name: 'Marketing Data', current: false, products$: this.shop.getFeaturedProducts('marketing', 8) },

        { name: 'Financial Data', current: false, products$: this.shop.getFeaturedProducts('finance', 8) },

        { name: 'Lead Generation', current: false, products$: this.shop.getFeaturedProducts('leads', 8) }
      ]
    };

    this.groupChange(this.featuredProducts, this.featuredProducts.groups[0]);

    // ✅ LATEST CAROUSEL
    this.latestProducts = {
      abort$: new Subject<void>(),
      loading: false,
      products: [],
      groups: [
        { name: 'All', current: true, products$: this.shop.getLatestProducts(null, 8) },

        { name: 'AI & Machine Learning', current: false, products$: this.shop.getLatestProducts('ai-ml', 8) },

        { name: 'Marketing Data', current: false, products$: this.shop.getLatestProducts('marketing', 8) },

        { name: 'Financial Data', current: false, products$: this.shop.getLatestProducts('finance', 8) },

        { name: 'Lead Generation', current: false, products$: this.shop.getLatestProducts('leads', 8) }
      ]
    };

    this.groupChange(this.latestProducts, this.latestProducts.groups[0]);
  }

  slides = [
    {
      title: 'AI & Machine Learning Data',
      text: 'Train models with high-quality structured datasets for predictive analytics and automation.',
      image_full: 'https://images.unsplash.com/photo-1677442135136-760c813a6b2e',
      image_classic: 'https://images.unsplash.com/photo-1677442135136-760c813a6b2e',
      image_mobile: 'https://images.unsplash.com/photo-1677442135136-760c813a6b2e'
    },
    {
      title: 'Marketing & Customer Intelligence',
      text: 'Access millions of consumer records and B2B insights to fuel growth and targeting.',
      image_full: 'https://images.unsplash.com/photo-1559526324-593bc073d938',
      image_classic: 'https://images.unsplash.com/photo-1559526324-593bc073d938',
      image_mobile: 'https://images.unsplash.com/photo-1559526324-593bc073d938'
    },
    {
      title: 'Financial & Market Data',
      text: 'Leverage real-time and historical financial datasets for analysis, forecasting, and trading.',
      image_full: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3',
      image_classic: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3',
      image_mobile: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3'
    }
  ];

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  groupChange(carousel: ProductsCarouselData, group: BlockHeaderGroup): void {
    carousel.loading = true;
    carousel.abort$.next();

    (group as ProductsCarouselGroup).products$
      .pipe(
        tap(() => carousel.loading = false),
        takeUntil(merge(this.destroy$, carousel.abort$))
      )
      .subscribe(products => carousel.products = products);
  }
}