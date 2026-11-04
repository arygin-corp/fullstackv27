import { BrandDef } from '../interfaces/brand-def';
import { Brand } from '../../app/@shared/interfaces/brand';
import { Observable, of } from 'rxjs';

let lastBrandId = 0;

const brandsDef: BrandDef[] = [
    { name: 'Tableau', slug: 'tableau', image: 'assets/images/marketplace/brands/platforms/tableau.svg' },
    { name: 'Power Bi', slug: 'power-bi', image: 'assets/images/marketplace/brands/platforms/power-bi.svg' },
];

export const brands: Brand[] = brandsDef.map(brandDef => {
    return {
        ...brandDef,
        id: ++lastBrandId,
    };
});

export function getBrands(): Observable<Brand[]> {
    return of(brands);
}

