import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';
import { SuggestionTrackingService } from '../../services/suggestion.service';

export interface ProductSuggestion {
  sku: string;
  name: string;
  identifier: string;
  short_desc: string;
  domain_id: string;
  type: string;
  path: string;
  steward_name: string;
  steward_email: string;
  contact_name: string;
  contact_email: string;
  classification: string;
  intended_use: string;
  image: string;
  is_active: boolean;
  adgroup: string;
  spi_id: string;
  product_affiliate: string;
  match_percentage: string;
  grade: string;
  color_class: string;
  slug: string;
  verified: boolean;
  view: string;
  checkout: string;
  badges: string[];
  reason: string;
  predicted_need: string;
  trend_score: string;
  available_columns?: string[];
  available_tables?: string[];
  selected_tables?: string[];
  manual_verified?: boolean;
  nlg_explanation?: {
    confidence: string;
  };
  peer_usage_count?: number;
  business_justification?: string;
  modifier?: string;
  detailed_explanation?: string;
}

export interface ProductResponse {
  product: {
    suggestions: ProductSuggestion[];
    input_grading: {
      dbGrade: string;
      tableGrade: string;
      descriptionGrade: string;
      justificationGrade: string;
    };
  };
}

@Component({
  selector: 'app-suggested-ai',
  templateUrl: './suggested-ai.component.html',
  styleUrls: ['./suggested-ai.component.scss'],
})
export class SuggestedAiComponent implements OnInit {
  @Input() selectedProduct: ProductSuggestion | null = null;
  @Input() suggestions: any[] = [];
  @Input() dataRequestDescription: string = '';
  @Input() businessJustification: string = '';
  @Output() closeModal = new EventEmitter<void>();
  
  // ADD: Input grading from API response
  inputGrading: any = {};
  
  // Mode control: 'hidden' | 'thinking' | 'results'
  mode: 'hidden' | 'thinking' | 'results' = 'hidden';
  
  // Legacy visibility flags (maintained for compatibility)
  visibleThinking: boolean = false;
  visibleSuggestions: boolean = false;
  fieldModalOpen: boolean = false;
  modalTab: 'tables' | 'fields' = 'fields';
  fieldSearch: string = '';
  tableSearch: string = '';
  fieldModalColumns: string[] = [];
  fieldModalTables: string[] = [];
  fieldModalSelectedTables: string[] = [];
  fieldModalProductName: string = '';
  verification_badge = '';
  confidence_level = '';
  business_summary = '';
  classification_class = '';
  classification = '';
  steward_initials = '';
  steward_name = '';
  benefit_1 = '';
  benefit_2 = '';
  benefit_3 = '';
  peer_usage_count: number | string = 0;

  constructor(
    private router: Router,
    private sanitizer: DomSanitizer,
    private suggestionTrackingService: SuggestionTrackingService
  ) { }

  ngOnInit() {}

  // ============================================================================
  // MODE CONTROL METHODS - ADD THESE
  // ============================================================================

  isThinking(): boolean {
    return this.mode === 'thinking';
  }

  isResults(): boolean {
    return this.mode === 'results';
  }

  isHidden(): boolean {
    return this.mode === 'hidden';
  }

  // Legacy open method (opens directly to results)
  open(): void {
    this.openResults();
  }

  // onClose(): void {
  //   this.mode = 'hidden';
  //   this.visibleThinking = false;
  //   this.visibleSuggestions = false;
  //   this.closeModal.emit();
  // }

  onClose(): void {
    this.closeFieldModal();
    this.mode = 'hidden';
    this.visibleThinking = false;
    this.visibleSuggestions = false;
    this.closeModal.emit();
  }

  // ============================================================================
  // NAVIGATION & PRODUCT HANDLING
  // ============================================================================

  onViewProduct(product: any) {
    const normalized = this.normalizeProduct(product);

    this.suggestionTrackingService.trackImpression(
      normalized.identifier,
      normalized.name || '',
      normalized.adgroup || ''
    ).subscribe({
      next: () => {
        this.router.navigate([`/products/${normalized.path}/${product.identifier}`]);
        this.onClose();
      },
      error: (err) => {
        console.error('Failed to track impression', err);
        this.router.navigate([`/products/${normalized.path}/${product.identifier}`]);
        this.onClose();
      }
    });
  }

  onRequestAccess(product: any) {
    const normalized = this.normalizeProduct(product);

    this.suggestionTrackingService.trackImpression(
      normalized.id,
      normalized.name || '',
      normalized.adgroup || ''
    ).subscribe({
      next: () => {
        this.router.navigate([normalized.checkout || `/checkout/${product.identifier}`]);
        this.onClose();
      },
      error: (err) => {
        console.error('Failed to track impression', err);
        this.router.navigate([normalized.checkout || `/checkout/${product.identifier}`]);
        this.onClose();
      }
    });
  }
  // Keep legacy methods for compatibility
  viewProduct(product: any) {
    this.onViewProduct(product);
  }

  requestAccess(product: any) {
    this.onRequestAccess(product);
  }

  // private slugify(text: string): string {
  //   return text.toString().toLowerCase().trim()
  //     .replace(/\s+/g, '-')
  //     .replace(/[^\w\-]+/g, '')
  //     .replace(/\-\-+/g, '-');
  // }

  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  }

  private normalizeProduct(p: any): any {
    const rawImage = p.images || p.image || p.product_image || p.image_url;
    let processedImages: string[] = ['assets/images/product-placeholder.png'];

    const cleanPath = (path: any): string => {
      if (typeof path === 'string') return path.replace('marketplace/products/', '');
      return path;
    };

    if (Array.isArray(rawImage) && rawImage.length > 0) {
      processedImages = rawImage.map(img => cleanPath(img));
    } else if (typeof rawImage === 'string' && rawImage.length > 0) {
      processedImages = [cleanPath(rawImage)];
    }

    let grade = p.grade || '';
    let modifier = p.modifier || '';
    
    if (grade && !modifier) {
      if (grade.includes('+')) {
        grade = grade.replace('+', '');
        modifier = '+';
      } else if (grade.includes('-')) {
        grade = grade.replace('-', '');
        modifier = '-';
      }
    }

    return {
      ...p,
      id: p.id || p.product_id || Math.floor(Math.random() * 10000),
      name: p.name || p.product_name,
      slug: p.slug || p.product_slug || this.slugify(p.name || p.product_name || ''),
      shortDesc: p.short_desc || 'No description provided.',
      images: processedImages,
      verified: !!p.verified,
      detailed_explanation: p.detailed_explanation || '',
      grade: grade,
      modifier: modifier
    };
  }

  // ============================================================================
  // GRADE SYSTEM
  // ============================================================================

  getGradeClass(grade: string, modifier: string = ''): string {
    if (!grade) return 'ai-grade-f';
    
    const g = grade.toLowerCase().trim();
    const m = modifier ? modifier.trim() : '';
    
    let suffix = '';
    if (m === '+') {
      suffix = '-plus';
    } else if (m === '-') {
      suffix = '-minus';
    }
    
    return `ai-grade-${g}${suffix}`;
  }

  getDisplayGrade(grade: string, modifier: string = ''): string {
    if (!grade) return 'N/A';
    return modifier ? `${grade}${modifier}` : grade;
  }

  getGradeColor(grade: string, modifier: string = ''): string {
    const className = this.getGradeClass(grade, modifier);
    
    const colorMap: { [key: string]: string } = {
      'ai-grade-a-plus': '#34c38f',
      'ai-grade-a': '#58d2a6',
      'ai-grade-a-minus': '#80ddbb',
      'ai-grade-b-plus': '#50a5f1',
      'ai-grade-b': '#7fbdf5',
      'ai-grade-b-minus': '#aed5f9',
      'ai-grade-c-plus': '#f1b44c',
      'ai-grade-c': '#f3be64',
      'ai-grade-c-minus': '#f7d293',
      'ai-grade-d-plus': '#f1734f',
      'ai-grade-d': '#f38667',
      'ai-grade-d-minus': '#f7ac96',
      'ai-grade-f': '#f03b3b'
    };
    
    return colorMap[className] || '#6c757d';
  }

  getCardBorderClass(grade: string): string {
    if (!grade) return 'border-secondary';
    
    const g = grade.toLowerCase().trim();
    
    switch(g) {
      case 'a': return 'border-success';
      case 'b': return 'border-info';
      case 'c': return 'border-warning';
      case 'd':
      case 'f': return 'border-danger';
      default: return 'border-secondary';
    }
  }

  isAPlusGrade(grade: string, modifier: string): boolean {
    return grade?.toLowerCase() === 'a' && modifier === '+';
  }

  getSafeMatchPercentage(product: any): number | string {
    const val = product?.match_percentage;
    
    if (!val || val === 'NaN' || val === 'nan' || Number.isNaN(val)) {
      return '0.0';
    }
    
    const num = parseFloat(val);
    if (isNaN(num)) {
      return '0.0';
    }
    
    return num.toFixed(1);
  }

  safeMatchWhole(product: any): number | string {
    return Math.floor(Number(this.getSafeMatchPercentage(product)));
  }

  // ============================================================================
  // BADGE CLASSIFICATION
  // ============================================================================

  getBadgeClass(badge: string): string {
    if (!badge || typeof badge !== 'string') return '';
    const b = badge.toLowerCase().trim();
    if (b.includes('verified') || b.includes('certified')) return 'badge-certified';
    if (b.includes('confidential') || b.includes('private')) return 'badge-confidential';
    if (b.includes('trending') || b.includes('popular')) return 'badge-trending';
    return '';
  }

  getSafeExplanation(product: any): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(product?.detailed_explanation || '');
  }

  // In suggested-ai.component.ts
  openThinking(): void {
    console.log("SuggestedAiComponent: openThinking() called");
    this.mode = 'thinking';
    this.visibleThinking = true;
    this.visibleSuggestions = true;
  }

  openResults(): void {
    console.log("SuggestedAiComponent: openResults() called");
    this.mode = 'results';
    this.visibleThinking = false;
    this.visibleSuggestions = true;
    this.applyRecommendation(this.suggestions?.[0]);
  }

  private applyRecommendation(product: any): void {
    if (!product) {
      return;
    }
    const name = String(product.steward_name || '').trim();
    this.verification_badge = product.verified || product.manual_verified ? 'Verified match' : 'Suggested match';
    this.confidence_level = product.nlg_explanation?.confidence || `${product.grade || ''}${product.modifier || ''}`;
    this.business_summary = product.business_justification || product.reason || '';
    this.classification = product.classification || '';
    this.classification_class = this.classification.toLowerCase().includes('confidential') ? 'badge-confidential' : 'badge-certified';
    this.steward_name = name || 'Not Assigned';
    this.steward_initials = name && name !== 'Not Assigned'
      ? name.split(/\s+/).slice(0, 2).map((part: string) => part.charAt(0).toUpperCase()).join('')
      : 'NA';
    this.benefit_1 = 'Matches the requested database and tables';
    this.benefit_2 = 'Uses the product classification and steward record';
    this.benefit_3 = 'Can be requested from this suggestion';
    this.peer_usage_count = product.peer_usage_count || 0;
  }

  get filteredFieldModalColumns(): string[] {
    const search =
      this.fieldSearch
        .trim()
        .toLowerCase();

    if (!search) {
      return this.fieldModalColumns;
    }

    return this.fieldModalColumns.filter(
      column =>
        String(column)
          .toLowerCase()
          .includes(search)
    );
  }

  get filteredFieldModalTables(): string[] {
    const search = this.tableSearch.trim().toLowerCase();
    if (!search) {
      return this.fieldModalTables;
    }
    return this.fieldModalTables.filter(table => String(table).toLowerCase().includes(search)
    );
  }

  get allVerifiedProducts(): boolean {
    return this.suggestions.length > 0 && this.suggestions.every(product => 
      product.manual_verified || (product.verified && this.isAPlusGrade(product.grade, product.modifier))
    );
  }

  onReasonClick(event: MouseEvent, product: ProductSuggestion): void {
    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }

    const tableOverflow = target.closest('.table-overflow');
    const columnOverflow = target.closest('.column-overflow');

    if (!tableOverflow && !columnOverflow) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const initialTab: 'tables' | 'fields' = tableOverflow ? 'tables' : 'fields';

    this.openFieldModal(product, initialTab);
  }

  openFieldModal(product: ProductSuggestion, initialTab: 'tables' | 'fields' = 'fields'): void {
    this.fieldModalProductName = product?.name || '';
    this.fieldModalColumns = Array.isArray(product?.available_columns) ? [...product.available_columns] : [];
    this.fieldModalTables = Array.isArray(product?.available_tables) ? [...product.available_tables] : [];
    this.fieldModalSelectedTables = Array.isArray(product?.selected_tables) ? [...product.selected_tables] : [];
    this.fieldSearch = '';
    this.tableSearch = '';
    this.modalTab = initialTab;
    this.fieldModalOpen = true;
  }

  closeFieldModal(): void {
    this.fieldModalOpen = false;
    this.fieldSearch = '';
    this.tableSearch = '';
    this.fieldModalColumns = [];
    this.fieldModalTables = [];
    this.fieldModalSelectedTables = [];
    this.fieldModalProductName = '';
    this.modalTab = 'fields';
  }

  setModalTab(tab: 'tables' | 'fields'): void {
    this.modalTab = tab;
  }
}