export interface Contact {
  name: string;
  email: string;
}

export interface SampleData {
  glossary_id_1?: string;
  field_name_1?: string;
  field_value_1?: string;
  glossary_id_2?: string;
  field_name_2?: string;
  field_value_2?: string;
  glossary_id_3?: string;
  field_name_3?: string;
  field_value_3?: string;
  glossary_id_4?: string;
  field_name_4?: string;
  field_value_4?: string;
  glossary_id_5?: string;
  field_name_5?: string;
  field_value_5?: string;
  glossary_id_6?: string;
  field_name_6?: string;
  field_value_6?: string;
  glossary_id_7?: string;
  field_name_7?: string;
  field_value_7?: string;
  glossary_id_8?: string;
  field_name_8?: string;
  field_value_8?: string;
  glossary_id_9?: string;
  field_name_9?: string;
  field_value_9?: string;
  glossary_id_10?: string;
  field_name_10?: string;
  field_value_10?: string;
  is_active?: boolean;
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
  sample_data: SampleData[];
  images: string[];
}