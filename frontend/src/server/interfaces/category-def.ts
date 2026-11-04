export interface CategoryDef {
    name: string;
    slug: string;
    desc: string;
    image?: string;
    items?: number;
    children?: CategoryDef[];
}
