export interface DomainDef {
    name: string;
    slug: string;
    desc: string;
    image?: string;
    items?: number;
    children?: DomainDef[];
}
