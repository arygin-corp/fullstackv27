import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { NavigationEnd, Router } from '@angular/router';
import { SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AiChatService } from '../../services/ai-chat.service';
import { AppService } from '../../services/app.service';
import { PicService } from '../../services/pic.service';
import {
  ProductReference,
  VikkiAction,
  VikkiMessage,
  VikkiSuggestion
} from '../../interfaces/vikki';

interface Command {
  name: string;
  action: () => void;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  @Input() currentProductId?: number;
  @Input() currentProductName?: string;
  @Input() conversationId?: number;
  @ViewChild('messageViewport') messageViewport?: ElementRef<HTMLDivElement>;
  @ViewChild('chatInput') chatInput?: ElementRef<HTMLTextAreaElement>;

  isChatOpen = false;
  isProcessing = false;
  isThinking = false;
  thinkingLabel = 'Searching your knowledge';
  errorMessage: string | null = null;
  isPaletteVisible = false;
  sourcePanelOpen = false;
  selectedSource?: ProductReference;
  commandFilter = '';
  userPhoto: SafeUrl | null = null;

  messages: VikkiMessage[] = [];
  suggestions: VikkiSuggestion[] = [];
  sources: ProductReference[] = [];
  sessionId = '';

  readonly commands: Command[] = [
    { name: 'Ask VIKKI', action: () => this.openChat() },
    { name: 'Clear chat history', action: () => this.clearHistory() },
    { name: 'Open Data Marketplace', action: () => this.navigate('/marketplace/') },
    { name: 'Open Access Copilot', action: () => this.navigate('/access/') },
    { name: 'Open Governance', action: () => this.navigate('/governance/') },
    { name: 'Open Lineage & Impact', action: () => this.navigate('/lineage/') }
  ];

  private readonly subscriptions = new Subscription();
  private historyGeneration = 0;

  constructor(
    private readonly aiChatService: AiChatService,
    private readonly router: Router,
    private readonly appSvc: AppService,
    private readonly picService: PicService,
    private readonly msal: MsalService
  ) {}

  ngOnInit(): void {
    if (!this.appSvc.userData) {
      this.appSvc.getUserData();
    }
    this.subscriptions.add(
      this.picService.getUserPhoto().subscribe({
        next: photo => this.userPhoto = photo,
        error: () => this.userPhoto = null
      })
    );
    this.sessionId = this.getOrCreateSessionId();
    this.messages = this.aiChatService.loadHistory();
    this.conversationId = this.conversationId ?? this.aiChatService.loadConversationId();
    this.suggestions = this.pageSuggestions();
    this.refreshSuggestions();
    this.subscriptions.add(
      this.aiChatService.historyCleared$.subscribe(() => {
        this.historyGeneration += 1;
        this.messages = [];
        this.sources = [];
        this.conversationId = undefined;
        this.suggestions = this.pageSuggestions();
        this.errorMessage = null;
        this.isProcessing = false;
        this.isThinking = false;
      })
    );
    this.subscriptions.add(
      this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
        if (!this.messages.length) {
          this.suggestions = this.pageSuggestions();
          this.refreshSuggestions();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get filteredCommands(): Command[] {
    const filter = this.commandFilter.trim().toLowerCase();
    return filter
      ? this.commands.filter(command => command.name.toLowerCase().includes(filter))
      : this.commands;
  }

  toggleChat(): void {
    this.isChatOpen ? this.closeChat() : this.openChat();
  }

  openChat(): void {
    this.isChatOpen = true;
    setTimeout(() => this.chatInput?.nativeElement.focus());
  }

  closeChat(): void {
    this.isChatOpen = false;
    this.closeSourcePanel();
  }

  endAiSession(): void {
    localStorage.removeItem('chatSessionId');
    this.sessionId = this.getOrCreateSessionId();
    this.aiChatService.clearHistory();
    this.closeChat();
  }

  async sendMessage(input: HTMLTextAreaElement): Promise<void> {
    const query = input.value.trim();
    if (!query || this.isProcessing) return;

    const userMessage = this.createMessage('user', query);
    const aiMessage = this.createMessage('ai', '');

    // The request history includes the user message but excludes the empty AI placeholder.
    const requestHistory = [...this.messages, userMessage];
    this.messages = [...requestHistory, aiMessage];

    input.value = '';
    this.errorMessage = null;
    this.isProcessing = true;
    this.isThinking = true;
    this.thinkingLabel = 'Searching your knowledge';
    this.scrollToBottom();
    const generation = this.historyGeneration;
    const stillActive = () => generation === this.historyGeneration;

    try {
      const response = await this.aiChatService.sendMessage(
        query,
        requestHistory,
        token => {
          if (!stillActive()) return;
          aiMessage.text += token;
          this.messages = [...this.messages];
          this.isThinking = false;
          this.scrollToBottom();
        },
        productSources => {
          if (!stillActive()) return;
          aiMessage.sources = this.omitCurrentProduct(productSources);
          this.sources = aiMessage.sources;
          this.messages = [...this.messages];
        },
        this.currentProductId,
        this.conversationId,
        this.sessionId,
        citations => {
          if (!stillActive()) return;
          aiMessage.citations = citations;
          this.messages = [...this.messages];
        },
        this.pageContext(),
        status => {
          if (!stillActive()) return;
          this.thinkingLabel = status;
          this.messages = [...this.messages];
        }
      );

      if (!stillActive()) return;
      this.conversationId = response.conversation_id ?? this.conversationId;
      this.aiChatService.saveConversationId(this.conversationId);
      aiMessage.cached = Boolean(response.cached);
      aiMessage.actions = this.omitCurrentActions(response.actions || []);
      aiMessage.guidance = response.guidance || '';
      aiMessage.suggestions = response.suggestions || [];
      this.suggestions = aiMessage.actions?.length ? [] : (response.suggestions || this.suggestions);
      this.aiChatService.saveHistory(this.messages);
    } catch {
      if (!stillActive()) return;
      aiMessage.text = 'Unable to reach VIKKI. Please verify your Data Marketplace session and try again.';
      this.errorMessage = 'The VIKKI service request failed.';
    } finally {
      if (!stillActive()) return;
      this.isThinking = false;
      this.isProcessing = false;
      this.messages = [...this.messages];
      this.scrollToBottom();
    }
  }

  handleKeyDown(event: KeyboardEvent, input: HTMLTextAreaElement): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void this.sendMessage(input);
    }
  }

  quickAsk(prompt: string): void {
    this.openChat();
    setTimeout(() => {
      const input = this.chatInput?.nativeElement;
      if (!input) return;
      input.value = prompt;
      void this.sendMessage(input);
    });
  }

  openSource(source: ProductReference): void {
    this.selectedSource = source;
    this.sourcePanelOpen = true;
  }

  closeSourcePanel(): void {
    this.sourcePanelOpen = false;
    this.selectedSource = undefined;
  }

  openSelectedProduct(): void {
    if (this.selectedSource) this.navigate(this.selectedSource.url);
  }

  openProduct(source: ProductReference): void {
    this.closeChat();
    this.navigate(source.url);
  }

  scrollProducts(messageId: string, direction: number): void {
    const track = document.getElementById(`product-slider-${messageId}`);
    const card = track?.querySelector('.recommend-card') as HTMLElement | null;
    track?.scrollBy({ left: direction * ((card?.offsetWidth || 210) + 10), behavior: 'smooth' });
  }

  executeCommand(command: Command): void {
    command.action();
    this.closePalette();
  }

  openPalette(): void {
    this.isPaletteVisible = true;
    this.commandFilter = '';
  }

  closePalette(): void {
    this.isPaletteVisible = false;
  }

  clearHistory(): void {
    this.messages = [];
    this.sources = [];
    this.conversationId = undefined;
    this.aiChatService.clearHistory();
  }

  submitFeedback(message: VikkiMessage, type: 'positive' | 'negative'): void {
    if (type === 'negative') {
      message.correcting = true;
      message.correction = message.correction || '';
    }
    this.recordFeedback(message, type, type === 'negative' ? (message.correction || '').trim() : '');
  }

  saveCorrection(message: VikkiMessage): void {
    const correction = (message.correction || '').trim();
    if (!correction) {
      return;
    }
    this.recordFeedback(message, 'negative', correction);
  }

  cancelCorrection(message: VikkiMessage): void {
    message.correcting = false;
  }

  suggestionIcon(title: string): string {
    const label = (title || '').toLowerCase();
    if (label.includes('explain')) return 'bi bi-chat-left-text';
    if (label.includes('access')) return 'bi bi-key';
    if (label.includes('file') || label.includes('source')) return 'bi bi-file-earmark-text';
    if (label.includes('compar')) return 'bi bi-layout-split';
    if (label.includes('governance')) return 'bi bi-shield-check';
    if (label.includes('lineage')) return 'bi bi-diagram-3';
    if (label.includes('open')) return 'bi bi-box-arrow-up-right';
    if (label.includes('domain') || label.includes('find') || label.includes('product')) return 'bi bi-search';
    return 'bi bi-chat';
  }

  runAction(action: VikkiAction): void {
    if (action.url) {
      this.navigate(action.url);
      return;
    }
    if (action.prompt) {
      this.quickAsk(action.prompt);
    }
  }

  answerBlocks(text: string): Array<{ kind: 'text' | 'list'; text?: string; items?: string[] }> {
    const blocks: Array<{ kind: 'text' | 'list'; text?: string; items?: string[] }> = [];
    let items: string[] = [];
    const flush = () => {
      if (items.length) {
        blocks.push({ kind: 'list', items });
        items = [];
      }
    };
    for (const line of (text || '').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) {
        flush();
        continue;
      }
      const item = trimmed.match(/^(?:[-*]|\d+\.)\s+(.*)$/);
      if (item) {
        items.push(item[1]);
      } else {
        flush();
        blocks.push({ kind: 'text', text: trimmed });
      }
    }
    flush();
    return blocks;
  }

  sourceParts(text: string): Array<{ text: string; source?: number }> {
    const parts: Array<{ text: string; source?: number }> = [];
    const pattern = /\[Source (\d+)\]/g;
    let cursor = 0;
    let match = pattern.exec(text);
    while (match) {
      if (match.index > cursor) {
        parts.push({ text: text.slice(cursor, match.index) });
      }
      parts.push({ text: match[1], source: Number(match[1]) });
      cursor = match.index + match[0].length;
      match = pattern.exec(text);
    }
    if (cursor < text.length) {
      parts.push({ text: text.slice(cursor) });
    }
    return parts.length ? parts : [{ text }];
  }

  trackMessage(_: number, message: VikkiMessage): string {
    return message.id;
  }

  @HostListener('document:keydown', ['$event'])
  handleGlobalKeydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.openPalette();
    } else if (event.key === 'Escape') {
      this.closePalette();
      this.closeSourcePanel();
    }
  }

  private createMessage(sender: 'user' | 'ai', text: string): VikkiMessage {
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      sender,
      text,
      createdAt: new Date().toISOString()
    };
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const viewport = this.messageViewport?.nativeElement;
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    });
  }

  private navigate(url: string): void {
    window.location.assign(url);
  }

  private getOrCreateSessionId(): string {
    const existing = localStorage.getItem('chatSessionId');
    if (existing) return existing;
    const value = `vikki-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('chatSessionId', value);
    return value;
  }

  private recordFeedback(message: VikkiMessage, type: 'positive' | 'negative', correction: string): void {
    const index = this.messages.indexOf(message);
    const previous = index > 0 ? this.messages[index - 1] : undefined;
    this.subscriptions.add(
      this.aiChatService.submitFeedback({
        sessionId: this.sessionId,
        conversationId: this.conversationId,
        type,
        lastQuery: previous?.text || '',
        lastAnswer: message.text,
        userCorrection: correction,
        productId: this.currentProductId
      }).subscribe({
        next: () => {
          message.feedback = type;
          if (type === 'positive') {
            message.correcting = false;
          }
          this.aiChatService.saveHistory(this.messages);
        },
        error: () => this.errorMessage = 'Feedback could not be recorded.'
      })
    );
  }

  private refreshSuggestions(): void {
    this.subscriptions.add(
      this.aiChatService.getContext(this.pageContext()).subscribe({
        next: response => {
          if (!this.messages.length) {
            this.suggestions = response.suggestions?.length ? response.suggestions : this.pageSuggestions();
          }
        },
        error: () => {
          if (!this.messages.length) {
            this.suggestions = this.pageSuggestions();
          }
        }
      })
    );
  }

  showMessage(message: VikkiMessage): boolean {
    if (message.sender === 'user') {
      return true;
    }
    return !!(message.text || message.guidance || message.citations?.length || this.recommendedProducts(message).length);
  }

  get userInitials(): string {
    const account = this.msal.instance.getActiveAccount() || this.msal.instance.getAllAccounts()[0];
    const claims = account?.idTokenClaims as { given_name?: string; family_name?: string } | undefined;
    const given = String(this.appSvc.userData?.givenName || claims?.given_name || '').trim();
    const surname = String(this.appSvc.userData?.surname || claims?.family_name || '').trim();
    return `${given.charAt(0)}${surname.charAt(0)}`.toUpperCase();
  }

  recommendedProducts(message: VikkiMessage): ProductReference[] {
    return this.omitCurrentProduct(message.sources || []);
  }

  visibleActions(message: VikkiMessage): VikkiAction[] {
    return this.omitCurrentActions(message.actions || []);
  }

  private currentProductSlug(): string {
    const match = (this.pageContext().route || '').match(/product\/([^/?#]+)/);
    if (!match || match[1] === 'request') {
      return '';
    }
    return decodeURIComponent(match[1]);
  }

  private omitCurrentProduct(sources: ProductReference[]): ProductReference[] {
    const slug = this.currentProductSlug();
    const name = (this.pageContext().productName || '').trim().toLowerCase();
    return sources.filter(source => {
      const sameSlug = !!slug && (source.url || '').includes(`/marketplace/product/${slug}`);
      const sameName = !!name && source.name.trim().toLowerCase() === name;
      return !sameSlug && !sameName;
    });
  }

  private omitCurrentActions(actions: VikkiAction[]): VikkiAction[] {
    const slug = this.currentProductSlug();
    if (!slug) {
      return actions;
    }
    return actions.filter(action => !(action.url || '').includes(`/marketplace/product/${slug}`));
  }

  private pageContext() {
    const route = this.router.url || '/';
    const productName = this.currentProductName || this.productNameFromRoute(route);
    return {
      route,
      page: route.split('?')[0].split('/').filter(Boolean).slice(-1)[0] || 'home',
      productId: this.currentProductId,
      productName,
      clientTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    };
  }

  private productNameFromRoute(route: string): string {
    const match = route.match(/product\/([^/?#]+)/);
    if (!match || match[1] === 'request') {
      return '';
    }
    return decodeURIComponent(match[1]).replace(/[-_]+/g, ' ');
  }

  private pageSuggestions(): VikkiSuggestion[] {
    const page = this.pageContext();
    if (page.productName) {
      return [
        { title: 'Explain this product', prompt: `Explain the Data Marketplace product ${page.productName} and its intended use.` },
        { title: 'Check access', prompt: `What would I need before requesting access to ${page.productName}?` },
        { title: 'What files do you have on this?', prompt: `What indexed knowledge do you have about ${page.productName}?` },
      ];
    }
    return this.defaultSuggestions();
  }

  private defaultSuggestions(): VikkiSuggestion[] {
    return [
      {
        title: 'Find a product',
        prompt: 'Help me find a Data Marketplace product for my business need.'
      },
      {
        title: 'Browse domains',
        prompt: 'What Data Marketplace domains are available?'
      },
      {
        title: 'Access guidance',
        prompt: 'How do I check access readiness for a Data Marketplace product?'
      }
    ];
  }
}













// import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
// import { Subscription } from 'rxjs';
// import { AiChatService } from '../../services/ai-chat.service';
// import { ProductReference, VikkiMessage, VikkiSuggestion} from '../../interfaces/vikki';

// interface Command {
//   name: string;
//   action: () => void;
// }

// @Component({
//   selector: 'app-chat',
//   templateUrl: './chat.component.html',
//   styleUrls: ['./chat.component.scss']
// })
// export class ChatComponent implements OnInit, OnDestroy {
//   @Input() currentProductId?: number;
//   @Input() conversationId?: number;
//   @ViewChild('messageViewport') messageViewport?: ElementRef<HTMLDivElement>;
//   @ViewChild('chatInput') chatInput?: ElementRef<HTMLTextAreaElement>;

//   isChatOpen = false;
//   isProcessing = false;
//   isThinking = false;
//   errorMessage: string | null = null;
//   isPaletteVisible = false;
//   sourcePanelOpen = false;
//   selectedSource?: ProductReference;
//   commandFilter = '';

//   messages: VikkiMessage[] = [];
//   suggestions: VikkiSuggestion[] = [];
//   sources: ProductReference[] = [];
//   sessionId = '';

//   readonly commands: Command[] = [
//     { name: 'Ask VIKKI', action: () => this.openChat() },
//     { name: 'Clear chat history', action: () => this.clearHistory() },
//     { name: 'Open Data Marketplace', action: () => this.navigate('/marketplace/') },
//     { name: 'Open Access Copilot', action: () => this.navigate('/access/') },
//     { name: 'Open Governance', action: () => this.navigate('/governance/') },
//     { name: 'Open Lineage & Impact', action: () => this.navigate('/lineage/') }
//   ];

//   private readonly subscriptions = new Subscription();

//   constructor(private readonly aiChatService: AiChatService) {}

//   ngOnInit(): void {
//     this.sessionId = this.getOrCreateSessionId();
//     this.messages = this.aiChatService.loadHistory();
//     this.subscriptions.add(
//       this.aiChatService.getContext().subscribe({
//         next: response => this.suggestions = response.suggestions || [],
//         error: () => this.suggestions = this.defaultSuggestions()
//       })
//     );
//   }

//   ngOnDestroy(): void {
//     this.subscriptions.unsubscribe();
//   }

//   get filteredCommands(): Command[] {
//     const filter = this.commandFilter.trim().toLowerCase();
//     return filter
//       ? this.commands.filter(command => command.name.toLowerCase().includes(filter))
//       : this.commands;
//   }

//   toggleChat(): void {
//     this.isChatOpen ? this.closeChat() : this.openChat();
//   }

//   openChat(): void {
//     this.isChatOpen = true;
//     setTimeout(() => this.chatInput?.nativeElement.focus());
//   }

//   closeChat(): void {
//     this.isChatOpen = false;
//     this.closeSourcePanel();
//   }

//   async sendMessage(input: HTMLTextAreaElement): Promise<void> {
//     const query = input.value.trim();
//     if (!query || this.isProcessing) return;

//     const userMessage = this.createMessage('user', query);
//     const aiMessage = this.createMessage('ai', '');
//     this.messages = [...this.messages, userMessage, aiMessage];
//     input.value = '';
//     this.errorMessage = null;
//     this.isProcessing = true;
//     this.isThinking = true;
//     this.scrollToBottom();

//     try {
//       const response = await this.aiChatService.sendMessage(
//         query,
//         this.messages,
//         token => {
//           aiMessage.text += token;
//           this.messages = [...this.messages];
//           this.isThinking = false;
//           this.scrollToBottom();
//         },
//         productSources => {
//           aiMessage.sources = productSources;
//           this.sources = productSources;
//           this.messages = [...this.messages];
//         },
//         this.currentProductId,
//         this.conversationId
//       );
//       aiMessage.suggestions = response.suggestions || [];
//       this.suggestions = response.suggestions || this.suggestions;
//       this.aiChatService.saveHistory(this.messages);
//     } catch {
//       aiMessage.text = 'Unable to reach VIKKI. Please verify your Data Marketplace session and try again.';
//       this.errorMessage = 'The VIKKI service request failed.';
//     } finally {
//       this.isThinking = false;
//       this.isProcessing = false;
//       this.messages = [...this.messages];
//       this.scrollToBottom();
//     }
//   }

//   handleKeyDown(event: KeyboardEvent, input: HTMLTextAreaElement): void {
//     if (event.key === 'Enter' && !event.shiftKey) {
//       event.preventDefault();
//       void this.sendMessage(input);
//     }
//   }

//   quickAsk(prompt: string): void {
//     this.openChat();
//     if (!this.chatInput) return;
//     this.chatInput.nativeElement.value = prompt;
//     void this.sendMessage(this.chatInput.nativeElement);
//   }

//   openSource(source: ProductReference): void {
//     this.selectedSource = source;
//     this.sourcePanelOpen = true;
//   }

//   closeSourcePanel(): void {
//     this.sourcePanelOpen = false;
//     this.selectedSource = undefined;
//   }

//   openSelectedProduct(): void {
//     if (this.selectedSource) this.navigate(this.selectedSource.url);
//   }

//   executeCommand(command: Command): void {
//     command.action();
//     this.closePalette();
//   }

//   openPalette(): void {
//     this.isPaletteVisible = true;
//     this.commandFilter = '';
//   }

//   closePalette(): void {
//     this.isPaletteVisible = false;
//   }

//   clearHistory(): void {
//     this.messages = [];
//     this.sources = [];
//     this.aiChatService.clearHistory();
//   }

//   submitFeedback(message: VikkiMessage, type: 'positive' | 'negative'): void {
//     const index = this.messages.indexOf(message);
//     const previous = index > 0 ? this.messages[index - 1] : undefined;
//     const correction = type === 'negative'
//       ? window.prompt('What would have been a better answer?') || ''
//       : '';

//     this.subscriptions.add(
//       this.aiChatService.submitFeedback({
//         sessionId: this.sessionId,
//         type,
//         lastQuery: previous?.text || '',
//         lastAnswer: message.text,
//         userCorrection: correction,
//         productId: this.currentProductId
//       }).subscribe({
//         next: () => message.feedback = type,
//         error: () => this.errorMessage = 'Feedback could not be recorded.'
//       })
//     );
//   }

//   trackMessage(_: number, message: VikkiMessage): string {
//     return message.id;
//   }

//   @HostListener('document:keydown', ['$event'])
//   handleGlobalKeydown(event: KeyboardEvent): void {
//     if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
//       event.preventDefault();
//       this.openPalette();
//     } else if (event.key === 'Escape') {
//       this.closePalette();
//       this.closeSourcePanel();
//     }
//   }

//   private createMessage(sender: 'user' | 'ai', text: string): VikkiMessage {
//     return {
//       id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
//       sender,
//       text,
//       createdAt: new Date().toISOString()
//     };
//   }

//   private scrollToBottom(): void {
//     setTimeout(() => {
//       const viewport = this.messageViewport?.nativeElement;
//       if (viewport) viewport.scrollTop = viewport.scrollHeight;
//     });
//   }

//   private navigate(url: string): void {
//     window.location.assign(url);
//   }

//   private getOrCreateSessionId(): string {
//     const existing = localStorage.getItem('chatSessionId');
//     if (existing) return existing;
//     const value = `vikki-${Date.now()}-${Math.random().toString(36).slice(2)}`;
//     localStorage.setItem('chatSessionId', value);
//     return value;
//   }

//   private defaultSuggestions(): VikkiSuggestion[] {
//     return [
//       { title: 'Find a product', prompt: 'Help me find a Data Marketplace product for my business need.' },
//       { title: 'Browse domains', prompt: 'What Data Marketplace domains are available?' },
//       { title: 'Access guidance', prompt: 'How do I check access readiness for a Data Marketplace product?' }
//     ];
//   }
// }
