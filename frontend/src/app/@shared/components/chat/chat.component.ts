import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { Subscription } from 'rxjs';
import { AiChatService } from '../../services/ai-chat.service';
import {
  ProductReference,
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
  @Input() conversationId?: number;
  @ViewChild('messageViewport') messageViewport?: ElementRef<HTMLDivElement>;
  @ViewChild('chatInput') chatInput?: ElementRef<HTMLTextAreaElement>;

  isChatOpen = false;
  isProcessing = false;
  isThinking = false;
  errorMessage: string | null = null;
  isPaletteVisible = false;
  sourcePanelOpen = false;
  selectedSource?: ProductReference;
  commandFilter = '';

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

  constructor(private readonly aiChatService: AiChatService) {}

  ngOnInit(): void {
    this.sessionId = this.getOrCreateSessionId();
    this.messages = this.aiChatService.loadHistory();
    this.subscriptions.add(
      this.aiChatService.getContext().subscribe({
        next: response => this.suggestions = response.suggestions || [],
        error: () => this.suggestions = this.defaultSuggestions()
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
    this.scrollToBottom();

    try {
      const response = await this.aiChatService.sendMessage(
        query,
        requestHistory,
        token => {
          aiMessage.text += token;
          this.messages = [...this.messages];
          this.isThinking = false;
          this.scrollToBottom();
        },
        productSources => {
          aiMessage.sources = productSources;
          this.sources = productSources;
          this.messages = [...this.messages];
        },
        this.currentProductId,
        this.conversationId,
        this.sessionId,
        citations => {
          aiMessage.citations = citations;
          this.messages = [...this.messages];
        }
      );

      this.conversationId = response.conversation_id ?? this.conversationId;
      aiMessage.suggestions = response.suggestions || [];
      this.suggestions = response.suggestions || this.suggestions;
      this.aiChatService.saveHistory(this.messages);
    } catch {
      aiMessage.text = 'Unable to reach VIKKI. Please verify your Data Marketplace session and try again.';
      this.errorMessage = 'The VIKKI service request failed.';
    } finally {
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
    const index = this.messages.indexOf(message);
    const previous = index > 0 ? this.messages[index - 1] : undefined;
    const correction = type === 'negative'
      ? window.prompt('What would have been a better answer?') || ''
      : '';

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
        next: () => message.feedback = type,
        error: () => this.errorMessage = 'Feedback could not be recorded.'
      })
    );
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
