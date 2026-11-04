export enum EndToEndSolutionStatus {
  Draft = 'draft',
  Published = 'published',
  Archived = 'archived',
}

export interface MarketplaceProductImage {
  url: string;
  alt?: string;
}

export interface MarketplaceProduct {
  id: number | string;
  name: string;
  slug?: string;
  sku?: string;
  short_desc?: string;
  brief_desc?: string;
  datatype?: string | null;
  images?: Array<string | MarketplaceProductImage>;
  price?: number | string | null;
  currency?: string;
  dataSteward?: unknown;
  data_steward?: unknown;
  steward?: unknown;
  domain?: string | null;
  dataDomain?: unknown;
  data_domain?: unknown;
  classification?: string | null;
  dataClassification?: unknown;
  data_classification?: unknown;
  [key: string]: unknown;
}

export interface EndToEndSolutionProduct {
  id: number | string;
  product: MarketplaceProduct;
  displayOrder: number;
  reason?: string;
}

export interface EndToEndSolution {
  id: number | string;
  name: string;
  description?: string;
  status: EndToEndSolutionStatus | string;
  products: EndToEndSolutionProduct[];
}
