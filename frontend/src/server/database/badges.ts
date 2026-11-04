import { BadgeDef } from '../interfaces/badge-def';
import { Badge } from '../../app/@shared/interfaces/badge';
import { Observable, of } from 'rxjs';

let lastBadgesId = 0;

const badgeDef: BadgeDef[] = [
    { name: 'Sensitive', slug: 'sensitive', image: ''},
    { name: 'New', slug: 'new', image: ''},
    { name: 'Tableau', slug: 'tableau', image: ''},
    { name: 'Power Bi', slug: 'power-bi', image: ''},
    { name: 'Data Lake', slug: 'data-lake', image: ''},
    { name: 'Toyota Big Data Platform', slug: 'toyota-big-data-platform', image: ''},
    { name: 'Apigee', slug: 'apigee', image: ''},
    { name: 'EFC Microservices', slug: 'efc-microservices', image: ''}
];

export const badges: Badge[] = badgeDef.map((BadgesDef: any) => {
    return {
        ...BadgesDef,
        id: ++lastBadgesId,
    };
});

export function getBadges(): Observable<Badge[]> {
    return of(badges);
}

