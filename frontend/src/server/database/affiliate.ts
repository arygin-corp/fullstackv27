import { AffiliateDef } from '../interfaces/affiliate-def';
import { Affiliate } from '../../app/@shared/interfaces/affiliate';
import { Observable, of } from 'rxjs';

let lastAffiliateId = 0;

const affiliatesDef: AffiliateDef[] = [
    { name: 'TMNA', slug: 'tmna', image: 'assets/images/logos/logo-1.png' },
    { name: 'TMC', slug: 'tmc', image: 'assets/images/logos/logo-2.png' },
    { name: 'TFS', slug: 'tfs', image: 'assets/images/logos/logo-3.png' },
    { name: 'TCI', slug: 'tci', image: 'assets/images/logos/logo-4.png' },
    { name: 'TCNA', slug: 'tcna', image: 'assets/images/logos/logo-5.png' },
    { name: 'TMC', slug: 'tmc', image: 'assets/images/logos/logo-6.png' },
    { name: 'Woven Planet', slug: 'woven-planet', image: 'assets/images/logos/logo-7.png' },
];

export const affiliates: Affiliate[] = affiliatesDef.map(affiliateDef => {
    return {
        ...affiliateDef,
        id: ++lastAffiliateId,
    };
});

export function getAffiliates(): Observable<Affiliate[]> {
    return of(affiliates);
}

