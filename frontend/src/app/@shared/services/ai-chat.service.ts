// src/app/path-to-chat/services/ai-chat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable, Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment} from '../../../environments/environment';
import { MsalService } from '@azure/msal-angular';
import { CitationReference, ProductReference, VikkiChatResponse, VikkiContextResponse, VikkiMessage, VikkiPageContext} from '../interfaces/vikki';

@Injectable({
  providedIn: 'root'
})
export class AiChatService {
  private readonly apiBase = environment.apiUrl;
  private readonly storageKey = 'vikki-chat-history-v1';
  private readonly conversationKey = 'vikki-conversation-id';
  private readonly historyCleared = new Subject<void>();
  readonly historyCleared$ = this.historyCleared.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly msal: MsalService,
  ) {}

  sendMessage(
    query: string,
    history: VikkiMessage[],
    onToken: (token: string) => void,
    onSources: (sources: ProductReference[]) => void,
    productId?: number,
    conversationId?: number,
    sessionId?: string,
    onCitations?: (citations: CitationReference[]) => void,
    page?: VikkiPageContext,
    onStatus?: (status: string) => void
  ): Promise<VikkiChatResponse> {
    const question = query.trim();

    if (!question) {
      return Promise.reject(new Error('A message is required.'));
    }

    const payload = {
      question,
      product_id: productId ?? undefined,
      conversation_id: conversationId ?? undefined,
      session_id: sessionId || undefined,

      page_context: {
        page: page?.page || 'angular-chat',
        route: page?.route || '',
        product_id: page?.productId,
        product_name: page?.productName || '',
        client_time_zone: page?.clientTimeZone || '',

        recent_client_messages: history.filter(message =>
          Boolean(message.text?.trim())).slice(-6).map(message => ({
            sender: message.sender,
            text: message.text
          })
        )
      }
    };

    return this.streamMessage(payload, onToken, onSources, onCitations, onStatus).catch(error => {
      if (error?.name === 'StreamBodyError') {
        return Promise.reject(error);
      }
      return this.authHeaders().then(headers => new Promise<VikkiChatResponse>((resolve, reject) => {
      this.http.post<VikkiChatResponse>(`${this.apiBase}/api/ai/chat/`, payload, { headers }).subscribe({
        next: response => {onToken(response.answer || '');
        const productSources: ProductReference[] = (response.recommendations || []).map(item => this.productReference(item));

      onSources(productSources);

      const citations: CitationReference[] = (response.citations || []).map(item => ({
        documentId: item.document_id,
        documentTitle: item.title,
        chunkId: item.chunk_id,
        position: item.position,
        excerpt: item.excerpt
      }));

      onCitations?.(citations);
        resolve(response);
      },

        error: error => {
          reject(error);
        }
      });
    }));
    });
  }


  getContext(page?: VikkiPageContext): Observable<VikkiContextResponse> {
    return new Observable<VikkiContextResponse>(observer => {
      this.authHeaders().then(headers => {
        this.http.get<VikkiContextResponse>(`${this.apiBase}/api/ai/chat/context/`, {
          headers,
          params: {
            route: page?.route || '',
            page: page?.page || '',
            product_id: page?.productId ? String(page.productId) : '',
            product_name: page?.productName || '',
          }
        }).subscribe(observer);
      }).catch(error => observer.error(error));
    });
  }

  private async streamMessage(
    payload: Record<string, unknown>,
    onToken: (token: string) => void,
    onSources: (sources: ProductReference[]) => void,
    onCitations?: (citations: CitationReference[]) => void,
    onStatus?: (status: string) => void
  ): Promise<VikkiChatResponse> {
    const headers = await this.authHeaders();
    const response = await fetch(`${this.apiBase}/api/ai/chat/stream/`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify(payload),
    });
    if (!response.ok || !response.body) {
      throw new Error('Vikki stream is unavailable.');
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    const result: VikkiChatResponse = { answer: '' };
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) {
        break;
      }
      buffer += decoder.decode(chunk.value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() || '';
      for (const event of events) {
        const line = event.split('\n').find(item => item.startsWith('data:'));
        if (!line) {
          continue;
        }
        const data = JSON.parse(line.slice(5).trim());
        if (data.type === 'status') {
          onStatus?.(data.status === 'answering' ? 'Writing an answer' : 'Searching your knowledge');
        } else if (data.type === 'token') {
          result.answer += data.token || '';
          onToken(data.token || '');
        } else if (data.type === 'conversation') {
          result.conversation_id = data.conversation_id;
        } else if (data.type === 'citations') {
          result.citations = data.citations || [];
          onCitations?.((result.citations || []).map(item => ({
            documentId: item.document_id,
            documentTitle: item.title,
            chunkId: item.chunk_id,
            position: item.position,
            excerpt: item.excerpt,
          })));
        } else if (data.type === 'recommendations') {
          result.recommendations = data.recommendations || [];
          onSources((result.recommendations || []).map(item => this.productReference(item)));
        } else if (data.type === 'suggestions') {
          result.suggestions = data.suggestions || [];
        } else if (data.type === 'actions') {
          result.actions = data.actions || [];
        } else if (data.type === 'guidance') {
          result.guidance = data.guidance || '';
        } else if (data.type === 'cached' || data.type === 'done') {
          result.cached = Boolean(data.cached);
          if (data.conversation_id) {
            result.conversation_id = data.conversation_id;
          }
        } else if (data.type === 'error') {
          const failure = new Error(data.message || 'Vikki could not answer.');
          failure.name = 'StreamBodyError';
          throw failure;
        }
      }
    }
    return result;
  }

  private productReference(item: { product: { id: number; name: string; slug?: string; image?: string; domain?: string; data_type?: string }; score?: number; reason?: string; }): ProductReference {
    const image = item.product.image || '';
    return {
      id: item.product.id,
      name: item.product.name,
      url: item.product.slug
        ? `/marketplace/product/${item.product.slug}`
        : `/marketplace/products/${item.product.id}/`,
      image: image.startsWith('http') || !image ? image : `${environment.apiUrl}${image.startsWith('/') ? '' : '/'}${image}`,
      domain: item.product.domain,
      dataType: item.product.data_type,
      score: item.score,
      reason: item.reason,
    };
  }

  private async authHeaders(): Promise<Record<string, string>> {
    try {
      let account = this.msal.instance.getActiveAccount() || this.msal.instance.getAllAccounts()[0];
      for (let attempt = 0; !account && attempt < 10; attempt += 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
        account = this.msal.instance.getActiveAccount() || this.msal.instance.getAllAccounts()[0];
      }
      if (!account) {
        return {};
      }
      const result = await this.msal.instance.acquireTokenSilent({
        scopes: ['openid', 'profile'],
        account,
      });
      if (!result.idToken) {
        return {};
      }
      return { Authorization: `Bearer ${result.idToken}` };
    } catch {
      return {};
    }
  }

  submitFeedback(payload: {
    sessionId: string;
      type: 'positive' | 'negative';
      lastQuery: string;
      lastAnswer: string;
      userCorrection?: string;
      productId?: number;
      conversationId?: number;
    }): Observable<{
      id: number;
      recorded: boolean;
    }> {

    return from(this.authHeaders()).pipe(
      switchMap(headers => this.http.post<{
        id: number;
        recorded: boolean;
      }>(`${this.apiBase}/api/ai/chat/feedback/`, payload, { headers }))
    );
  }

  loadHistory(): VikkiMessage[] {
    try {
      const raw = localStorage.getItem(this.storageKey);

      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw);

      return parsed as VikkiMessage[];
    } catch {
      return [];
    }
  }

  saveHistory(messages: VikkiMessage[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(messages.slice(-100)));
    } catch {
      /*
       * Chat operation should not fail because local storage
       * is unavailable or has reached its quota.
       */
    }
  }


  loadConversationId(): number | undefined {
    try {
      const raw = localStorage.getItem(this.conversationKey);
      const parsed = raw ? Number(raw) : NaN;
      return Number.isInteger(parsed) ? parsed : undefined;
    } catch {
      return undefined;
    }
  }

  saveConversationId(conversationId?: number): void {
    if (!conversationId) {
      return;
    }
    try {
      localStorage.setItem(this.conversationKey, String(conversationId));
    } catch {
      return;
    }
  }

  clearHistory(): void {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.conversationKey);
    } catch {
      /*
       * Nothing further is required when local storage
       * is unavailable.
       */
    }
    this.historyCleared.next();
  }
}