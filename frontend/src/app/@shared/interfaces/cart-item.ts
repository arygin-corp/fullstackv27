import { Product } from './product';

export interface CartItem {
    id: number;
    product: Product;
    options: {
        name: string;
        value: string;
    }[];
    quantity: number;
    formData?: any;
    aiSuggested?: boolean;
}