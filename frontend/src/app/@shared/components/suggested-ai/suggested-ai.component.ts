import { Component, Input, OnInit } from '@angular/core';
import { CartService } from 'src/app/@shared/services/cart.service';
import { RootService } from 'src/app/@shared/services/root.service';
import { OffcanvasCartService } from 'src/app/@shared/services/offcanvas-cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-suggested-ai',
  templateUrl: './suggested-ai.component.html',
  styleUrls: ['./suggested-ai.component.scss']
})
export class SuggestedAiComponent implements OnInit {
  @Input() suggestions: any[] = [];
  @Input() isLoading: boolean = false;
  @Input() isAiThinking: boolean = false;
  @Input() dataRequestDescription: string = '';
  
  visible: boolean = false;

  constructor(
    private router: Router,
    private cartService: CartService,
    public root: RootService,
    private offcanvasCart: OffcanvasCartService
  ) { }

  ngOnInit(): void { }

  getBadgeClass(badge: any): string {
    if (!badge || typeof badge !== 'string') return '';
    
    const b = badge.toLowerCase().trim();
    
    if (b.includes('verified') || b.includes('certified')) return 'badge-certified';
    if (b.includes('confidential') || b.includes('private') || b.includes('restricted')) return 'badge-confidential';
    if (b.includes('trending') || b.includes('popular') || b.includes('best seller')) return 'badge-trending';
    
    return ''; // Default neutral style
  }

  // Adds to cart and opens Request Access sidebar
  requestAccess(product: any) {
    const normalized = this.normalizeProduct(product);
    const slug = this.slugify(normalized.name);
    
    // 1. Route to the product URL first
    this.router.navigate([`marketplace/products/${slug}`]).then(() => {
      
      // 2. Add the normalized product to the cart
      this.cartService.add(normalized, 1).subscribe(() => {
        
        // 3. Close the discovery modal
        this.close();
        
        // 4. Open the offcanvas cart (after a short delay for the page transition)
        setTimeout(() => this.offcanvasCart.open(), 600);
      });
    });
  }

  viewProduct(product: any) {
    const normalized = this.normalizeProduct(product);
    const name = product.name || product.product_name || '';
    const slug = this.slugify(name);
    this.router.navigate([`marketplace/products/${slug}`]);
    this.close();
  }

  private slugify(text: string): string {
    return text.toString().toLowerCase().trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  }

  private normalizeProduct(p: any): any {
    let rawImage = p.images || p.image || p.product_image || p.image_url;
    let processedImages: string[] = ['assets/images/product-placeholder.png'];

    const cleanPath = (path: any): string => {
      if (typeof path === 'string') {
        // Removes "marketplace/products/" prefix if present
        return path.replace('marketplace/products/', '');
      }
      return path;
    };

    if (Array.isArray(rawImage) && rawImage.length > 0) {
      processedImages = rawImage.map(img => cleanPath(img));
    } else if (typeof rawImage === 'string' && rawImage.length > 0) {
      processedImages = [cleanPath(rawImage)];
    }

    return {
      ...p,
      id: p.id || p.product_id || Math.floor(Math.random() * 10000),
      name: p.name || p.product_name,
      slug: p.slug || p.product_slug || this.slugify(p.name || p.product_name || ''),
      shortDesc: p.shortDesc || p.summary || p.short_desc || 'No description provided.',
      images: processedImages 
    };
  }

  open() {
    this.visible = true;
    document.body.classList.add('modal-open');
  }

  close() {
    this.visible = false;
    document.body.classList.remove('modal-open');
  }
}