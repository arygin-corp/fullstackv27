import { Brand } from './brand';
import { Organization } from './organization';
import { Category } from './category';
import { CustomFields } from './custom-fields';
import { Keyword } from './keyword';
export interface ProductFeature {
    name: string;
    value: string;
}

export interface Description {
    name: string;
    description: Product[];
}

export interface Resource {
    name: string;
    features: ProductFeature[];
}

export interface Sample {
    name: string;
    features: ProductFeature[];
}

export interface Reviews {
    name: string;
    features: ProductFeature[];
}

export interface Documentation {
    name: string;
    features: ProductFeature[];
}

export interface ProductFeaturesSection {
    name: string;
    features: ProductFeature[];
}

export interface ProductAttributeValue {
    name: string;
    slug: string;
    customFields: CustomFields;
}

export interface ProductAttribute {
    name: string;
    slug: string;
    featured: boolean;
    values: ProductAttributeValue[];
    customFields: CustomFields;
}

export interface ProductContact {
    name: string;
    email: string;
}

export interface Product {
    id: number;
    images: string[];
    name: string;
    slug: string;
    brief_desc: string;
    whats_included?: string;
    intended_use_desc?: string;
    short_desc: string;

    // ProductSerializer returns domain.name, not Category[].
    domain: string;
    subdomain_2: string;
    subdomain_3: string;

    datatype: string;
    classification: string;
    catalog: string;
    intended_use: string;

    // ProductSerializer uses ContactSerializer for these values.
    data_steward?: ProductContact | null;
    alt_approver?: { id: number; name: string; sys_id: string } | null;
    poc_name?: ProductContact | null;
    business_contact?: ProductContact | null;
    business_sme?: ProductContact | null;

    business_contact_name?: string;
    resource: string;
    resource_url: string;
    original_name: string;
    route_identifier: string;
    price: number;
    compareAtPrice: number | null;
    sku: string;
    badges: string[];
    org: Organization | null;
    keywords: Keyword[];
    attributes: ProductAttribute[];
    one_ts_domain: string;
    rating: number;
    reviews: number;
    platform: string;
    ad_group: string;
    control_group: string;
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
    team: string;
    data_review_board: boolean;
    data_review_required: boolean;
    data_review_status: string;
    data_review_team: string;
    cwpg_status: string;
    status: string;
    is_active: boolean;
    verified: boolean;
    customFields: CustomFields;
    highlights?: { kind: string; label: string; value: string }[];
}
