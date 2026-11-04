import { CustomFields } from './custom-fields';

export interface Domain {
    id: number;
    type: 'shop'|'blog'|'changelog';
    name: string;
    desc: string;
    slug: string;
    path: string;
    image: string|null;
    items: number;
    customFields: CustomFields;
    parents?: Domain[]|null;
    children?: Domain[]|null;
    products?: any[]; 
}
