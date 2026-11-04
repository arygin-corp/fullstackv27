// src/app/path-to-chat/services/ai-chat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment} from '../../../environments/environment';
import { CitationReference, ProductReference, VikkiChatResponse, VikkiContextResponse, VikkiMessage} from '../interfaces/vikki';

@Injectable({
  providedIn: 'root'
})
export class AiChatService {
  private readonly apiBase = environment.apiUrl;
  private readonly storageKey = 'vikki-chat-history-v1';

  constructor(
    private readonly http: HttpClient, 
  ) {}

  sendMessage(
    query: string,
    history: VikkiMessage[],
    onToken: (token: string) => void,
    onSources: (sources: ProductReference[]) => void,
    productId?: number,
    conversationId?: number,
    sessionId?: string,
    onCitations?: (citations: CitationReference[]) => void
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
        page: 'angular-chat-component',

        recent_client_messages: history.filter(message =>
          Boolean(message.text?.trim())).slice(-6).map(message => ({
            sender: message.sender,
            text: message.text
          })
        )
      }
    };

    return new Promise<VikkiChatResponse>((resolve, reject) => {
      this.http.post<VikkiChatResponse>(`${this.apiBase}/api/ai/chat/`, payload).subscribe({
        next: response => {onToken(response.answer || '');
        const productSources: ProductReference[] = (response.recommendations || []).map(item => ({
          id: item.product.id,
          name: item.product.name,
          url: `/marketplace/products/${item.product.id}/`,
          domain: item.product.domain,
          dataType: item.product.data_type,
          score: item.score,
          reason: item.reason
        })
      );

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
    });
  }


  getContext(): Observable<VikkiContextResponse> {
    // const token = localStorage.getItem('access_token');
    return this.http.get<VikkiContextResponse>(`${this.apiBase}/api/ai/chat/context/`, {
        // headers: { Authorization: `Bearer ${token}` }
      }
    );
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

    return this.http.post<{
      id: number;
      recorded: boolean;
    }>(`${this.apiBase}/api/ai/chat/feedback/`, payload);
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


  clearHistory(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      /*
       * Nothing further is required when local storage
       * is unavailable.
       */
    }
  }
}