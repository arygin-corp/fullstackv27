import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Product } from '../interfaces/product';
import { Domain } from '../interfaces/domain';
import { Brand } from '../interfaces/brand';
import { ShopService } from '../api/shop.service'

@Injectable({ providedIn: 'root' })

export class CampaignService extends ShopService {
  
  // ✅ BESTSELLERS
  getBestsellers(limit: number): Observable<Product[]> {
    return of(this.generateProducts('Bestseller', limit)).pipe(delay(300));
  }

  // ✅ BRANDS
  getPopularBrands(): Observable<Brand[]> {
    return of([
      { name: 'AWS', image: 'https://logo.clearbit.com/amazon.com' },
      { name: 'Stripe', image: 'https://logo.clearbit.com/stripe.com' },
      { name: 'Microsoft', image: 'https://logo.clearbit.com/microsoft.com' },
      { name: 'Google', image: 'https://logo.clearbit.com/google.com' }
    ] as Brand[]);
  }


  // ✅ DOMAINS
  getDomainsBySlug(slugs: string[], page: number): Observable<Domain[]> {
    const data = [
      {
        name: 'AI & Machine Learning',
        domain: 'ai-ml',
        price: 0,
        available: true,
        extension: ''
      },
      {
        name: 'Marketing Data',
        domain: 'marketing',
        price: 0,
        available: true,
        extension: ''
      },
      {
        name: 'Financial Data',
        domain: 'finance',
        price: 0,
        available: true,
        extension: ''
      },
      {
        name: 'Customer Intelligence',
        domain: 'customer-data',
        price: 0,
        available: true,
        extension: ''
      },
      {
        name: 'Supply Chain Analytics',
        domain: 'supply-chain',
        price: 0,
        available: true,
        extension: ''
      },
      {
        name: 'Healthcare Data',
        domain: 'healthcare',
        price: 0,
        available: true,
        extension: ''
      }
    ];

    return of(data as unknown as Domain[]).pipe(delay(300));
  }

  // ✅ FEATURED
  getFeaturedProducts(category: string | null, limit: number): Observable<Product[]> {
    return of(this.generateProducts(`Featured ${category || 'All'}`, limit)).pipe(delay(400));
  }

  // ✅ LATEST
  getLatestProducts(category: string | null, limit: number): Observable<Product[]> {
    return of(this.generateProducts(`New ${category || 'All'}`, limit)).pipe(delay(400));
  }

  // ✅ COLUMN DATA
  getTopRated(limit: number): Observable<Product[]> {
    return of(this.generateProducts('Top Rated', limit, 5));
  }

  getSpecialOffers(limit: number): Observable<Product[]> {
    return of(
      this.generateProducts('Sale', limit).map(p => ({
        ...p,
        oldPrice: p.price + 150
      }))
    );
  }

  // ✅ GENERATOR
  private generateProducts(
    prefix: string,
    count: number,
    fixedRating?: number
  ): Product[] {

    const datasetNames = [
      'Global Consumer Behavior Dataset',
      'B2B Decision-Maker Contact Database',
      'AI Training Dataset - Financial Transactions',
      'Retail Purchase Intelligence Dataset',
      'Real Estate Market Analytics Feed',
      'Healthcare Claims & Utilization Dataset',
      'Automotive Fleet Performance Data',
      'SaaS Company Revenue Intelligence',
      'E-commerce Customer Insights Dataset',
      'Global Supply Chain Analytics Data'
    ];

    const data = Array.from({ length: count }, (_, i) => ({
      id: i + 1,

      // ✅ clean slug
      slug: `dataset-${i + 1}`,

      // ✅ REAL DATASET NAME (IMPORTANT)
      name: datasetNames[i % datasetNames.length],

      // ✅ DESCRIPTIONS (used by UI cards)
      short_desc: 'Enterprise-grade dataset for analytics, AI training, and business intelligence.',
      brief_desc: 'Millions of structured records with high accuracy, ready for integration into your data pipelines.',

      // ✅ REALISTIC PRICING (enterprise tier)
      price: this.random(499, 4999),
      compareAtPrice: this.random(500, 5500),

      // ✅ TRUST SIGNALS
      rating: fixedRating || this.random(4, 5),
      reviews: this.random(20, 200),

      // ✅ IMAGE (still placeholder)
      images: [`https://picsum.photos/300/200?random=${i + 1}`],

      // ✅ MARKETPLACE BADGES
      badges: [
        this.random(0, 1)
          ? { type: 'new', label: 'NEW' }
          : { type: 'hot', label: 'TRENDING' }
      ]

    }));

    return data as unknown as Product[];
  }

  private random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}