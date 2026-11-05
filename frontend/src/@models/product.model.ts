export interface Contact {
  name: string;
  email: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  short_desc: string;
  brief_desc: string;
  catalog: string; 
  resource_url: string;
  original_name: string | null;
  price: string;
  pi: string;
  sensitive_pi: string | null;
  usertype: string;
  access_type: string;
  environment: string;
  data_access_type: string;
  availability: string;
  frequency: string;
  hide_me: string;
  max: string;
  is_active: boolean;
  data_review_required: boolean;
  data_review_status: string | null;
  data_review_team: string | null;
  cwpg_status: string;
  status: string;
  domain: string;
  subdomain_2: string;
  subdomain_3: string;
  datatype: string;
  classification: string;
  org: string;
  route_identifier: any[];
  one_ts_domain: string;
  platform: string;
  ad_group: string | null;
  fulfillment_group: string | null;
  data_steward: Contact | null;
  poc_name: Contact | null;
  business_contact: Contact | null;
  business_sme: Contact | null;
  badges: string[];
  keywords: string[];
  images: string[];
}