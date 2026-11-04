import { OrganizationDef } from '../interfaces/org-def';
import { Organization } from '../../app/@shared/interfaces/organization';
import { Observable, of } from 'rxjs';

let lastOrganizationId = 0;

const affiliatesDef: OrganizationDef[] = [
    { name: 'TMNA', slug: 'tmna', image: 'assets/images/marketplace/brands/orgs/tmna.svg' },
    { name: 'TFS', slug: 'tfs', image: 'assets/images/marketplace/brands/orgs/tfs.svg' },
    { name: 'TCI', slug: 'tci', image: 'assets/images/marketplace/brands/orgs/tmna.svg' },
    { name: 'TCNA', slug: 'tcna', image: 'assets/images/marketplace/brands/orgs/toyota-connected.png' },
    { name: 'TMC', slug: 'tmc', image: 'assets/images/marketplace/brands/orgs/' },
    { name: 'Woven Planet', slug: 'woven-planet', image: 'assets/images/marketplace/brands/orgs/woven-planet.svg' },
];

export const organizations: Organization[] = organizationsDef.map(organizationDef => {
    return {
        ...organizationDef,
        id: ++lastOrganizationId,
    };
});

export function getOrganizations(): Observable<Organization[]> {
    return of(organizations);
}

