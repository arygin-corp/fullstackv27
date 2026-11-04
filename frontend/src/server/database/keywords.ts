import { KeywordDef } from '../interfaces/keyword-def';
import { Keyword } from '../../app/@shared/interfaces/keyword';
import { Observable, of } from 'rxjs';

let lastKeywordId = 0;

const keywordsDef: KeywordDef[] = [
    { name: 'New Car Sales', slug: 'new-car-sales'},
    { name: 'Business Analytics', slug: 'business-analytics'},
    { name: 'Tableau', slug: 'tableau'},
];

export const keywords: Keyword[] = keywordsDef.map((keywordDef: any) => {
    return {
        ...keywordDef,
        id: ++lastKeywordId,
    };
});

export function getKeywords(): Observable<Keyword[]> {
    return of(keywords);
}

