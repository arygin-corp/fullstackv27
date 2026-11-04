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
import { fromEvent, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { Product } from '../../interfaces/product';
import { RootService } from '../../services/root.service';
import { ShopService } from '../../api/shop.service';
import { CartService } from '../../services/cart.service';
import { ProductSuggestionService, SuggestionResult, NormalizedProduct } from '../../api/product-suggestion.service';

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
    private suggestionService: ProductSuggestionService,
    public root: RootService,
  ) { }

  ngOnInit(): void {
    this.loadRecentSearches();
    this.initForm();
    this.initExternalClickListeners();
  }

  private initForm(): void {
    this.form = this.fb.group({
      query: ['']
    });

    this.form.get('query')?.valueChanges.pipe(
      map(value => (value || '').trim()),
      debounceTime(150),
      distinctUntilChanged(),

      tap(() => {
        this.currentPage = 1;
        this.isLoading = true;
      }),

      switchMap(query => {
        if (!query) {
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
          tap(response => {
            console.log(
              'RAW SEARCH RESPONSE:',
              response
            );
          }),

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
        this.handleResults(response);
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
    this.runSearch();
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
      tap(response => {
        console.log(
          'SEARCH PAGE RESPONSE:',
          response
        );
      }),

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

    console.log('BACKEND RESPONSE:', res);

    // Exact backend contract
    this.suggestedProducts = Array.isArray(res?.suggestions)
      ? res.suggestions
      : [];

    this.currentPage = Number(res?.page ?? 1);
    this.totalPages = Number(res?.total_pages ?? 1);
    this.totalItems = Number(res?.count ?? 0);

    this.didYouMean = res?.did_you_mean ?? null;

    this.hasSuggestions =
      this.suggestedProducts.length > 0 ||
      !!this.didYouMean;

    this.classSearchSuggestionsOpen =
      this.hasSuggestions;

    if (this.hasSuggestions) {
      this.saveRecentSearch(
        this.form.value.query || ''
      );

      this.openSuggestion();
    } else {
      this.closeSuggestion();
    }

    console.log('=== SEARCH DEBUG ===');
    console.log('suggestions:', this.suggestedProducts);
    console.log('length:', this.suggestedProducts.length);
    console.log('hasSuggestions:', this.hasSuggestions);
    console.log('classSearchSuggestionsOpen:', this.classSearchSuggestionsOpen);
    console.log('host:', this.elementRef.nativeElement);
  }

  trackByProductId(index: number, product: Partial<Product>): number {
    return typeof product?.id === 'number' ? product.id : index;
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

  openSuggestion(): void { this.classSearchSuggestionsOpen = true; }
  closeSuggestion(): void { this.classSearchSuggestionsOpen = false; }

  ngOnChanges(changes: SimpleChanges): void { }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
