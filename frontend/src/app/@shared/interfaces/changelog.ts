export interface ChangelogSection {
    category: string;
    subtitle: string;
    content: string;
}

export interface Changelog {
    id: number;
    version: string;
    title: string;
    description: string;
    release_date: string;
    sections: ChangelogSection[];
}