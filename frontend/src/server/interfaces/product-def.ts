export interface AttributeValueDef {
    name: string;
    slug: string;
}

export interface AttributeDef {
    name: string;
    slug: string;
    values: AttributeValueDef[];
}

export interface ProductAttributeDef {
    slug: string;
    values: string[]|string;
    active?: true;
    endorsed?: true;
    published?: true;
    prime?: true;
    sensitive?: true;
    pii?: true;
    featured?: true;
}

// export interface ProductDef {
//     id: number;
//     name: string;
//     slug: string;
//     briefDesc: string;
//     shortDesc: string;
//     datatype: string;
//     classification: string;
//     intendedUse: string;
//     dataSteward: string;
//     dataStewardEmail: string;
//     pocName: string;
//     pocEmail: string;
//     businessName: string;
//     businessNameEmail: string;
//     businessSME: string;
//     businessSMEEmail: string;
//     resourceName: string;
//     resourceURL: string;
//     userType: string;
//     accessType: string;
//     dataAccessType: string;
//     oneTSDomain: string;
//     controlGroup: string;
//     adGroup: string;
//     routeIdentifier: string;
//     platform: string;
//     pii: boolean;
//     env: string;
//     sku: string;
//     price: number;
//     compareAtPrice?: number;
//     images: string[];
//     badges?: string|string[];
//     keyword?: string[]|string[];
//     rating: number;
//     reviews: number;
//     platformType: string;
//     platformBranding?: string;
//     team?: string;
//     org?: string;
//     categories: string[];
//     attributes?: ProductAttributeDef[];
//     sampleData?: SampleDataDef[];
// }

export interface Product {
    id: number;
    images: string[];
    name: string;
    slug: string;
    brief_desc: string;
    short_desc: string;
    domain?: string[];
    subdomain_2?: string[];
    subdomain_3?: string[];
    datatype: string;
    classification: string;
    intended_use: string;
    data_steward: string;
    poc_name: string;
    business_contact_name: string;
    business_sme: string;
    resource?: {
        id: number;
        catalog: string;
        image: string;
        type: string;
        name: string;
        original_name: string;
        url: string;
    } | null;
    original_name: string;
    route_identifier: string;
    price: number;
    compareAtPrice: number|null;
    sku: string;
    badges: string[];
    org?: string;
    keyword?: string[]|string[];
    attributes: string[];
    one_ts_domain: string;
    control_group: string;
    rating: number;
    reviews: number;
    platform: string;
    ad_group: string;
    fulfillment_group: string;
    pi: string;
    sensitive_pi: string;
    usertype: string;
    access_type: string;
    environment: string;
    data_access_type: string;
    availability: string;
    frequency: string;
    hide_me: string;
    max: string;
    team?: string;
    data_review_board: boolean;
    data_review_required: boolean;
    data_review_status: string;
    data_review_team: string;
    cwpg_status: string;
    status: string;
    is_active: boolean;
    verified: boolean;
    sampleData?: SampleDataDef[];
}


export interface SampleDataDef {
    sampleid: number;
    axonid: number;
    name: string;
    value: string;
    sort: string;
}
