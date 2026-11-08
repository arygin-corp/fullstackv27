import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Inject,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { fromEvent, Observable, of, Subject, timer } from 'rxjs';
import { catchError, debounce, debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { Product } from '../../interfaces/product';
import { RootService } from '../../services/root.service';
import { ShopService } from '../../api/shop.service';
import { CartService } from '../../services/cart.service';
import { FavoritesService } from '../../services/favorites.service';
import { CompareService } from '../../services/compare.service';
import { ProductSuggestionService, SuggestionResult, NormalizedProduct } from '../../api/product-suggestion.service';
import { AiSuggestedProductService } from '../../services/ai-suggested-product.service';

export type SearchLocation = 'header' | 'indicator' | 'mobile-header';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  exportAs: 'search',
})

export class SearchComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('input') inputElementRef!: ElementRef;
  @Input() location: SearchLocation = 'header';
  @Output() escape: EventEmitter<void> = new EventEmitter<void>();
  @Output() closeButtonClick: EventEmitter<void> = new EventEmitter<void>();
  @HostBinding('class.search') classSearch = true;
  @HostBinding('class.search--location--header') get classSearchLocationHeader() { return this.location === 'header'; }
  @HostBinding('class.search--location--indicator') get classSearchLocationIndicator() { return this.location === 'indicator'; }
  @HostBinding('class.search--location--mobile-header') get classSearchLocationMobileHeader() { return this.location === 'mobile-header'; }
  @HostBinding('class.search--has-suggestions') get classSearchHasSuggestions() { return this.hasSuggestions; }
  @HostBinding('class.search--suggestions-open') classSearchSuggestionsOpen = false;

  private destroy$: Subject<void> = new Subject<void>();
  form!: FormGroup;
  isLoading = false;
  hasSuggestions = false;

  suggestedProducts: Partial<Product>[] = [];
  addedToCartProducts: Product[] = [];
  recentSearches: string[] = [];

  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  didYouMean: string | null = null;
  favoriteIds = new Set<number | string>();
  compareIds = new Set<number | string>();
  expandedMatches = new Set<number | string>();
  resultMode: 'user' | 'ai' = 'user';
  aiLoading = false;
  private userResult: any = null;
  private aiResult: any = null;
  private aiQuery = '';
  private aiSearch$ = new Subject<{ query: string; page: number; immediate: boolean }>();

  get inputElement(): HTMLInputElement {
    return this.inputElementRef.nativeElement;
  }

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private fb: FormBuilder,
    private elementRef: ElementRef,
    private zone: NgZone,
    private shop: ShopService,
    private cart: CartService,
    private favorites: FavoritesService,
    private compare: CompareService,
    private suggestionService: ProductSuggestionService,
    private aiSuggestions: AiSuggestedProductService,
    public root: RootService,
  ) { }

  ngOnInit(): void {
    this.loadRecentSearches();
    this.initForm();
    this.initExternalClickListeners();
    this.favorites.items$.pipe(takeUntil(this.destroy$)).subscribe(items => {
      this.favoriteIds = new Set(items.map(item => item.id));
    });
    this.compare.items$.pipe(takeUntil(this.destroy$)).subscribe(items => {
      this.compareIds = new Set(items.map(item => item.id));
    });
    this.aiSearch$.pipe(
      debounce(({ immediate }) => timer(immediate ? 0 : 300)),
      switchMap(({ query, page, immediate }) => {
        if (!immediate) {
          this.aiLoading = true;
        }
        return this.shop.getAiSuggestions(query, 8, { page }).pipe(
          catchError(error => {
            console.error('AI SEARCH ERROR:', error);
            return of({
              suggestions: [],
              count: 0,
              page,
              page_size: 8,
              total_pages: 0,
              did_you_mean: null,
              query
            });
          })
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe(response => {
      this.aiLoading = false;
      this.aiResult = response;
      this.aiQuery = response?.query || '';
      if (this.resultMode === 'ai') {
        this.showResult(response);
      }
    });
  }

  private initForm(): void {
    this.form = this.fb.group({
      query: ['']
    });

    this.form.get('query')?.valueChanges.pipe(
      map(value => (value || '').trim()),
      debounceTime(50),
      distinctUntilChanged(),

      tap(query => {
        this.currentPage = 1;
        this.aiResult = null;
        this.expandedMatches = new Set();
        if (this.resultMode === 'ai') {
          this.suggestedProducts = [];
        } else {
          this.isLoading = true;
        }
        this.loadAi(query);
      }),

      switchMap(query => {
        if (query.length < 2) {
          this.isLoading = false;

          return of({
            suggestions: [],
            count: 0,
            page: 1,
            page_size: 8,
            total_pages: 0,
            did_you_mean: null
          });
        }

        return this.shop.getSuggestions(
          query,
          8,
          {
            page: this.currentPage
          }
        ).pipe(
          catchError(error => {
            console.error(
              'SEARCH API ERROR:',
              error
            );

            return of({
              suggestions: [],
              count: 0,
              page: 1,
              page_size: 8,
              total_pages: 0,
              did_you_mean: null
            });
          })
        );
      }),

      takeUntil(this.destroy$)
    ).subscribe({
      next: response => {
        this.userResult = response;
        if (this.resultMode === 'user') {
          this.handleResults(response);
        }
      },

      error: error => {
        console.error(
          'SEARCH SUBSCRIPTION ERROR:',
          error
        );

        this.isLoading = false;
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    const query = (this.form.value.query || '').trim();
    if (this.resultMode === 'ai') {
      this.loadAi(query, true);
      return;
    }
    this.runSearch();
  }

  selectMode(mode: 'user' | 'ai', event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.resultMode = mode;
    const query = (this.form.value.query || '').trim();
    if (mode === 'user') {
      if (this.userResult) {
        this.showResult(this.userResult);
      }
      return;
    }
    if (this.aiResult && this.aiQuery === query && Number(this.aiResult.page) === 1) {
      this.currentPage = 1;
      this.showResult(this.aiResult);
      return;
    }
    this.currentPage = 1;
    this.suggestedProducts = [];
    this.loadAi(query, true);
  }

  private loadAi(query: string, immediate = false): void {
    if (query.length < 2) {
      this.aiLoading = false;
      return;
    }
    this.aiLoading = true;
    this.aiSearch$.next({ query, page: this.currentPage, immediate });
  }

  applyFilters(): void {
    this.isLoading = true;
    this.currentPage = 1;
    this.executeSearch(this.form.value.query).subscribe({
      next: (res) => {
        this.handleResults(res);
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  executeSearch(
    query: string = this.form.value.query
  ): Observable<any> {

    const q = (query || '').trim();

    return this.shop.getSuggestions(
      q,
      8,
      {
        page: this.currentPage
      }
    ).pipe(
      catchError(error => {
        console.error(
          'SEARCH PAGE ERROR:',
          error
        );

        return of({
          suggestions: [],
          count: 0,
          page: this.currentPage,
          page_size: 8,
          total_pages: 0,
          did_you_mean: null
        });
      })
    );
  }

  private runSearch(): void {
    this.isLoading = true;

    this.executeSearch().subscribe({
      next: (res) => {
        this.handleResults(res);
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  private slugify(text: string): string {
    return (text || '')
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  }

  handleResults(res: any): void {
    this.isLoading = false;
    this.showResult(res);
  }

  private prefetchNextPage(query: string, page: number, totalPages: number): void {
    if (!query || page >= totalPages) {
      return;
    }
    const next = page + 1;
    const request = this.resultMode === 'ai'
      ? this.shop.getAiSuggestions(query, 8, { page: next })
      : this.shop.getSuggestions(query, 8, { page: next });
    request.subscribe({ error: () => undefined });
  }

  private showResult(res: any): void {
    const query = (this.form.value.query || '').trim();
    this.suggestedProducts = Array.isArray(res?.suggestions)
      ? res.suggestions
      : [];

    this.currentPage = Number(res?.page ?? 1);
    this.totalPages = Number(res?.total_pages ?? 1);
    this.totalItems = Number(res?.count ?? 0);
    this.didYouMean = res?.did_you_mean ?? null;

    const keepOpen = query.length >= 2;
    this.hasSuggestions = keepOpen;
    this.classSearchSuggestionsOpen = keepOpen;

    if (keepOpen) {
      this.saveRecentSearch(query);
      this.openSuggestion();
      this.prefetchNextPage(query, this.currentPage, this.totalPages);
    } else {
      this.closeSuggestion();
    }
  }

  matchesOpen(product: Partial<Product>): boolean {
    return this.expandedMatches.has(product.id);
  }

  toggleMatches(product: Partial<Product>, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const next = new Set(this.expandedMatches);
    if (product.id == null) {
      return;
    }
    if (next.has(product.id)) {
      next.delete(product.id);
    } else {
      next.add(product.id);
    }
    this.expandedMatches = next;
  }

  openSuggestedProduct(product: Partial<Product>): void {
    if (this.resultMode === 'ai') {
      this.aiSuggestions.mark(product);
    }
  }

  addToFavorites(product: Partial<Product>, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.favorites.add(product as Product).pipe(takeUntil(this.destroy$)).subscribe();
  }

  addToCompare(product: Partial<Product>, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.compare.add(product as Product).pipe(takeUntil(this.destroy$)).subscribe();
  }

  trackByProductId(index: number, product: Partial<Product>): number {
    return typeof product?.id === 'number' ? product.id : index;
  }

  suggestionLabel(value: string | null): string {
    if (!value) {
      return '';
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  applySuggestion(suggestion: string): void {
    this.form.get('query')?.setValue(suggestion);
    this.didYouMean = null;
  }

  private loadRecentSearches(): void {
    const saved = localStorage.getItem('recent_searches');
    this.recentSearches = saved ? JSON.parse(saved) : [];
  }

  private saveRecentSearch(query: string): void {
    if (!query || query.length < 1) return;
    this.recentSearches = [query, ...this.recentSearches.filter(s => s !== query)].slice(0, 5);
    localStorage.setItem('recent_searches', JSON.stringify(this.recentSearches));
  }

  private initExternalClickListeners(): void {
    this.zone.runOutsideAngular(() => {
      fromEvent(this.document, 'click').pipe(takeUntil(this.destroy$)).subscribe(event => {
        if (!(event.target as HTMLElement).closest('.search')) {
          this.zone.run(() => this.closeSuggestion());
        }
      });
    });
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    const query = (this.form.value.query || '').trim();
    if (query) {
      this.currentPage = 1;
      this.runSearch();
    }
  }

  openSuggestion(): void { this.classSearchSuggestionsOpen = true; }
  closeSuggestion(): void { this.classSearchSuggestionsOpen = false; }

  ngOnChanges(changes: SimpleChanges): void { }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
