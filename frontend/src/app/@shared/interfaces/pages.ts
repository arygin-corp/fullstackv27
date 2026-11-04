export interface ContentBlock {
    id: string;
    label: string;
    block_type: string;
    position: number;
    payload: {
        content: string;
    };
}

export interface PublishedVersion {
    id: number;
    number: number;
    blocks: ContentBlock[];
}

export interface Page {
    id: number;
    title: string;
    slug: string;
    published_version: PublishedVersion;
}