import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { FeatureWalkthroughService } from './feature-walkthrough.service';

interface Hotspot {
  id: string;
  label: string;
  text: string;
  x: number;
  y: number;
  stepId?: string;
}

interface WalkthroughStep {
  id: string;
  title: string;
  summary: string;
  link: string;
  linkLabel: string;
  image: string;
  chromeLayout?: 'wide' | 'tall' | 'none';
  hotspots: Hotspot[];
}

@Component({
  selector: 'app-feature-walkthrough',
  templateUrl: './feature-walkthrough.component.html',
  styleUrls: ['./feature-walkthrough.component.scss']
})
export class FeatureWalkthroughComponent implements OnInit, OnDestroy {
  open = false;
  index = 0;
  activeId = '';
  private subscription = new Subscription();
  private homeTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly homepageSeenKey = 'gdx-walkthrough-homepage-at';
  private readonly homepageCooldownMs = 20 * 60 * 60 * 1000;

  readonly chromeTall: Hotspot[] = [
    { id: 'chrome-newsroom', label: 'Newsroom', text: 'Newsroom is in the top bar.', x: 62.6, y: 3.4, stepId: 'newsroom' },
    { id: 'chrome-track', label: 'Track Request', text: 'Look up a request from the top bar.', x: 73.4, y: 3.4, stepId: 'track' },
    { id: 'chrome-changelog', label: 'Changelog', text: 'Release notes live in the changelog.', x: 80.4, y: 3.4, stepId: 'changelog' },
    { id: 'chrome-hackathon', label: '2026 Hackathon', text: 'The hackathon page is in the main menu.', x: 17.2, y: 16.4, stepId: 'hackathon' },
    { id: 'chrome-roadmap', label: 'Roadmap', text: 'The product roadmap is in the main menu.', x: 24.5, y: 16.4, stepId: 'roadmap' },
    { id: 'chrome-campaigns', label: 'Campaigns', text: 'Campaigns highlights products and the main actions.', x: 73.6, y: 16.4, stepId: 'campaigns' },
    { id: 'chrome-compare', label: 'Compare', text: 'The scale icon opens compare. You can compare up to 5 products.', x: 83.7, y: 11.3, stepId: 'compare' },
    { id: 'chrome-favorites', label: 'Favorites', text: 'The heart icon opens favorites for this browser session.', x: 87.5, y: 11.3, stepId: 'favorites' },
    { id: 'chrome-cart', label: 'Cart', text: 'The cart can check out several catalog products together.', x: 91.5, y: 11.3, stepId: 'checkout' },
    { id: 'chrome-ask', label: 'Ask VIKKI', text: 'Ask VIKKI opens the marketplace assistant.', x: 90.8, y: 93, stepId: 'ask' }
  ];

  readonly chromeWide: Hotspot[] = [
    { id: 'chrome-newsroom', label: 'Newsroom', text: 'Newsroom is in the top bar.', x: 66.8, y: 2.4, stepId: 'newsroom' },
    { id: 'chrome-track', label: 'Track Request', text: 'Look up a request from the top bar.', x: 77.3, y: 2.4, stepId: 'track' },
    { id: 'chrome-changelog', label: 'Changelog', text: 'Release notes live in the changelog.', x: 90.8, y: 2.4, stepId: 'changelog' },
    { id: 'chrome-hackathon', label: '2026 Hackathon', text: 'The hackathon page is in the main menu.', x: 10.6, y: 18.1, stepId: 'hackathon' },
    { id: 'chrome-roadmap', label: 'Roadmap', text: 'The product roadmap is in the main menu.', x: 18, y: 18.1, stepId: 'roadmap' },
    { id: 'chrome-campaigns', label: 'Campaigns', text: 'Campaigns highlights products and the main actions.', x: 81.1, y: 18.1, stepId: 'campaigns' },
    { id: 'chrome-compare', label: 'Compare', text: 'The scale icon opens compare. You can compare up to 5 products.', x: 91.4, y: 8.7, stepId: 'compare' },
    { id: 'chrome-favorites', label: 'Favorites', text: 'The heart icon opens favorites for this browser session.', x: 94.4, y: 8.7, stepId: 'favorites' },
    { id: 'chrome-cart', label: 'Cart', text: 'The cart can check out several catalog products together.', x: 97.5, y: 8.7, stepId: 'checkout' },
    { id: 'chrome-ask', label: 'Ask VIKKI', text: 'Ask VIKKI opens the marketplace assistant.', x: 92.5, y: 94, stepId: 'ask' }
  ];

  readonly steps: WalkthroughStep[] = [
    {
      id: 'domains',
      title: 'Domains',
      summary: 'The domains page only shows domains that have products, and each card takes you to the right next page.',
      link: '/',
      linkLabel: 'Open domains',
      image: 'assets/images/walkthrough/walkthrough-domains.jpg',
      chromeLayout: 'tall',
      hotspots: [
        { id: 'domains-vehicle', label: 'Vehicle', text: 'A domain with several products opens the marketplace filtered to that domain.', x: 12.4, y: 42 },
        { id: 'domains-customer', label: 'Customer', text: 'One product opens that product page. A domain with subdomain cards shows those cards first.', x: 62.2, y: 42 },
        { id: 'domains-quality', label: 'Quality', text: 'A domain with no products stays hidden until a product is available.', x: 87.4, y: 74 }
      ]
    },
    {
      id: 'marketplace',
      title: 'Marketplace',
      summary: 'Product cards and filters are easier to scan when you are looking for the right data product.',
      link: '/marketplace',
      linkLabel: 'Open the marketplace',
      image: 'assets/images/walkthrough/walkthrough-marketplace.jpg',
      hotspots: [
        { id: 'market-filters', label: 'Filters', text: 'Each filter lists the options with the most products first.', x: 7, y: 29 },
        { id: 'market-reset', label: 'Reset', text: 'Reset clears the filters and returns the address to /marketplace.', x: 16, y: 29 },
        { id: 'market-results', label: 'Results', text: 'Cards show the short description, with HTML tags removed. Paging keeps a domain filter.', x: 32, y: 55 }
      ]
    },
    {
      id: 'ai-search',
      title: 'AI Suggested Products',
      summary: 'A question or phrase is ranked by meaning. A name search tags the database, table, column, or ad group that matched.',
      link: '/marketplace',
      linkLabel: 'Open the marketplace',
      image: 'assets/images/walkthrough/walkthrough-ai-search.jpg',
      hotspots: [
        { id: 'ai-tab', label: 'AI Suggested Products', text: 'This tab is for questions, phrases, and names. User-Based stays the literal word search.', x: 28.5, y: 16.5 },
        { id: 'ai-matches', label: 'View matches', text: 'View matches opens the ad group, database, table, and column names that matched the product.', x: 83, y: 30 },
        { id: 'ai-pill', label: 'AI Suggested', text: 'View Details carries the AI Suggested pill onto the product page.', x: 80.5, y: 22 }
      ]
    },
    {
      id: 'compare',
      title: 'Compare',
      summary: 'Compare keeps a short list of products side by side so you can choose the right one.',
      link: '/marketplace/user/compare',
      linkLabel: 'Open compare',
      image: 'assets/images/walkthrough/walkthrough-compare.jpg',
      chromeLayout: 'none',
      hotspots: [
        { id: 'compare-list', label: 'Compare list', text: 'Open this page to review the products you added with the scale icon.', x: 50, y: 28 },
        { id: 'compare-browse', label: 'Browse products', text: 'You can compare up to 5 products.', x: 22, y: 9 }
      ]
    },
    {
      id: 'favorites',
      title: 'Favorites',
      summary: 'Favorites is your saved list of products you want to come back to.',
      link: '/marketplace/user/favorites',
      linkLabel: 'Open favorites',
      image: 'assets/images/walkthrough/walkthrough-favorites.jpg',
      chromeLayout: 'none',
      hotspots: [
        { id: 'favorites-list', label: 'Saved products', text: 'The list stays in this browser session. The heart counter shows how many you have saved.', x: 42, y: 48 }
      ]
    },
    {
      id: 'checkout',
      title: 'Multiple product checkout',
      summary: 'Add more than one catalog product to the cart and check them out together.',
      link: '/marketplace/order/cart',
      linkLabel: 'Open the cart',
      image: 'assets/images/walkthrough/walkthrough-checkout.png',
      hotspots: [
        { id: 'cart-title', label: 'Cart', text: 'The cart lists each catalog product, its datatype, classification, steward, and contact.', x: 16, y: 38 },
        { id: 'cart-body', label: 'Checkout together', text: 'Several catalog products can go through checkout in one cart. Proceed to checkout sends them together.', x: 93, y: 78 }
      ]
    },
    {
      id: 'dropcart',
      title: 'Shopping cart',
      summary: 'The cart icon opens the products you added without leaving the page you are on.',
      link: '/marketplace/order/cart',
      linkLabel: 'Open the cart',
      image: 'assets/images/walkthrough/walkthrough-dropcart.jpg',
      chromeLayout: 'none',
      hotspots: [
        { id: 'dropcart-items', label: 'Added products', text: 'Each line shows the product and the quantity in this cart.', x: 84, y: 18 },
        { id: 'dropcart-checkout', label: 'Checkout', text: 'Checkout opens the cart checkout. View Cart opens the full cart page.', x: 92, y: 87 }
      ]
    },
    {
      id: 'saved-cart',
      title: 'Saved cart',
      summary: 'A saved cart stays available until the date in the notice, then it is deleted.',
      link: '/marketplace/order/cart',
      linkLabel: 'Open the cart',
      image: 'assets/images/walkthrough/walkthrough-saved-cart.png',
      hotspots: [
        { id: 'saved-retrieve', label: 'Retrieve Your Cart', text: 'Retrieve Your Cart brings the saved products back into the cart.', x: 11, y: 31 },
        { id: 'saved-notice', label: 'Saved until', text: 'The notice names you and the date this cart is saved until. After that date the cart is deleted.', x: 12, y: 83 }
      ]
    },
    {
      id: 'track',
      title: 'Track Request',
      summary: 'Look up a request you already submitted without leaving the marketplace.',
      link: '/marketplace/order/track-request',
      linkLabel: 'Track a request',
      image: 'assets/images/walkthrough/walkthrough-track.png',
      hotspots: [
        { id: 'track-number', label: 'Request number', text: 'Enter a request number or an RITM number. Use one number.', x: 12, y: 42 },
        { id: 'track-email', label: 'Signed-in email', text: 'The lookup uses the account you are signed in with.', x: 12, y: 66 },
        { id: 'track-button', label: 'Track', text: 'Track Request is also in the top bar.', x: 12, y: 76 }
      ]
    },
    {
      id: 'resources',
      title: 'Resource library',
      summary: 'The resource library collects the reference material for the marketplace in one place.',
      link: '/resources',
      linkLabel: 'Open the resource library',
      image: 'assets/images/walkthrough/walkthrough-resources.jpg',
      hotspots: [
        { id: 'resources-nav', label: 'Library sections', text: 'Browse brands, documents, policies, processes, media, and the mind map.', x: 8, y: 46 },
        { id: 'resources-mind', label: 'Mind Map', text: 'The interactive mind map lives in this library.', x: 6.5, y: 59.4 },
        { id: 'resources-intro', label: 'Resource Library', text: 'Open a section from the library navigation when you need the source material.', x: 50, y: 64 }
      ]
    },
    {
      id: 'library-brands',
      title: 'Brand images',
      summary: 'The brands section holds the marketplace and OneTech logos for light and dark backgrounds.',
      link: '/resources/brands',
      linkLabel: 'Open brands',
      image: 'assets/images/walkthrough/walkthrough-brands.png',
      hotspots: [
        { id: 'brands-nav', label: 'Brands', text: 'Brands is in the library navigation.', x: 7, y: 42 },
        { id: 'brands-logo', label: 'Download', text: 'Each logo shows its intended background and a download.', x: 22, y: 57 }
      ]
    },
    {
      id: 'library-documents',
      title: 'Documents',
      summary: 'Documents are the guides and notes stored in the resource library.',
      link: '/resources/docs',
      linkLabel: 'Open documents',
      image: 'assets/images/walkthrough/walkthrough-documents.png',
      hotspots: [
        { id: 'docs-nav', label: 'Documents', text: 'Documents is in the library navigation.', x: 7, y: 46 },
        { id: 'docs-card', label: 'Guide', text: 'Each card shows the classification, size, and file format, with View and Download.', x: 29, y: 50 }
      ]
    },
    {
      id: 'library-policies',
      title: 'Policies',
      summary: 'Policies in the library open from the card. These are web pages rather than file downloads.',
      link: '/resources/policies',
      linkLabel: 'Open policies',
      image: 'assets/images/walkthrough/walkthrough-policies.png',
      hotspots: [
        { id: 'policies-nav', label: 'Policies', text: 'Policies is in the library navigation.', x: 7, y: 50 },
        { id: 'policies-card', label: 'Policy', text: 'A policy card shows the classification and a View link.', x: 29, y: 48 }
      ]
    },
    {
      id: 'library-processes',
      title: 'Processes',
      summary: 'Process documents cover data quality, data security, and metadata.',
      link: '/resources/processes',
      linkLabel: 'Open processes',
      image: 'assets/images/walkthrough/walkthrough-processes.png',
      hotspots: [
        { id: 'processes-nav', label: 'Processes', text: 'Processes is in the library navigation.', x: 7, y: 54 },
        { id: 'processes-card', label: 'Process', text: 'Each process shows the file format and offers View and Download.', x: 32, y: 48 }
      ]
    },
    {
      id: 'library-media',
      title: 'Media',
      summary: 'Media holds the video files in the resource library.',
      link: '/resources/media',
      linkLabel: 'Open media',
      image: 'assets/images/walkthrough/walkthrough-media.png',
      hotspots: [
        { id: 'media-nav', label: 'Media', text: 'Media is in the library navigation.', x: 7, y: 58 },
        { id: 'media-video', label: 'Video', text: 'Each video shows its size, format, and date, with a download.', x: 30, y: 48 }
      ]
    },
    {
      id: 'newsroom',
      title: 'Newsroom',
      summary: 'Newsroom is where marketplace stories and updates are published.',
      link: '/newsroom',
      linkLabel: 'Open the newsroom',
      image: 'assets/images/walkthrough/walkthrough-newsroom.jpg',
      hotspots: [
        { id: 'news-tabs', label: 'Sections', text: 'Newsroom is in the top bar. Switch between newsroom, updates, features, trending, and security.', x: 78, y: 24 },
        { id: 'news-card', label: 'Story card', text: 'Each card shows the title, summary, author, and date. Open a card to read the full post.', x: 16, y: 48 }
      ]
    },
    {
      id: 'campaigns',
      title: 'Campaigns',
      summary: 'Campaigns highlights products and the main actions you can take in the marketplace.',
      link: '/pages/ads',
      linkLabel: 'Open campaigns',
      image: 'assets/images/walkthrough/walkthrough-campaigns.jpg',
      hotspots: [
        { id: 'campaign-hero', label: 'Campaign hero', text: 'The hero rotates campaign slides.', x: 50, y: 40 },
        { id: 'campaign-actions', label: 'Actions', text: 'The page points you to request access, browse domains, compare products, and track requests.', x: 55, y: 70 },
        { id: 'campaign-row', label: 'Most requested', text: 'Rows show most requested, new, and featured products.', x: 22, y: 92 }
      ]
    },
    {
      id: 'dar',
      title: 'Data Access Request',
      summary: 'A TBDP production request can suggest products after you choose the database and tables.',
      link: '/form/data-access-request',
      linkLabel: 'Open Data Access Request',
      image: 'assets/images/walkthrough/walkthrough-dar.jpg',
      chromeLayout: 'tall',
      hotspots: [
        { id: 'dar-checklist', label: 'Required information', text: 'The checklist stays with the form while you complete the request.', x: 8, y: 52 },
        { id: 'dar-platform', label: 'Platform', text: 'Database and table fields keep a visible border and a floating label.', x: 55, y: 46 },
        { id: 'dar-domain', label: 'Data domain', text: 'Choosing a database and a table opens Suggested AI. Verified matches use the AI Verified card.', x: 55, y: 64 }
      ]
    },
    {
      id: 'ask',
      title: 'Ask AI',
      summary: 'The chat knows who is signed in and answers from the marketplace catalog.',
      link: '/',
      linkLabel: 'Go home and open Ask AI',
      image: 'assets/images/walkthrough/walkthrough-ask-ai.jpg',
      hotspots: [
        { id: 'ask-panel', label: 'VIKKI', text: 'Open it with the Ask AI button. Greetings use your first name and the time of day on your device.', x: 82, y: 42 },
        { id: 'ask-end', label: 'End AI Session', text: 'End AI Session closes the chat and clears that conversation.', x: 93.5, y: 29 },
        { id: 'ask-close', label: 'Close', text: 'The X only hides the panel. Recommended products appear as cards you can open.', x: 97.5, y: 29 }
      ]
    },
    {
      id: 'mind-map',
      title: 'Interactive mind map',
      summary: 'On November 7, 2026, the security domains diagram became a map you can open and search.',
      link: '/resources/mind-map',
      linkLabel: 'Open the mind map',
      image: 'assets/images/walkthrough/walkthrough-mind-map.png',
      chromeLayout: 'none',
      hotspots: [
        { id: 'map-search', label: 'Search', text: 'Search keeps the matching branch open. The page reads the latest mind map file each visit.', x: 76, y: 18 },
        { id: 'map-pillar', label: 'Pillar', text: 'Blue pillars, green domains, and red topics expand to the tbdp groups.', x: 12, y: 62 },
        { id: 'map-center', label: 'Security Domains', text: 'Security Domains sits in the center.', x: 48, y: 82 }
      ]
    },
    {
      id: 'roadmap',
      title: 'Product roadmap',
      summary: 'The roadmap groups marketplace milestones by fiscal quarter. April 1 starts the year.',
      link: '/pages/roadmap',
      linkLabel: 'Open the roadmap',
      image: 'assets/images/walkthrough/walkthrough-roadmap.png',
      hotspots: [
        { id: 'roadmap-year', label: 'Fiscal year', text: 'The fiscal year runs April 1 through March 31.', x: 72, y: 39 },
        { id: 'roadmap-quarter', label: 'Quarter', text: 'Each column is a quarter. A month card shows the milestone, or that nothing is planned.', x: 18, y: 55 }
      ]
    },
    {
      id: 'hackathon',
      title: 'Hackathon',
      summary: 'The hackathon page keeps the video hero and follows the current year.',
      link: '/pages/hackathon',
      linkLabel: 'Open the hackathon page',
      image: 'assets/images/walkthrough/walkthrough-hackathon.jpg',
      chromeLayout: 'tall',
      hotspots: [
        { id: 'hack-title', label: 'This year', text: 'The year in the title updates with the calendar.', x: 22, y: 40 },
        { id: 'hack-register', label: 'Register', text: 'The SWARM story, videos, and links sit below the hero. Those links open in a new tab.', x: 16, y: 62 }
      ]
    },
    {
      id: 'changelog',
      title: 'Changelog',
      summary: 'After this walkthrough, the changelog is the place to read each release in full.',
      link: '/site/changelog',
      linkLabel: 'Open the changelog',
      image: 'assets/images/walkthrough/walkthrough-changelog.jpg',
      chromeLayout: 'tall',
      hotspots: [
        { id: 'log-versions', label: 'Versions', text: 'Releases are listed by version and date.', x: 16, y: 48 },
        { id: 'log-notes', label: 'Release notes', text: 'Each release groups new work, updates, and fixes.', x: 46, y: 42 }
      ]
    }
  ];

  constructor(
    private tour: FeatureWalkthroughService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscription.add(this.tour.open$.subscribe(open => {
      this.open = open;
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) {
        this.activeId = this.step.hotspots[0]?.id || '';
      }
    }));
    this.subscription.add(this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(event => this.onNavigate(event.urlAfterRedirects)));
    this.onNavigate(this.router.url);
  }

  ngOnDestroy(): void {
    this.clearHomeTimer();
    document.body.style.overflow = '';
    this.subscription.unsubscribe();
  }

  private onNavigate(url: string): void {
    const path = url.split('?')[0].split('#')[0];
    this.clearHomeTimer();
    if (path === '/pages/whats-new') {
      this.tour.open();
      this.router.navigateByUrl('/', { replaceUrl: true });
      return;
    }
    if ((path === '/' || path === '') && this.homepageReady()) {
      this.homeTimer = setTimeout(() => {
        this.homeTimer = null;
        if (!this.homepageReady()) {
          return;
        }
        if (!this.open) {
          this.index = 0;
          this.activeId = this.steps[0]?.hotspots[0]?.id || '';
        }
        this.rememberHomepage();
        this.tour.open();
      }, 3000);
    }
  }

  private homepageReady(): boolean {
    try {
      const seen = Number(localStorage.getItem(this.homepageSeenKey));
      if (!seen) {
        return true;
      }
      return Date.now() - seen >= this.homepageCooldownMs;
    } catch {
      return true;
    }
  }

  private rememberHomepage(): void {
    try {
      localStorage.setItem(this.homepageSeenKey, String(Date.now()));
    } catch {
      return;
    }
  }

  private clearHomeTimer(): void {
    if (this.homeTimer) {
      clearTimeout(this.homeTimer);
      this.homeTimer = null;
    }
  }

  get step(): WalkthroughStep {
    return this.steps[this.index];
  }

  get spots(): Hotspot[] {
    const layout = this.step.chromeLayout || 'wide';
    const chrome = layout === 'none' ? [] : layout === 'tall' ? this.chromeTall : this.chromeWide;
    return [...chrome, ...this.step.hotspots];
  }

  get active(): Hotspot | undefined {
    return this.spots.find(spot => spot.id === this.activeId) || this.step.hotspots[0];
  }

  get progress(): number {
    return Math.round(((this.index + 1) / this.steps.length) * 100);
  }

  select(spot: Hotspot): void {
    if (spot.stepId && spot.stepId !== this.step.id) {
      const nextIndex = this.steps.findIndex(item => item.id === spot.stepId);
      if (nextIndex >= 0) {
        this.index = nextIndex;
        this.activeId = this.step.hotspots[0]?.id || spot.id;
        return;
      }
    }
    this.activeId = spot.id;
  }

  next(): void {
    if (this.index < this.steps.length - 1) {
      this.index += 1;
      this.activeId = this.step.hotspots[0]?.id || '';
    }
  }

  previous(): void {
    if (this.index > 0) {
      this.index -= 1;
      this.activeId = this.step.hotspots[0]?.id || '';
    }
  }

  go(index: number): void {
    if (index >= 0 && index < this.steps.length) {
      this.index = index;
      this.activeId = this.step.hotspots[0]?.id || '';
    }
  }

  close(): void {
    this.rememberHomepage();
    this.tour.close();
  }

  @HostListener('document:keydown', ['$event'])
  onKey(event: KeyboardEvent): void {
    if (!this.open) {
      return;
    }
    if (event.key === 'Escape') {
      this.close();
    } else if (event.key === 'ArrowRight') {
      this.next();
    } else if (event.key === 'ArrowLeft') {
      this.previous();
    }
  }
}

@Component({
  selector: 'app-open-feature-walkthrough',
  template: ''
})
export class OpenFeatureWalkthroughComponent implements OnInit {
  constructor(
    private tour: FeatureWalkthroughService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.tour.open();
    this.router.navigateByUrl('/', { replaceUrl: true });
  }
}
