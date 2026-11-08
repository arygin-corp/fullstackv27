/// interfaces/vikki.ts
export interface ProductReference {
  id: number;
  name: string;
  url: string;
  image?: string;
  domain?: string;
  dataType?: string;
  score?: number;
  reason?: string;
}


export interface CitationReference {
  documentId: number;
  documentTitle: string;
  chunkId: number;
  position: number;
  excerpt: string;
}


export interface VikkiSuggestion {
  title: string;
  prompt: string;
}


export interface VikkiAction {
  title: string;
  prompt?: string;
  url?: string;
}


export interface VikkiPageContext {
  route: string;
  page: string;
  productId?: number;
  productName?: string;
  clientTimeZone?: string;
}


export interface VikkiMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  createdAt: string;
  sources?: ProductReference[];
  citations?: CitationReference[];
  suggestions?: VikkiSuggestion[];
  actions?: VikkiAction[];
  guidance?: string;
  cached?: boolean;
  correcting?: boolean;
  correction?: string;
  feedback?: 'positive' | 'negative';
}


export interface VikkiRecommendationResponse {
  product: {
    id: number;
    name: string;
    slug?: string;
    image?: string;
    domain?: string;
    data_type?: string;
  };

  score?: number;
  reason?: string;
}


export interface VikkiCitationResponse {
  document_id: number;
  title: string;
  chunk_id: number;
  position: number;
  excerpt: string;
}


export interface VikkiChatResponse {
  answer: string;
  conversation_id?: number;
  session_id?: string;
  suggestions?: VikkiSuggestion[];
  recommendations?: VikkiRecommendationResponse[];
  citations?: VikkiCitationResponse[];
  actions?: VikkiAction[];
  guidance?: string;
  cached?: boolean;
  latency_ms?: number;
}


export interface VikkiContextResponse {
  assistant_name?: string;
  context?: unknown;
  suggestions?: VikkiSuggestion[];
}