import { DomainDef } from '../interfaces/domain-def';
import { Domain } from '../../app/@shared/interfaces/domain';
import { Observable, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

let lastDomainId = 0;

const shopDomainsDef: DomainDef[] = [
    {
        "name": "Vehicle",
        "slug": "vehicle",
        "image": "",
        "desc": "",
        "items": 10,
        "children": [
            {
                "name": "Sales",
                "slug": "sales",
                "image": "",
                "desc": "",
                "items": 3,
                "children": [
                    {
                        "name": "Integrated Revenue & Cost Management",
                        "slug": "integrated-revenue-&-cost-managemnt",
                        "image": "",
                        "desc": "",
                        "items": 29
                    },
                    {
                        "name": "New Car Sales",
                        "slug": "new-car-sales",
                        "image": "",
                        "desc": "",
                        "items": 13
                    },
                    {
                        "name": "Used Car Sales",
                        "slug": "used-car-sales",
                        "image": "",
                        "desc": "",
                        "items": 2
                    }
                ]
            },
            {
                "name": "Master Data",
                "slug": "master-data",
                "image": "",
                "desc": "",
                "items": 29
            },
            {
                "name": "Vehicle Logistics Management",
                "slug": "vehicle-logistics-management",
                "image": "",
                "desc": "",
                "items": 16
            },
            {
                "name": "Configuration",
                "slug": "configuration",
                "image": "",
                "desc": "",
                "items": 12
            },
            {
                "name": "Pricing",
                "slug": "pricing",
                "image": "",
                "desc": "",
                "items": 5
            },
            {
                "name": "Incentive",
                "slug": "incentive",
                "image": "",
                "desc": "",
                "items": 2,
                "children": [
                    {
                        "name": "Actuals",
                        "slug": "actuals",
                        "image": "",
                        "desc": "",
                        "items": 4
                    },
                    {
                        "name": "Forecast",
                        "slug": "forecast",
                        "image": "",
                        "desc": "",
                        "items": 1
                    }
                ]
            },
            {
                "name": "Orders",
                "slug": "orders",
                "image": "",
                "desc": "",
                "items": 2,
                "children": [
                    {
                        "name": "Order Actuals",
                        "slug": "order-actuals",
                        "image": "",
                        "desc": "",
                        "items": 2
                    },
                    {
                        "name": "Order Forecast",
                        "slug": "order-forecast",
                        "image": "",
                        "desc": "",
                        "items": 1
                    }
                ]
            },
            {
                "name": "Inventory Volume",
                "slug": "inventory-volume",
                "image": "",
                "desc": "",
                "items": 2
            },
            {
                "name": "Factors",
                "slug": "factors",
                "image": "",
                "desc": "",
                "items": 1
            },
            {
                "name": "Planning",
                "slug": "planning",
                "image": "",
                "desc": "",
                "items": 1
            }
        ]
    },
    {
        "name": "Customer",
        "slug": "customer",
        "image": "",
        "desc": "",
        "items": 9,
        "children": [
            {
                "name": "Customer Predictive Score",
                "slug": "customer-predictive-score",
                "image": "",
                "desc": "",
                "items": 38
            },
            {
                "name": "Customer Master",
                "slug": "customer-master",
                "image": "",
                "desc": "",
                "items": 9
            },
            {
                "name": "Contact Center",
                "slug": "contact-center",
                "image": "",
                "desc": "",
                "items": 1,
                "children": [
                    {
                        "name": "Customer Interaction",
                        "slug": "customer-interation",
                        "desc": "",
                        "items": 2
                    }
                ]
            },
            {
                "name": "California Consumer Privacy Act (CCPA)",
                "slug": "california-consumer-privacy-act",
                "image": "",
                "desc": "",
                "items": 2
            },
            {
                "name": "Communication Management",
                "slug": "communication-management",
                "image": "",
                "desc": "",
                "items": 1
            },
            {
                "name": "Customer Marketing",
                "slug": "customer-marketing",
                "image": "",
                "desc": "",
                "items": 1
            },
            {
                "name": "Parts E-Commerce",
                "slug": "parts-e-commerce",
                "image": "",
                "desc": "",
                "items": 1
            },
            {
                "name": "Customer - Dealer Relationship",
                "slug": "customer-dealer-relationship",
                "image": "",
                "desc": "",
                "items": 1
            },
            {
                "name": "Vehicle Purchase Details",
                "slug": "vehicle-purchase-details",
                "image": "",
                "desc": "",
                "items": 1
            }
        ]
    },
    {
        "name": "Service Parts & Accessories",
        "slug": "service-parts-&-accessories",
        "image": "",
        "desc": "",
        "items": 4,
        "children": [
            {
                "name": "Direct Parts",
                "slug": "direct-parts",
                "image": "",
                "desc": "",
                "items": 1,
                "children": [
                    {
                        "name": "Manufacturing Parts",
                        "slug": "manufacturing-parts",
                        "image": "",
                        "desc": "",
                        "items": 10
                    }
                ]
            },
            {
                "name": "Parts Logistics Management",
                "slug": "parts-logistics-management",
                "image": "",
                "desc": "",
                "items": 9
            },
            {
                "name": "Indirect Parts",
                "slug": "indirect-parts",
                "image": "",
                "desc": "",
                "items": 1,
                "children": [
                    {
                        "name": "Accessory Parts",
                        "slug": "accessory-parts",
                        "image": "",
                        "desc": "",
                        "items": 4
                    }
                ]
            },
            {
                "name": "Parts Distribution Center",
                "slug": "parts-distribution-center",
                "image": "",
                "desc": "",
                "items": 1
            }
            
        ]
    },
    {
        "name": "Telematics",
        "slug": "telematics",
        "image": "",
        "desc": "",
        "items": 21
    },
    {
        "name": "Finance Management & Accounting",
        "slug": "finance-management-&-accounting",
        "image": "",
        "desc": "",
        "items": 1,
        "children": [
            {
                "name": "Transactions",
                "slug": "transaction",
                "image": "",
                "desc": "",
                "items": 8
            },
            {
                "name": "Accounting Master",
                "slug": "accounting-master",
                "image": "",
                "desc": "",
                "items": 8
            },
            {
                "name": "Accounting Inovice",
                "slug": "accounting-invoice",
                "image": "",
                "desc": "",
                "items": 1
            }
        ]
    },
    {
        "name": "Manufacturing",
        "slug": "manufacturing",
        "image": "",
        "desc": "",
        "items": 1,
        "children": [
            {
                "name": "Productivity",
                "slug": "productivity",
                "image": "",
                "desc": "",
                "items": 15
            }
        ]
    },
    {
        "name": "Quality",
        "slug": "quality",
        "image": "",
        "desc": "",
        "items": 3,
        "children": [
            {
                "name": "Product Quality Campaigns",
                "slug": "product-quality-campaigns",
                "image": "",
                "desc": "",
                "items": 6
            },
            {
                "name": "Reports",
                "slug": "reports",
                "image": "",
                "desc": "",
                "items": 4
            },
            {
                "name": "Diagnostics",
                "slug": "dianogstics",
                "image": "",
                "desc": "",
                "items": 1
            }
        ]    
    },
    {
        "name": "Distributor / Region/ Dealer",
        "slug": "distributor-region-dealer",
        "image": "",
        "desc": "",
        "items": 3,
        "children": [
            {
                "name": "Master Data",
                "slug": "master-data",
                "image": "",
                "desc": "",
                "items": 7
            },
            {
                "name": "Dealership Metrics",
                "slug": "dealership-metrics",
                "image": "",
                "desc": "",
                "items": 2
            },
            {
                "name": "Dealer Personnel",
                "slug": "dealer-personnel",
                "image": "",
                "desc": "",
                "items": 1
            }
        ]    
    },
    {
        "name": "Warranty",
        "slug": "warranty",
        "image": "",
        "desc": "",
        "items": 201,
        "children": [
            {
                "name": "Warranty Claims",
                "slug": "warranty-claims",
                "image": "",
                "desc": "",
                "items": 7
            },
            {
                "name": "Parts Claims",
                "slug": "parts-claims",
                "image": "",
                "desc": "",
                "items": 1
            },
            {
                "name": "Warranty Insurance",
                "slug": "warrany-insurance",
                "image": "",
                "desc": "",
                "items": 1
            }
        ]    
    },
    {
        "name": "Service History",
        "slug": "service-history",
        "image": "",
        "desc": "",
        "items": 7
    },
    {
        "name": "Survey",
        "slug": "survey",
        "image": "",
        "desc": "",
        "items": 5
    },
    {
        "name": "Facilities",
        "slug": "facilities",
        "image": "",
        "desc": "",
        "items": 1
    },
    {
        "name": "Marketing",
        "slug": "marketing",
        "image": "",
        "desc": "",
        "items": 1
    },
    {
        "name": "Identity Management",
        "slug": "identity-management",
        "image": "",
        "desc": "",
        "items": 1
    },
    {
        "name": "Social Media",
        "slug": "social-media",
        "image": "",
        "desc": "",
        "items": 1
    },
    {
        "name": "Human Resources",
        "slug": "human-resources",
        "image": "",
        "desc": "",
        "items": 1
    }
];

function walkTree(categoriesType: 'shop', domainsDef: DomainDef[], parents: Domain[] = []): [Domain[], Domain[]] {
    let list: Domain[] = [];
    const tree: Domain[] = domainsDef.map(domainDef => {
        const domain: Domain = {
            id: ++lastDomainId,
            type: domainsType,
            name: domainDef.name,
            desc: domainDef.desc,
            slug: domainDef.slug,
            path: [...parents.map(x => x.slug), domainDef.slug].join('/'),
            image: domainDef.image || null,
            items: domainDef.items || 0,
            customFields: {},
            parents: parents.slice(),
            children: [],
        };

        const [childrenTree, childrenList] = walkTree(domainsType, domainDef.children || [], [...parents, domain]);

        domain.children = childrenTree;
        list = [...list, domain, ...childrenList];

        return domain;
    });

    return [tree, list];
}

export const [shopDomainsTree, shopDomainsList]: [Domain[], Domain[]] = walkTree('shop', shopDomainsDef);

function limitDepth(categories: Domain[], depth: number): Domain[] {
    return domains.map(domain => {
        return {
            ...domain,
            parents: null,
            children: depth !== 0 ? limitDepth(domain.children || [], depth - 1) : null,
        };
    });
}

function getDomainsTree(domainsType: 'shop', parentSlug: string|null = null, depth: number = 0): Observable<Domain[]> {
    let domains = [];

    if (parentSlug === null) {
        domains = tree.slice();
    } else {
        const parent = list.find(x => x.slug === parentSlug);

        if (!parent) {
            return throwError(new HttpErrorResponse({status: 404, statusText: 'Page Not Found'}));
        }

        domains = (parent.children || []).slice();
    }

    return of(limitDepth(domains, depth));
}

export function getShopDomainsTree(parentSlug: string|null = null, depth: number = 0): Observable<Domain[]> {
    return getDomainsTree('shop', parentSlug, depth);
}

export function getShopDomainsBySlugs(slugs: string[], depth: number = 0): Observable<Domain[]> {
    return of(limitDepth(shopDomainsList.filter(x => slugs.includes(x.slug)), depth));
}

export function getShopDomain(slug: string): Observable<Domain> {
    const category = shopDomainsList.find(x => x.slug === slug);

    if (!category) {
        return throwError(new HttpErrorResponse({status: 404, statusText: 'Page Not Found'}));
    }

    return of(JSON.parse(JSON.stringify({
        ...category,
        parents: limitDepth(category.parents || [], 0),
        children: limitDepth(category.children || [], 0),
    })));
}
