export type FieldType = 'text'|'email'|'integer'|'decimal'|'date'|'datetime'|'textarea'|'select'|'multiselect'|'radio'|'checkbox'|'static_text'|'user_lookup'|'hidden';

export interface Choice { 
    value: string; 
    label: string; 
}

export interface DarValidation { 
    validation_type: string; 
    validation_value?: any; 
    error_message?: string; 
    is_active?: boolean; 
    order?: number; 
}

export interface DarRule {
  id?: number;
  source_key: string;
  target_key: string;
  operator: string;
  comparison_value?: any;
  action?: string;
  action_type?: string;
  action_value?: any;
  is_active?: boolean;
  order?: number;
}

export interface DarRuleGroup { 
    evaluation_mode: 'all'|'any'; 
    priority?: number; 
    is_active?: boolean; 
    rules?: DarRule[]; 
    actions?: DarRule[]; 
}

export interface DarState { 
    hidden: boolean; 
    required: boolean; 
    disabled: boolean; 
    read_only: boolean; 
    value: any; 
}

export interface DarField {
  key: string;
  label: string;
  field_type: FieldType;
  required?: boolean;
  help_text?: string;
  placeholder?: string;
  error_message?: string;
  default_value?: any;
  options?: Choice[];
  min_length?: number;
  max_length?: number;
  regex_pattern?: string;
  max_selected_items?: number;
  disabled?: boolean;
  read_only?: boolean;
  hidden?: boolean;
  validations?: DarValidation[];
  external_source?: string;
  metadata?: Record<string, any>;
}


export interface DarRuleGroup {
  id?: number;
  name?: string;
  evaluation_mode: 'all' | 'any';
  priority?: number;
  is_active?: boolean;
  rules?: DarRule[];
  actions?: DarRule[];
}

export interface DarSection { 
    title?:string; 
    description?:string; 
    section_fields:DarField[]; 
}

export interface DarSchema {
  name: string;
  slug?: string;
  description?: string;
  version?: string | number;
  schema_version?: string;
  sections: DarSection[];
  unsectioned_fields?: DarField[];
  rule_groups?: DarRuleGroup[];
  success_title?: string;
  success_message?: string;
}

export interface DarSubmitResponse { 
    id?:string|number; 
    request_number?:string; 
    status?:string; 
    routing?:Record<string,any>; 
    message?:string; 
    redirect_url?:string; 
}
