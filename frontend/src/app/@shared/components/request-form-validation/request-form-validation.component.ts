import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-request-form-validation',
  templateUrl: './request-form-validation.component.html',
  styleUrls: ['./request-form-validation.component.scss']
})

export class RequestFormValidationComponent implements OnInit {
  form: any;

  constructor() { }

  ngOnInit(): void {
  }

  // User validation
  isUserValid(): boolean {
    const user = this.form.get('requesting_id')?.value;
    const validUser = [
      'Me',
    ];
    return validUser.includes(user);
  }

  // Platform validation
  isPlatformValid(): boolean {
    const platform = this.form.get('v_dar_platform')?.value;
    const validPlatforms = [
      'API (EIG Application Support)', 'My SQL', 'PostgreSQL', 'SQL',
      'TBDP (IRM, PASA, C360, Q360, IRM-Pricing, etc.)', 'Cloud (AWS)',
      'Cloud (Azure)', 'Mainframe (DB2, IMS, CICS, Flat files, Reports, etc.)',
      'Data Warehouse/Mart (VDW, FDW, FDM, NDW, etc.)',
      'Gateway Access Request (PowerBI, Tableau, Alteryx, etc)',
      'Oracle (Non-Data Warehouse, MDW, TOMS, Customer Central, etc.)', 'Other'
    ];
    return validPlatforms.includes(platform);
  }

  // Data domain validation
  isDataDomainValid(): boolean {
    const dataDomain = this.form.get('v_dar_dataDomainSelect')?.value;
    const validDomains = [
      'Customer', 'Dealer Identity', 'Dealership', 'Digital Assets',
      'Finance', 'Identity Access Management', 'Manufacturing',
      'Manufacturing Parts', 'Product Quality', 'Research and Development',
      'Service History', 'Service Parts and Accessories', 'Telematics',
      'Vehicles', 'Warranty'
    ];
    return validDomains.includes(dataDomain);
  }

  // User access validation
  isUserAccessValid(): boolean {
    const userType = this.form.get('v_dar_userType')?.value;
    return ['TMNA User', 'TMNA Affiliates', 'External User'].includes(userType);
  }

  // Access type validation
  isAccessTypeValid(): boolean {
    const accessType = this.form.get('v_dar_accessType')?.value;
    return [
      'User Requested Access (Individual is directly accessing the data)',
      'Application Requested Access (Program/System is accessing the data; non-human actor)'
    ].includes(accessType);
  }

  // System access validation
  isSystemAccessRequired(): boolean {
    const platform = this.form.get('v_dar_platform')?.value;
    const dataDomain = this.form.get('v_dar_dataDomainSelect')?.value;
    return platform === 'Mainframe (DB2, IMS, CICS, Flat files, Reports, etc.)' && 
          (dataDomain === 'Manufacturing' || dataDomain === 'Manufacturing Parts');
  }

  // Mainframe access validation
  isMainframeAccessRequired(): boolean {
    return this.form.get('v_dar_platform')?.value === 'Mainframe (DB2, IMS, CICS, Flat files, Reports, etc.)';
  }

  // Other platform validation
  isOtherPlatformRequired(): boolean {
    return this.form.get('v_dar_platform')?.value === 'Other' && 
          this.form.get('v_dar_bi_data_access_type')?.value !== 'Other';
  }

  // Gateway other validation
  isGatewayOtherRequired(): boolean {
    return this.form.get('v_dar_bi_data_access_type')?.value === 'Other';
  }

  // Oracle other validation
  isOracleOtherRequired(): boolean {
    return this.form.get('v_dar_select_an_oracle_access_type')?.value === 'Other (Non-warehouse)';
  }

  // API name validation
  isApiNameRequired(): boolean {
    return this.form.get('v_dar_platform')?.value === 'API (EIG Application Support)';
  }

  // Data warehouse validation
  isDataWarehouseRequired(): boolean {
    return this.form.get('v_dar_platform')?.value === 'Data Warehouse/Mart (VDW, FDW, FDM, NDW, etc.)';
  }

  // Gateway access validation
  isGatewayAccessRequired(): boolean {
    const platform = this.form.get('v_dar_platform')?.value;
    const biType = this.form.get('v_dar_bi_data_access_type')?.value;
    return platform === 'Gateway Access Request (PowerBI, Tableau, Alteryx, etc)' && !biType;
  }

  // Oracle access validation
  isOracleAccessRequired(): boolean {
    return this.form.get('v_dar_platform')?.value === 'Oracle (Non-Data Warehouse, MDW, TOMS, Customer Central, etc.)';
  }

  // Database schema validation
  isDatabaseSchemaRequired(): boolean {
    const platform = this.form.get('v_dar_platform')?.value;
    const biType = this.form.get('v_dar_bi_data_access_type')?.value;
    const excludedBiTypes = ['Alteryx', 'Other', 'PowerBI', 'Tableau'];
    
    return ['My SQL', 'PostgreSQL', 'SQL', 'TBDP (IRM, PASA, C360, Q360, IRM-Pricing, etc.)'].includes(platform) && 
          !excludedBiTypes.includes(biType);
  }

  // Gateway database validation
  isGatewayDatabaseRequired(): boolean {
    return this.form.get('v_dar_platform')?.value === 'Gateway Access Request (PowerBI, Tableau, Alteryx, etc)';
  }

  // Table names validation
  isTableNamesRequired(): boolean {
    const platform = this.form.get('v_dar_platform')?.value;
    return ['My SQL', 'PostgreSQL', 'SQL', 'TBDP (IRM, PASA, C360, Q360, IRM-Pricing, etc.)'].includes(platform);
  }

  // Environment validation
  isEnvironmentRequired(): boolean {
    const mainframeType = this.form.get('v_dar_mainframe_access_type')?.value;
    const excludedTypes = [
      'Mainframe Report Access', 'Mainframe Flat File Access', 'Mainframe TSO ID',
      'Mainframe Service Account', 'ChangeMan Approval Authority'
    ];
    return !excludedTypes.includes(mainframeType);
  }

  isEnvironmentValid(): boolean {
    const environment = this.form.get('v_dar_environment')?.value;
    return ['QA', 'Dev', 'Prod', 'All'].includes(environment);
  }

  // Data access validation
  isDataAccessRequired(): boolean {
    const mainframeType = this.form.get('v_dar_mainframe_access_type')?.value;
    const dataAccessType = this.form.get('v_dat_data_access_type')?.value;
    const flatAccessType = this.form.get('v_dat_data_access_type_flat')?.value;
    
    const excludedMainframeTypes = [
      'ChangeMan Approval Authority', 'Mainframe TSO ID', 'Mainframe Service Account',
      'DB2 Plan Access', 'DB2 Table Access', 'IMS Access', 'Other', 'IMS ID',
      'Mainframe Report Access', 'TWS/OPC Scheduling Access'
    ];
    
    return !excludedMainframeTypes.includes(mainframeType) && 
          !dataAccessType && !flatAccessType;
  }

  isDataAccessValid(): boolean {
    const dataAccessType = this.form.get('v_dat_data_access_type')?.value;
    const flatAccessType = this.form.get('v_dat_data_access_type_flat')?.value;
    
    const validTypes = ['read', 'modify', 'insert', 'update', 'delete', 'privileged', 'na'];
    const validFlatTypes = ['Read', 'Write', 'Create/Delete'];
    
    return validTypes.includes(dataAccessType) || validFlatTypes.includes(flatAccessType);
  }

  // PII validation
  isPIIValid(): boolean {
    const piiAccess = this.form.get('v_emd_PI_access')?.value;
    
    if (piiAccess === 'No') return true;
    
    if (piiAccess === 'Yes') {
      const personalDetails = this.form.get('edm_PI_personal_details')?.value;
      const piiNeeds = this.form.get('v_emd_specify_PII_needs')?.value;
      const workType = this.form.get('v_edm_type_of_work')?.value;
      const thirdParty = this.form.get('v_edm_3rd_party_vendor')?.value;
      
      if (personalDetails === 'No' && workType && thirdParty) return true;
      if (personalDetails === 'Yes' && piiNeeds?.length > 9 && workType && thirdParty) return true;
    }
    
    return false;
  }

}
