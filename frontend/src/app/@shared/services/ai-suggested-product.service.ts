import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

const STORAGE_KEY = 'gdx-ai-suggested-products';

/**
 * Products opened from AI Suggested Products. The mark follows the product
 * into the cart and checkout. The pill itself is only drawn on search and
 * the product detail page.
 */
@Injectable({ providedIn: 'root' })
export class AiSuggestedProductService {
    constructor(@Inject(PLATFORM_ID) private platformId: object) {}

    mark(product: { id?: unknown; slug?: string } | null | undefined): void {
        if (!product || !isPlatformBrowser(this.platformId)) {
            return;
        }
        const state = this.read();
        if (product.id != null && String(product.id) !== '') {
            state.ids.add(String(product.id));
        }
        if (product.slug) {
            state.slugs.add(String(product.slug));
        }
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
            ids: [...state.ids],
            slugs: [...state.slugs],
        }));
    }

    isSuggested(product: { id?: unknown; slug?: string } | null | undefined): boolean {
        if (!product || !isPlatformBrowser(this.platformId)) {
            return false;
        }
        const state = this.read();
        if (product.id != null && state.ids.has(String(product.id))) {
            return true;
        }
        return Boolean(product.slug && state.slugs.has(String(product.slug)));
    }

    private read(): { ids: Set<string>; slugs: Set<string> } {
        const empty = { ids: new Set<string>(), slugs: new Set<string>() };
        try {
            const raw = sessionStorage.getItem(STORAGE_KEY);
            if (!raw) {
                return empty;
            }
            const parsed = JSON.parse(raw);
            return {
                ids: new Set(Array.isArray(parsed?.ids) ? parsed.ids.map(String) : []),
                slugs: new Set(Array.isArray(parsed?.slugs) ? parsed.slugs.map(String) : []),
            };
        } catch {
            return empty;
        }
    }
}
