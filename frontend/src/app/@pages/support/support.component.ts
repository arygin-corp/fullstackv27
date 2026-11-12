import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { presentArticle } from './support-media';
import { KB_ARTICLES, KB_CATEGORIES, KbArticle, KbCategory } from './support-knowledge';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss']
})
export class SupportComponent implements AfterViewInit, OnDestroy {
  readonly orbitFaces = [2, 3, 4, 5, 6, 7, 8, 9, 10].map(index => `assets/images/support/avatars/${index}.png`);
  readonly categories = KB_CATEGORIES;
  readonly articles = KB_ARTICLES.map(presentArticle);
  query = '';
  category = '';
  closing = false;
  docked = false;
  topicsCollapsed = false;
  page = 1;
  readonly pageSize = 9;
  heroAskIndex: number | null = null;
  shownAskIndex: number | null = null;
  askShown = false;
  answerMounted = false;
  answerShown = false;
  chatPaused = false;
  heroQuestion = '';
  heroAnswer = '';
  private collapseTimer = 0;
  private leavingTopic = '';
  private heroChatTimer = 0;
  private heroChatReady = false;
  private lastChat = -1;
  private readonly heroChats = [
    { question: 'What is the Data Marketplace?', answer: 'Where you find data products and request access.' },
    { question: 'How do I search?', answer: 'Use the header search. Two characters starts results.' },
    { question: 'What if nothing is found?', answer: 'Try another name, then use Data Access Request.' },
    { question: 'How do I request access?', answer: 'Open the product, choose Request Access, then check out.' },
    { question: 'What is Add New Product?', answer: 'It asks to list a product. It does not grant access.' },
    { question: 'Who can sign in?', answer: 'Sign in with your Toyota Microsoft account.' },
    { question: 'How do I track a request?', answer: 'Track Request looks up one number. Order History lists yours.' },
    { question: 'Why is checkout unavailable?', answer: 'The cart tells you which fields are still missing.' },
    { question: 'Can I request several products?', answer: 'Yes, when each request is complete and the cart has no Data Access Request.' },
    { question: 'How do I compare products?', answer: 'Use the scale icon. Compare holds up to five.' },
    { question: 'What does the heart do?', answer: 'It saves that product to Favorites.' },
    { question: 'How do I change the language?', answer: 'The header offers English, Spanish, French, and Japanese.' }
  ];

  @ViewChild('kbWrap') kbWrap?: ElementRef<HTMLElement>;
  @ViewChild('kbResults') kbResults?: ElementRef<HTMLElement>;
  @ViewChild('kbFaces') kbFaces?: ElementRef<HTMLElement>;
  private pinning = false;

  scrollLockReady = false;

  constructor(private zone: NgZone, private changeDetector: ChangeDetectorRef) {
    this.bindScrollLock();
  }

  ngAfterViewInit(): void {
    this.bindScrollLock();
    this.beginHeroChat();
  }

  private bindScrollLock(): void {
    if (this.scrollLockReady) {
      return;
    }
    this.scrollLockReady = true;
    this.zone.runOutsideAngular(() => {
      window.addEventListener('wheel', this.onWheel, { passive: false });
      document.body.addEventListener('scroll', this.onWindowScroll, { passive: true });
      window.addEventListener('scroll', this.onWindowScroll, { passive: true });
    });
  }

  private beginHeroChat(): void {
    if (this.heroChatReady) {
      return;
    }
    this.heroChatReady = true;
    window.addEventListener('resize', this.onChatResize);
    this.askNext();
  }

  private onChatResize = (): void => {
    this.placeBubbles();
  };

  private askNext(): void {
    const faceCount = 9;
    let face = Math.floor(Math.random() * faceCount);
    if (face === this.heroAskIndex) {
      face = (face + 1) % faceCount;
    }
    let pair = Math.floor(Math.random() * this.heroChats.length);
    if (pair === this.lastChat) {
      pair = (pair + 1) % this.heroChats.length;
    }
    this.lastChat = pair;
    this.heroAskIndex = face;
    this.shownAskIndex = face;
    this.heroQuestion = this.heroChats[pair].question;
    this.heroAnswer = this.heroChats[pair].answer;
    this.askShown = false;
    this.answerMounted = false;
    this.answerShown = false;
    this.chatPaused = true;
    this.changeDetector.detectChanges();
    requestAnimationFrame(() => {
      this.placeBubbles();
      this.askShown = true;
      this.changeDetector.detectChanges();
    });
    this.heroChatTimer = window.setTimeout(() => this.showAnswer(), 1500);
  }

  private showAnswer(): void {
    this.answerMounted = true;
    this.answerShown = false;
    this.changeDetector.detectChanges();
    requestAnimationFrame(() => {
      this.placeBubbles();
      this.answerShown = true;
      this.changeDetector.detectChanges();
    });
    const hold = Math.max(2500, Math.min(3500, this.heroAnswer.length * 50));
    this.heroChatTimer = window.setTimeout(() => this.hideChat(), hold);
  }

  private hideChat(): void {
    this.askShown = false;
    this.answerShown = false;
    this.changeDetector.detectChanges();
    this.heroChatTimer = window.setTimeout(() => {
      this.shownAskIndex = null;
      this.answerMounted = false;
      this.chatPaused = false;
      this.changeDetector.detectChanges();
      this.heroChatTimer = window.setTimeout(() => this.askNext(), 2000);
    }, 250);
  }

  private placeBubbles(): void {
    const stage = this.kbFaces?.nativeElement;
    if (!stage) {
      return;
    }
    const center = stage.querySelector('.kb-face-center')?.getBoundingClientRect();
    const answer = stage.querySelector('.kb-bubble-answer') as HTMLElement | null;
    const asker = stage.querySelector('.kb-orbit.is-asking') as HTMLElement | null;
    const ask = asker?.querySelector('.kb-bubble-ask') as HTMLElement | null;
    const askerIsBottom = !!(asker && center && this.isBottomFace(asker, center));
    if (answer && center) {
      if (askerIsBottom) {
        this.placeAnswerRight(answer, center, stage);
        this.pointTail(answer, 'left');
      } else {
        this.placeStaticAnswer(answer, center, stage);
        this.pointTail(answer, 'up');
      }
    }
    if (ask && asker && center) {
      this.placeOwnedQuestion(ask, asker);
    }
  }

  private isBottomFace(asker: HTMLElement, center: DOMRect): boolean {
    const face = asker.getBoundingClientRect();
    const dx = face.left + face.width / 2 - (center.left + center.width / 2);
    const dy = face.top + face.height / 2 - (center.top + center.height / 2);
    return dy > 0 && Math.abs(Math.atan2(dx, dy)) < Math.PI / 8;
  }

  private placeOwnedQuestion(bubble: HTMLElement, asker: HTMLElement): void {
    const gap = 8;
    bubble.style.left = '50%';
    bubble.style.top = `${asker.offsetHeight + gap + bubble.offsetHeight / 2}px`;
    this.pointTail(bubble, 'up');
  }

  private placeStaticAnswer(bubble: HTMLElement, center: DOMRect, stage: HTMLElement): void {
    const stageBox = stage.getBoundingClientRect();
    const height = bubble.offsetHeight;
    const cx = center.left + center.width / 2;
    const topEdge = center.bottom + 12;
    bubble.style.left = `${cx - stageBox.left}px`;
    bubble.style.top = `${topEdge + height / 2 - stageBox.top}px`;
  }

  private placeAnswerRight(bubble: HTMLElement, center: DOMRect, stage: HTMLElement): void {
    const stageBox = stage.getBoundingClientRect();
    const cy = center.top + center.height / 2;
    const leftEdge = center.right + 12;
    bubble.style.left = `${leftEdge + bubble.offsetWidth / 2 - stageBox.left}px`;
    bubble.style.top = `${cy - stageBox.top}px`;
  }

  private pointTail(bubble: HTMLElement, toward: 'left' | 'right' | 'up' | 'down'): void {
    const x = toward === 'left' ? '0px' : toward === 'right' ? '100%' : '50%';
    const y = toward === 'up' ? '0px' : toward === 'down' ? '100%' : '50%';
    bubble.style.setProperty('--tail-x', x);
    bubble.style.setProperty('--tail-y', y);
  }

  ngOnDestroy(): void {
    window.clearTimeout(this.collapseTimer);
    window.clearTimeout(this.heroChatTimer);
    window.removeEventListener('resize', this.onChatResize);
    window.removeEventListener('wheel', this.onWheel);
    document.body.removeEventListener('scroll', this.onWindowScroll);
    window.removeEventListener('scroll', this.onWindowScroll);
  }

  get allTopic(): KbCategory | undefined {
    return this.categories.find(topic => topic.id === 'all');
  }

  get sideTopics(): KbCategory[] {
    return this.categories.filter(topic => topic.id !== 'all');
  }

  get showResults(): boolean {
    return !!this.category || !!this.query.trim();
  }

  get visibleArticles(): KbArticle[] {
    const query = this.query.trim().toLowerCase();
    return this.articles.filter(article => {
      if (this.category && this.category !== 'all' && article.category !== this.category) {
        return false;
      }
      if (!query) {
        return true;
      }
      return this.searchText(article).includes(query);
    });
  }

  trackArticle(_index: number, article: KbArticle): string {
    return article.id;
  }

  categoryLabel(id: string): string {
    return this.categories.find(category => category.id === id)?.label || id;
  }

  countFor(id: string): number {
    if (id === 'all') {
      return this.articles.length;
    }
    return this.articles.filter(article => article.category === id).length;
  }

  get pageCount(): number {
    return Math.max(1, Math.ceil(this.visibleArticles.length / this.pageSize));
  }

  get showPager(): boolean {
    return this.visibleArticles.length > this.pageSize;
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let n = 1; n <= this.pageCount; n++) {
      pages.push(n);
    }
    return pages;
  }

  get pagedArticles(): KbArticle[] {
    const articles = this.visibleArticles;
    if (articles.length <= this.pageSize) {
      return articles;
    }
    const page = Math.min(Math.max(this.page, 1), Math.ceil(articles.length / this.pageSize));
    const start = (page - 1) * this.pageSize;
    return articles.slice(start, start + this.pageSize);
  }

  selectCategory(id: string): void {
    if (id === this.category && !this.query.trim()) {
      return;
    }
    this.swapArticles(() => {
      this.category = id;
      this.query = id ? this.query : '';
      this.page = 1;
    });
  }

  setPage(page: number): void {
    const next = Math.min(Math.max(page, 1), this.pageCount);
    if (next === this.page) {
      return;
    }
    this.swapArticles(() => {
      this.page = next;
    });
  }

  private swapArticles(apply: () => void): void {
    const results = this.kbResults?.nativeElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!this.showResults || !results || reduce || results.classList.contains('is-leaving')) {
      apply();
      if (results) {
        results.scrollTop = 0;
      }
      return;
    }
    results.classList.add('is-leaving');
    window.setTimeout(() => {
      this.zone.run(() => {
        apply();
        results.scrollTop = 0;
        this.changeDetector.detectChanges();
        results.classList.remove('is-leaving');
      });
    }, 280);
  }

  collapse(): void {
    if (!this.showResults || this.closing) {
      return;
    }
    const wrap = this.kbWrap?.nativeElement;
    if (!wrap || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.finishCollapse();
      return;
    }
    const first = new Map<string, DOMRect>();
    wrap.querySelectorAll<HTMLElement>('.kb-topic').forEach(topic => {
      const key = topic.querySelector('strong')?.textContent?.trim() || '';
      if (key) {
        first.set(key, topic.getBoundingClientRect());
      }
    });
    this.leavingTopic = wrap.querySelector('.kb-topic.is-active strong')?.textContent?.trim() || '';
    this.fadeGhost(wrap.querySelector('.kb-dock-search'), 0);
    this.fadeGhost(wrap.querySelector('.kb-dock-bar'), 0);
    this.fadeGhost(wrap.querySelector('.kb-collapse'), 0);
    this.fadeGhost(this.kbResults?.nativeElement || null, 16);
    this.closing = true;
    this.finishCollapse();
    this.changeDetector.detectChanges();
    this.glideTopics(wrap, first);
  }

  private finishCollapse(): void {
    this.category = '';
    this.query = '';
    this.topicsCollapsed = false;
    this.docked = false;
    this.page = 1;
    const results = this.kbResults?.nativeElement;
    if (results) {
      results.scrollTop = 0;
    }
  }

  private glideTopics(wrap: HTMLElement, first: Map<string, DOMRect>): void {
    const topics = Array.from(wrap.querySelectorAll<HTMLElement>('.kb-topic'));
    const moving: HTMLElement[] = [];
    topics.forEach(topic => {
      const key = topic.querySelector('strong')?.textContent?.trim() || '';
      const start = first.get(key);
      if (!start) {
        return;
      }
      const end = topic.getBoundingClientRect();
      const dx = start.left - end.left;
      const dy = start.top - end.top;
      const sx = start.width / Math.max(end.width, 1);
      const sy = start.height / Math.max(end.height, 1);
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(sx - 1) < 0.02 && Math.abs(sy - 1) < 0.02) {
        return;
      }
      if (key === this.leavingTopic) {
        topic.classList.add('is-active');
      }
      topic.style.transformOrigin = 'top left';
      topic.style.transition = 'none';
      topic.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
      topic.style.zIndex = '2';
      moving.push(topic);
    });
    if (!moving.length) {
      this.closing = false;
      return;
    }
    wrap.getBoundingClientRect();
    moving.forEach(topic => {
      topic.style.transition = 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.5s ease, border-color 0.5s ease, color 0.5s ease';
      topic.style.transform = 'none';
    });
    this.collapseTimer = window.setTimeout(() => {
      moving.forEach(topic => {
        topic.classList.remove('is-active');
        topic.style.transition = '';
        topic.style.transform = '';
        topic.style.transformOrigin = '';
        topic.style.zIndex = '';
      });
      this.leavingTopic = '';
      this.zone.run(() => {
        this.closing = false;
      });
    }, 580);
  }

  private fadeGhost(source: HTMLElement | null, shiftX: number): void {
    if (!source) {
      return;
    }
    const rect = source.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) {
      return;
    }
    const ghost = source.cloneNode(true) as HTMLElement;
    ghost.style.position = 'fixed';
    ghost.style.left = `${rect.left}px`;
    ghost.style.top = `${rect.top}px`;
    ghost.style.width = `${rect.width}px`;
    ghost.style.height = `${rect.height}px`;
    ghost.style.margin = '0';
    ghost.style.pointerEvents = 'none';
    ghost.style.zIndex = '5';
    ghost.style.opacity = '1';
    ghost.style.transform = 'none';
    ghost.style.transition = 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1), transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)';
    document.body.appendChild(ghost);
    requestAnimationFrame(() => {
      ghost.style.opacity = '0';
      ghost.style.transform = shiftX ? `translate(${shiftX}px, 10px)` : 'translateY(-10px)';
    });
    window.setTimeout(() => ghost.remove(), 740);
  }

  onDockQuery(value: string): void {
    this.query = value;
    this.page = 1;
    this.topicsCollapsed = !!value.trim();
    const results = this.kbResults?.nativeElement;
    if (results) {
      results.scrollTop = 0;
    }
  }

  private onWindowScroll = (): void => {
    this.syncDock();
    if (this.pinning || !this.showResults) {
      return;
    }
    const wrap = this.kbWrap?.nativeElement;
    if (!wrap) {
      return;
    }
    const top = wrap.getBoundingClientRect().top;
    if (top < -1) {
      this.pinning = true;
      this.scrollPageBy(top);
      this.pinning = false;
    }
  };

  private onWheel = (event: WheelEvent): void => {
    if (!this.showResults || event.ctrlKey) {
      return;
    }
    const target = event.target;
    if (target instanceof Element && target.closest('.dropcart, .modal')) {
      return;
    }
    const wrap = this.kbWrap?.nativeElement;
    const results = this.kbResults?.nativeElement;
    if (!wrap || !results) {
      return;
    }
    const delta = this.pixelDelta(event);
    if (!delta) {
      return;
    }
    const top = wrap.getBoundingClientRect().top;
    if (top <= 1 && this.sidebarCanTakeWheel(event, delta)) {
      return;
    }

    if (delta > 0) {
      event.preventDefault();
      if (top > 1) {
        const step = Math.min(delta, top);
        this.scrollPageBy(step);
        results.scrollTop += delta - step;
      } else {
        results.scrollTop += delta;
      }
      this.syncDock();
      return;
    }

    if (top > 1) {
      return;
    }
    event.preventDefault();
    const room = results.scrollTop;
    const consume = Math.min(room, -delta);
    results.scrollTop -= consume;
    this.scrollPageBy(delta + consume);
    this.syncDock();
  };

  private syncDock(): void {
    const wrap = this.kbWrap?.nativeElement;
    const next = !!wrap && this.showResults && wrap.getBoundingClientRect().top <= 1;
    if (next === this.docked) {
      return;
    }
    this.zone.run(() => {
      this.docked = next;
    });
  }

  private scrollPageBy(delta: number): void {
    if (!delta) {
      return;
    }
    if (document.body.scrollHeight > document.body.clientHeight + 1) {
      document.body.scrollTop += delta;
      return;
    }
    window.scrollBy(0, delta);
  }

  private sidebarCanTakeWheel(event: WheelEvent, delta: number): boolean {
    const topics = (event.target as HTMLElement | null)?.closest('.kb-topics') as HTMLElement | null;
    if (!topics || topics.scrollHeight <= topics.clientHeight + 1) {
      return false;
    }
    const atTop = topics.scrollTop <= 0;
    const atBottom = topics.scrollTop + topics.clientHeight >= topics.scrollHeight - 1;
    return (delta > 0 && !atBottom) || (delta < 0 && !atTop);
  }

  private pixelDelta(event: WheelEvent): number {
    if (event.deltaMode === 1) {
      return event.deltaY * 16;
    }
    if (event.deltaMode === 2) {
      return event.deltaY * window.innerHeight;
    }
    return event.deltaY;
  }

  private searchText(article: KbArticle): string {
    const blocks = article.blocks.reduce((lines: string[], block) => {
      lines.push(block.heading || '');
      (block.paragraphs || []).forEach(line => lines.push(line));
      (block.steps || []).forEach(line => lines.push(line));
      return lines;
    }, []);
    return [article.title, article.summary, this.categoryLabel(article.category), ...blocks]
      .join(' ')
      .toLowerCase();
  }
}
