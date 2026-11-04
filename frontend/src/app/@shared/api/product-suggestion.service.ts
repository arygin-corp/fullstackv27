import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ShopService } from '../api/shop.service';

export interface SuggestionResult {
  items: NormalizedProduct[];
  total_pages: number;
  total_items: number;
  current_page?: number;
  did_you_mean?: string | null;
}

export interface NormalizedProduct {
  id: string | number | null;
  name: string;
  images: string[];
  data_steward_name: string;
  data_steward_email: string;
  poc_name_flat: string;
  poc_email_flat: string;
  short_desc: string;
  sku: string;
  slug: string;
  domain: string;
  datatype: string;
  tags: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductSuggestionService {
  constructor(private shop: ShopService) {}

  private parseTokens(rawQuery: string): { filters: Record<string, string[]>; remaining: string } {
    const filters: Record<string, string[]> = {};
    if (!rawQuery || !rawQuery.trim()) {
      return { filters, remaining: '' };
    }
    const regex = /(\w+):"([^"]+)"|(\w+):(\S+)/g;
    let m: RegExpExecArray | null;
    let remaining = rawQuery;
    while ((m = regex.exec(rawQuery)) !== null) {
      const key = (m[1] || m[3]).toLowerCase();
      const value = (m[2] || m[4]).trim();
      if (!filters[key]) { filters[key] = []; }
      filters[key].push(value);
      remaining = remaining.replace(m[0], '');
    }
    remaining = (remaining || '').replace(/\s+/g, ' ').trim();
    return { filters, remaining };
  }

  private normalize(product: any): NormalizedProduct {
    const images = Array.isArray(product.images)
      ? product.images
      : (product.images ? [product.images] : (product.image ? [product.image] : []));

    const dataStewardName = (product.data_steward && product.data_steward.name)
      || product.data_steward_name
      || product.steward_name
      || '';

    const dataStewardEmail = (product.data_steward && product.data_steward.email)
      || product.data_steward_email
      || product.steward_email
      || '';

    const pocArray = Array.isArray(product.poc) ? product.poc : (product.pocs || []);
    const poc_name_flat = pocArray.length
      ? pocArray.map((p: any) => p.name || '').filter(Boolean).join(', ')
      : (product.poc_name_flat || '');

    const poc_email_flat = pocArray.length
      ? pocArray.map((p: any) => p.email || '').filter(Boolean).join(', ')
      : (product.poc_email_flat || '');

    const tags = Array.isArray(product.tags)
      ? product.tags
      : (Array.isArray(product.keywords) ? product.keywords : []);

    return {
      id: product.id || product._id || product.sku || null,
      name: product.name || product.title || '',
      images,
      data_steward_name: dataStewardName,
      data_steward_email: dataStewardEmail,
      poc_name_flat,
      poc_email_flat,
      short_desc: product.short_desc || product.description || product.brief_desc || '',
      sku: product.sku || '',
      slug: product.slug || product.handle || '',
      domain: product.domain || product.domain_slug || '',
      datatype: product.datatype || product.type || '',
      tags
    };
  }

  private simpleFilter(normalized: NormalizedProduct, queryTokens: string[], filters: Record<string, string[]>): boolean {
    const q = queryTokens.join(' ').toLowerCase();
    if (q) {
      const hay = [
        normalized.name,
        normalized.datatype,
        normalized.data_steward_name,
        normalized.sku,
        normalized.slug,
        normalized.short_desc,
        (normalized.tags || []).join(' '),
        normalized.domain,
        normalized.poc_name_flat,
        normalized.poc_email_flat
      ].join(' ').toLowerCase();
      if (!hay.includes(q)) { return false; }
    }

    for (const key of Object.keys(filters)) {
      const values = filters[key].map(v => v.toLowerCase());
      const fieldValue = (() => {
        switch (key) {
          case 'domain': return normalized.domain.toLowerCase();
          case 'datatype': return normalized.datatype.toLowerCase();
          case 'sku': return normalized.sku.toLowerCase();
          case 'steward':
          case 'data_steward': return normalized.data_steward_name.toLowerCase();
          case 'tag': return (normalized.tags || []).join(' ').toLowerCase();
          default: return (normalized.name + ' ' + normalized.short_desc).toLowerCase();
        }
      })();

      const matches = values.every(v => fieldValue.includes(v));
      if (!matches) { return false; }
    }

    return true;
  }

  suggest(rawQuery: string, limit: number = 6, options: { page?: number; domain?: string; datatype?: string } = {}): Observable<SuggestionResult> {
    const parsed = this.parseTokens(rawQuery || '');
    const queryForBackend = parsed.remaining || rawQuery || '';
    const backendOptions: any = { ...options, page: options.page || 1 };

    return this.shop.getSuggestions(queryForBackend, limit, backendOptions).pipe(
      switchMap((res: any) => {
        const items = Array.isArray(res.items) ? res.items.map((p: any) => this.normalize(p)) : [];
        if (items.length > 0) {
          const result: SuggestionResult = {
            items,
            total_pages: typeof res.total_pages === 'number' ? res.total_pages : 1,
            total_items: typeof res.total_items === 'number' ? res.total_items : items.length,
            current_page: typeof res.current_page === 'number' ? res.current_page : backendOptions.page,
            did_you_mean: res.did_you_mean || null
          };
          return of(result);
        }

        // fallback to client-side filtering using products-json
        const domainSlug = options.domain || parsed.filters['domain']?.[0] || undefined;
        const listOptions: any = { page: backendOptions.page, limit: Math.max(limit, 1000) };

        return this.shop.getProductsList(domainSlug || null, listOptions).pipe(
          map((listRes: any) => {
            const rawItems = Array.isArray(listRes.items) ? listRes.items : [];
            const normalized = rawItems.map((p: any) => this.normalize(p));
            const queryTokens = (parsed.remaining || '').split(/\s+/).filter(Boolean);
            const filtered = normalized.filter(n => this.simpleFilter(n, queryTokens, parsed.filters));
            const sliced = filtered.slice(0, limit);
            const result: SuggestionResult = {
              items: sliced,
              total_pages: typeof listRes.pages === 'number' ? listRes.pages : Math.ceil(filtered.length / limit) || 1,
              total_items: typeof listRes.total === 'number' ? listRes.total : filtered.length,
              current_page: listRes.page || backendOptions.page,
              did_you_mean: null
            };
            return result;
          })
        );
      }),
      catchError(() => of({ items: [], total_pages: 1, total_items: 0, current_page: options.page || 1, did_you_mean: null }))
    );
  }
}
