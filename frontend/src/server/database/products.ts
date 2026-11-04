import { AttributeDef, ProductDef } from '../interfaces/product-def';
import { Product, ProductAttribute, ProductAttributeValue } from '../../app/@shared/interfaces/product';
import { brands } from './brands';
import { affiliates } from './affiliate';
import { keywords } from './keywords';
import { Category } from '../../app/@shared/interfaces/category';
import { shopCategoriesList } from './categories';
import { Observable, of, throwError, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { sampleData } from './sample-data';

let lastProductId = 0;

export const attributesDef: AttributeDef[] = [
    {
        name: 'Affiliate',
        slug: 'affiliate',
        values: [
            { name: 'TMNA', slug: 'tmna'},
            { name: 'TMC', slug: 'tmc'},
        ],
    },
    {
        name: 'Product Type',
        slug: 'datatype',
        values: [
            { name: 'Reports', slug: 'reports' },
            { name: 'Dashboards', slug: 'dashboards' },
            { name: 'Datasets', slug: 'datasets' },
            { name: 'Data Science', slug: 'data-science' },
            { name: 'APIs', slug: 'apis' },
        ],
    },
    /*{
        name: 'Data Stewards',
        slug: 'data-stewards',
        values: [
            { name: 'Omar Casas', slug: 'omar-casas'},
        ],
    },*/
    {
        name: 'Domains',
        slug: 'domains',
        values: [
            { name: 'Vehicle', slug: 'vehicle'},
        ],
    },
    {
        name: 'Keywords',
        slug: 'keywords',
        values: [
            { name: 'New Car Sales', slug: 'new-car-sales'},
            { name: 'Business Analytics', slug: 'business-analytics'},
            { name: 'Tableau', slug: 'tableau'},
            { name: 'Power BI', slug: 'power-bi'},
        ],
    },
    {
        name: 'Badges',
        slug: 'badges',
        values: [
            { name: 'Sensitive', slug: 'sensitive'},
            { name: 'New', slug: 'new'},
        ],
    },
];

export const productsDef: ProductDef[] = [
    {
        id: 1,
        slug: 'all-time-best-ever-sales-report-by-region',
        name: 'All Time Best Ever Sales Report by Region',
        briefDesc: 'The All Time Best Ever Sales Report shows the Retail Sales for Toyota Passenger Cars, Light Trucks, and Total Vehicles for each selling year beginning with 1978. The All Time Best Ever value for each category is highlighted. Also shown are the Year-over-Year sales volumes for the current month (e.g. if the current month is October, the October Passenger Car, Light Truck, and Total Sales are shown for each selling year beginning with 1978). The report can be filtered by Region, Fleet Indicator, Hybrid Indicator, Series Group, and Series.',
        shortDesc: 'The All Time Best Ever Sales Report shows the Retail Sales for Toyota Passenger Cars, Light Trucks, and Total Vehicles for each selling year beginning with 1978. The report can be filtered by Region, Fleet Indicator, Hybrid Indicator, Series Group, and Series.',
        datatype: 'Dashboards',
        classification: 'Protected',                                               
        intendedUse: 'Not required for products with a Data Classification of Public or Protected', 
        dataSteward: 'Omar Casas',                                                       
        dataStewardEmail: 'omar.casas@toyota.com',                                       
        pocName: 'David Herb',                                                         
        pocEmail: 'david.herb@toyota.com', 
        businessName: '',
        businessNameEmail: '',
        businessSME: '',
        businessSMEEmail: '',
        resourceName: 'Resource Link',
        resourceURL: 'https://ssbi.toyota.com/#/site/ToyMarketing/views/AllTimeBestEverSalesReportbyRegion/AllTimeBestEver?:iid=3',
        price: 0.00,
        sku: '281100208',
        images: [
            'all_time_best_sales_region.jpg'
        ],
        badges: [
            'new',
        ],
        rating: 0,
        reviews: 0,
        platformType: 'Tableau',
        platformBranding: 'tableau.svg',
        org: 'tmna',
        keyword: [
            'new-car-sales', 
            'business-analytics', 
            'tableau'
        ],
        categories: [
            'Vehicle', 
            'Sales', 
            'New Car Sales', 
            'Aggregated Actuals'
        ],
        attributes: [
            { slug: 'color',             values: 'yellow' },
            { slug: 'speed',             values: '750-rpm',           featured: true },
            { slug: 'power-source',      values: 'cordless-electric', featured: true },
            { slug: 'battery-cell-type', values: 'lithium',           featured: true },
            { slug: 'voltage',           values: '20-volts',          featured: true },
            { slug: 'battery-capacity',  values: '2-Ah',              featured: true },
        ],
        oneTSDomain: 'Vehicles',                                                   
        controlGroup: '966f578fdbd3081012b941a405961984', 
        adGroup: '',                                                                                                                                                                                                                                                            
        userType: 'TMNA Users',                                                    
        accessType: 'User Access',                                                
        dataAccessType: 'read',                                                   
        platform: 'Other',                                 
        routeIdentifier: '6',                                                      
        env: 'Prod',                                                               
        pii: false,        
        sampleData: [
            { "sampleid": 1, "axonid": null, "name": "Region", "value": "All", "sort": "A" },
            { "sampleid": 1, "axonid": null, "name": "Fleet Indicator", "value": "Non-Fleet", "sort": "B" },
            { "sampleid": 1, "axonid": null, "name": "Hybrid Indicator", "value": "All", "sort": "C" },
            { "sampleid": 1, "axonid": null, "name": "Series Group", "value": "Total Camry", "sort": "D" },
            { "sampleid": 1, "axonid": null, "name": "Series", "value": "Camry Sedan", "sort": "E" },
            { "sampleid": 1, "axonid": null, "name": "Selling Year", "value": "2007", "sort": "F" },
            { "sampleid": 1, "axonid": null, "name": "Passenger Car Sales", "value": "1,305,721", "sort": "G" },
            { "sampleid": 1, "axonid": null, "name": "Light Truck Sales", "value": "969,155", "sort": "H" },
            { "sampleid": 1, "axonid": null, "name": "Total Light Vehicle Sales", "value": "2,274,876", "sort": "I" }
        ]
    },
    {                                                                           
        id: 2, 
        slug: 'inventory-information-efc-api',                                                                   
        name: 'Inventory Information EFC API',    
        briefDesc: 'Enterprise Factory Configurator (EFC) Inventory VIN service provides inventory information by given VIN, along with marketing content.',                                       
        shortDesc: 'Enterprise Factory Configurator (EFC) Inventory VIN service provides inventory information by given VIN, along with marketing content. This includes grade, exterior color, interior color and accessories. The same content is served on Toyota.com and Lexus.com Configurator sites.',                                        
        datatype: 'APIs', 
        classification: 'Confidential', 
        intendedUse: 'Not required for products with a data classification of Public or Protected',  
        dataSteward: 'Omar Casas',                                                       
        dataStewardEmail: 'omar.casas@toyota.com',                                       
        pocName: 'Terence Takeguchi',                                                    
        pocEmail: 'terence.takeguchi@toyota.com',
        businessName: '',
        businessNameEmail: '',
        businessSME: '',
        businessSMEEmail: '',
        resourceName: 'API Catalog',                                                             
        resourceURL: 'https://developer.apic.toyota.com/tmna/prod/user/login', 
        price: 0.00, 
        sku: '280600108', 
        images: [
            'inventory_information_efc.jpg'
        ],
        badges: [
            'new',
            'hot',
            'sale'

        ],
        rating: 0,
        reviews: 0,
        platformType: 'Apigee',
        platformBranding: 'brandix',
        org: 'tmna',
        keyword: [
            'new-car-sales', 
            'business-analytics', 
            'tableau'
        ],
        categories: [
            'Vehicle', 
            'Master Data', 
        ], 
        attributes: [
            { slug: 'color',             values: 'yellow' },
            { slug: 'speed',             values: '750-rpm',           featured: true },
            { slug: 'power-source',      values: 'cordless-electric', featured: true },
            { slug: 'battery-cell-type', values: 'lithium',           featured: true },
            { slug: 'voltage',           values: '20-volts',          featured: true },
            { slug: 'battery-capacity',  values: '2-Ah',              featured: true },
        ],                                                                                                      
        oneTSDomain: 'Vehicles',                                                   
        controlGroup: '966f578fdbd3081012b941a405961984',  
        adGroup: '',                                                                                                                                                                                                                                                             
        userType: 'TMNA Users',                                                    
        accessType: 'User Access',                                                
        dataAccessType: 'read',                                                   
        platform: 'API (EIG Application Support)',                                 
        routeIdentifier: '4',                                                      
        env: 'Prod',                                                               
        pii: false,  
        // docData: [
        //     { "docid": 1, "name": "", "src": "", "image": "", },
        // ],                                                                                                                                                                                   
        sampleData: [
            { "sampleid": 1, "axonid": null, "name": "Region", "value": "All", "sort": "A"},
            { "sampleid": 1, "axonid": null, "name": "Fleet Indicator", "value": "Non-Fleet", "sort": "B" },
            { "sampleid": 1, "axonid": null, "name": "Hybrid Indicator", "value": "All", "sort": "C" },
            { "sampleid": 1, "axonid": null, "name": "Series Group", "value": "Total Camry", "sort": "D" },
            { "sampleid": 1, "axonid": null, "name": "Series", "value": "Camry Sedan", "sort": "E" },
            { "sampleid": 1, "axonid": null, "name": "Selling Year", "value": "2007", "sort": "F" },
            { "sampleid": 1, "axonid": null, "name": "Passenger Car Sales", "value": "1,305,721", "sort": "G" },
            { "sampleid": 1, "axonid": null, "name": "Light Truck Sales", "value": "969,155", "sort": "H" },
            { "sampleid": 1, "axonid": null, "name": "Total Light Vehicle Sales", "value": "2,274,876", "sort": "I" }
        ]                                                            
    },        
];

// const productsDef: ProductDef[] = [];
// export const attributesDef: AttributeDef[] = [];

export const products: Product[] = productsDef.map(productDef => {
    let badges: string[] = [];

    if (productDef.badges) {
        badges = typeof productDef.badges === 'string' ? [productDef.badges] : productDef.badges;
    }

    const categories: Category[] = shopCategoriesList.filter(x => productDef.categories.includes(x.slug)).map(x => ({
        ...x,
        parents: null,
        children: null,
    }));

    const attributes: ProductAttribute[] = (productDef.attributes || []).map(productAttributeDef => {
        const attributeDef = attributesDef.find(x => x.slug === productAttributeDef.slug);

        if (!attributeDef) {
            return null;
        }

        let valuesDef: string[] = [];

        if (typeof productAttributeDef.values === 'string') {
            valuesDef = [productAttributeDef.values];
        } else if (productAttributeDef.values) {
            valuesDef = productAttributeDef.values;
        }

        const values: ProductAttributeValue[] = valuesDef.map(valueSlug => {
            const valueDef = attributeDef.values.find(x => x.slug === valueSlug);

            if (!valueDef) {
                return null;
            }

            return {
                ...valueDef,
                customFields: {},
            };
        }).filter(x => x !== null) as ProductAttributeValue[];

        if (!values.length) {
            return null;
        }

        return {
            name: attributeDef.name,
            slug: attributeDef.slug,
            featured: !!productAttributeDef.featured,
            values,
            customFields: {},
        };
    }).filter(x => x !== null) as ProductAttribute[];

    return {
        id: ++lastProductId,
        name: productDef.name,
        briefDesc: productDef.briefDesc,
        shortDesc: productDef.shortDesc,
        datatype: productDef.datatype,
        slug: productDef.slug,
        price: productDef.price,
        sku: productDef.sku,
        classification: productDef.classification,
        intendedUse: productDef.intendedUse,
        dataSteward: productDef.dataSteward,
        dataStewardEmail: productDef.dataStewardEmail,
        pocName: productDef.pocName,
        pocEmail: productDef.pocEmail,
        businessName: productDef.businessName,
        businessNameEmail: productDef.businessNameEmail,
        businessSME: productDef.businessSME,
        businessSMEEmail: productDef.businessSMEEmail,
        resourceName: productDef.resourceName,
        resourceURL: productDef.resourceURL,
        userType: productDef.resourceURL,
        accessType: productDef.accessType,
        dataAccessType: productDef.dataAccessType,
        oneTSDomain: productDef.oneTSDomain,
        controlGroup: productDef.controlGroup,
        adGroup: productDef.adGroup,
        routeIdentifier: productDef.routeIdentifier,
        platform: productDef.platform,
        pii: productDef.pii,
        env: productDef.env,
        compareAtPrice: productDef.compareAtPrice || null,
        images: productDef.images.slice(),
        badges: badges.slice(),
        //badges,
        rating: productDef.rating,
        reviews: productDef.reviews,
        platformType: productDef.platformType,
        platformBranding: brands.find(x => x.slug === productDef.platformBranding) || null,
        //keywords: keywords.find(x => x.slug === productDef.keyword) || null,
        org: affiliates.find(x => x.slug === productDef.org) || null,
        categories,
        keywords,
        sampleData: productDef.sampleData || [],
        attributes,
        customFields: {},
    };
});

export function getBestsellers(limit: number|null = null): Observable<Product[]> {
    const start = 0;
    const end = limit ? start + limit : undefined;

    return of(products.slice(start, end));
}

export function getTopRated(limit: number|null = null): Observable<Product[]> {
    const start = 3;
    const end = limit ? start + limit : undefined;

    return of(products.slice(start, end));
}

export function getSpecialOffers(limit: number|null = null): Observable<Product[]> {
    const start = 6;
    const end = limit ? start + limit : undefined;

    return of(products.slice(start, end));
}

export function getFeatured(categorySlug: string|null = null, limit: number|null = null): Observable<Product[]> {
    let fakeProducts = products.slice();

    if (categorySlug === 'power-tools') {
        fakeProducts = fakeProducts.reverse();
    } else if (categorySlug === 'hand-tools') {
        fakeProducts = [...fakeProducts.slice(8), ...fakeProducts.slice(0, 8)];
    } else if (categorySlug === 'plumbing') {
        fakeProducts = [...fakeProducts.slice(8), ...fakeProducts.slice(0, 8)].reverse();
    }

    return timer(1000).pipe(map(() => fakeProducts.slice(0, limit || undefined)));
}

export function getLatestProducts(categorySlug: string|null = null, limit: number|null = null): Observable<Product[]> {
    return getFeatured(categorySlug, limit);
}

// noinspection JSUnusedLocalSymbols
export function getRelatedProducts(product: Partial<Product>): Observable<Product[]> {
    return of(products.slice(0, 7));
}

export function getSuggestions(query: string, limit: number, categorySlug: string|null = null): Observable<Product[]> {
    return of(products.filter(x => (x.briefDesc).toLowerCase().includes(query.toLowerCase())).slice(0, limit));
}

export function getProduct(productSlug: string): Observable<Product> {
    const product = products.find(x => x.slug === productSlug);

    if (!product) {
        return throwError(new HttpErrorResponse({status: 404, statusText: 'Page Not Found'}));
    }

    return of(JSON.parse(JSON.stringify(product)));
}
