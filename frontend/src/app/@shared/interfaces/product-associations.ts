import { Product } from './product';

export type ProductAssociationType =
    | 'related'
    | 'additional'
    | 'both';

export interface ProductAssociation {
    id: number;
    association_type: ProductAssociationType;
    badge_label: string;
    is_related: boolean;
    is_additional: boolean;
    reason?: string;
    position: number;
    associated_product: Product;
}
