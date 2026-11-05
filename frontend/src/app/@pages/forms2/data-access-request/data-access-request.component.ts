import { Component, OnInit, ElementRef, Input, ViewChild, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AppService } from '../../../@shared/services/app.service';
import { environment } from '../../../../environments/environment';
import { SuggestedAiComponent } from '../../../@shared/components/suggested-ai/suggested-ai.component';
import { AiSuggestionService } from '../../../@shared/services/ai-suggestion.service';
import { debounceTime, distinctUntilChanged, filter, map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import moment from 'moment-business-days';

enum CheckBoxType { Grant, Revoke, None };

interface DbNameOption {
  dbname: string;
  label: string;
}

interface ElementInfo {
  column_name: string;
  elementname: string;
}

@Component({
  selector: 'app-data-access-request',
  templateUrl: './data-access-request.component.html',
  styleUrls: ['./data-access-request.component.scss']
})
export class DataAccessRequestComponent implements OnInit, OnDestroy {
  @ViewChild('suggestedAiModal', { static: false }) suggestedAiModal!: SuggestedAiComponent;

  // ============================================================================
  // AI DISCOVERY PROPERTIES - ADDED
  // ============================================================================
  suggestions: any[] = [];
  isSearching: boolean = false;
  private lastTriggerState: 'none' | 'standard' | 'verified' = 'none';

  // ============================================================================
  // EXISTING PROPERTIES (PRESERVED)
  // ============================================================================
  isAiThinking: boolean = false;
  searchQuery: string = '';
  dataRequestDescription: string = '';
  businessJustification: string = '';
  private componentIsDestroyed = false;
  private aiTimer: any;

  dbnames: DbNameOption[] = [];
  elements: ElementInfo[] = [];

  codes = [
    { id: '735de5d80fef39404758e388b1050eb0', name: 'U010 - Financial Developer IT Group' },
    { id: 'b35de5d80fef39404758e388b1050eb1', name: 'U011 - Financial User Group' },
    { id: 'ff5de5d80fef39404758e388b1050eb1', name: 'U012 - Financial User Group' },
    { id: '3f5de5d80fef39404758e388b1050eb2', name: 'U020 - Service/Warranty Developer IT Group' },
    { id: '7b5de5d80fef39404758e388b1050eb3', name: 'U021 - Service/Warranty User Group' },
    { id: 'b75de5d80fef39404758e388b1050eb4', name: 'U022 - Service/Warranty User Group' },
    { id: 'c06de5d80fef39404758e388b1050eb5', name: 'U023 - Service/Warranty User Group' },
    { id: '006de5d80fef39404758e388b1050eb6', name: 'U030 - TFS Insurance Services Developer' },
    { id: '4c6de5d80fef39404758e388b1050eb6', name: 'U031 - TFS Insurance Services Group' },
    { id: '886de5d80fef39404758e388b1050eb7', name: 'U040 - National Vehicle Developer IT Group' },
    { id: 'c46de5d80fef39404758e388b1050eb8', name: 'U041 - National Vehicle User Group' },
    { id: '8c6de5d80fef39404758e388b1050eba', name: 'U050 - TPNA/APS/Parts Developer IT Group' },
    { id: 'd86de5d80fef39404758e388b1050ebb', name: 'U061 - Technical Support Group' },
    { id: '9c6d29d80fef39404758e388b1050e38', name: 'U062 - Technical Support Group' },
    { id: 'd86d29d80fef39404758e388b1050e39', name: 'U063 - Technical Support Group' },
    { id: '186d29d80fef39404758e388b1050e3a', name: 'U070 - UOT Services Developer IT Group' },
    { id: '546d29d80fef39404758e388b1050e3b', name: 'U071 - UOT User Group' },
    { id: '906d29d80fef39404758e388b1050e3c', name: 'U072 - TMS/IS Business Management Group' },
    { id: 'ec6d29d80fef39404758e388b1050e3c', name: 'U073 - Enterprise SOX Group' },
    { id: '2c6d29d80fef39404758e388b1050e3d', name: 'U090 - Data Center Operations IT Group' },
    { id: '686d29d80fef39404758e388b1050e3e', name: 'U091 - Field Operation' },
    { id: 'a46d29d80fef39404758e388b1050e3f', name: 'U092 - Media Wall name:' },
    { id: '306d29d80fef39404758e388b1050e41', name: 'U09Y - SAIC Service Desk' },
    { id: '7c6d29d80fef39404758e388b1050e41', name: 'U0A0 - PeopleSoft Human Resources Developer' },
    { id: 'b86d29d80fef39404758e388b1050e42', name: 'U0A1 - PeopleSoft Human Resources User Group' },
    { id: 'f46d29d80fef39404758e388b1050e43', name: 'U0C0 - Customer relation Developer IT Group' },
    { id: '056d29d80fef39404758e388b1050e44', name: 'U0C1 - Customer relation User Group' },
    { id: '816d29d80fef39404758e388b1050e9c', name: 'U0C2 - Customer relation User Group' },
    { id: 'cd6d29d80fef39404758e388b1050e9c', name: 'U0C3 - Customer relation User Group' },
    { id: '1d6d29d80fef39404758e388b1050e9d', name: 'U0C4 - Customer relation User Group' },
    { id: '596d29d80fef39404758e388b1050e9e', name: 'U0C5 - Customer relation User Group' },
    { id: '956d29d80fef39404758e388b1050e9f', name: 'U0C5 - Customer relation User Group' },
    { id: 'e16d29d80fef39404758e388b1050ea0', name: 'U0D0 - Lexus Programmer Group' },
    { id: '216d29d80fef39404758e388b1050ea1', name: 'U0D1 - Lexus User Group' },
    { id: 'b96d29d80fef39404758e388b1050ea2', name: 'U0E0 - Human Resource Developer IT Group' },
    { id: 'f56d29d80fef39404758e388b1050ea3', name: 'U0E1 - Human Resource User Group' },
    { id: '356d29d80fef39404758e388b1050ea4', name: 'U0E2 - Human Resource User Group' },
    { id: '716d29d80fef39404758e388b1050ea5', name: 'U0E3 - Human Resource User Group' },
    { id: '8e6d29d80fef39404758e388b1050ea5', name: 'U0E4 - Human Resource User Group' },
    { id: 'ca6d29d80fef39404758e388b1050ea6', name: 'U0E5 - Human Resource User Group' },
    { id: '0a6d29d80fef39404758e388b1050ea7', name: 'U0E6 - Human Resource User Group' },
    { id: '9a6d69d80fef39404758e388b1050e94', name: 'U0E7 - Human Resource User Group' },
    { id: 'd66d69d80fef39404758e388b1050e95', name: 'U0F0 - Peoplesoft Functional Developer' },
    { id: '166d69d80fef39404758e388b1050e96', name: 'U0F1 - Peoplesoft User Group' },
    { id: '626d69d80fef39404758e388b1050e97', name: 'U0G0 - Telecommunications Support Group' },
    { id: 'ae6d69d80fef39404758e388b1050e97', name: 'U0H0 - TFS TMCC Developer IT Group' },
    { id: 'ea6d69d80fef39404758e388b1050e98', name: 'U0H1 - TFS TMCC User Group' },
    { id: '3a6d69d80fef39404758e388b1050e99', name: 'U0H2 - TFS TMCC User Group' },
    { id: '766d69d80fef39404758e388b1050e9a', name: 'U0J0 - Keane group Obsolete' },
    { id: 'b26d69d80fef39404758e388b1050e9b', name: 'U0K0 - NAPLD/APS/Parts Planning user Group' },
    { id: 'cf6d69d80fef39404758e388b1050e9b', name: 'U0L0 - General Programming (GPS) Develop' },
    { id: '0f6d69d80fef39404758e388b1050e9c', name: 'U0L1 - General Programming User Group' },
    { id: '4b6d69d80fef39404758e388b1050e9d', name: 'U0M0 - Dealer Developer IT Group' },
    { id: '976d69d80fef39404758e388b1050e9e', name: 'U0M1 - Dealer User Group' },
    { id: 'd36d69d80fef39404758e388b1050e9f', name: 'U0M2 - Dealer User Group' },
    { id: '136d69d80fef39404758e388b1050ea0', name: 'U0N0 - TIE/TIEQ Developer IT Group' },
    { id: '6f6d69d80fef39404758e388b1050ea0', name: 'U0N1 - TIE/TIEQ User Group' },
    { id: 'a36da9d80fef39404758e388b1050e05', name: 'U0N2 - TIE/TIEQ User Group' },
    { id: 'ff6da9d80fef39404758e388b1050e05', name: 'U0Q0 - Data Warehouse' },
    { id: '3f6da9d80fef39404758e388b1050e06', name: 'U0R0 - D & E Non Mainframe Distribution' },
    { id: '487da9d80fef39404758e388b1050e07', name: 'U0Y0 - NAPLD/APS/Parts Planning Developer' }
  ];

  currentApplicationVersion = environment.version;
  title = "Data Access Request Form";
  public homelink: boolean = true;
  profile: any;
  photo: any;
  id: any;
  isSelected: any;
  survey: any;
  input: any;
  isShow = false;
  fileToUpload: File | null = null;
  public shouldShow = false;
  public shouldHide = true;
  button = 'Submit Order';
  repos: any;
  interval: any;
  isLoading = false;
  isProcessing = false;
  clicked = false;
  buttons = {
    button1: {
      name: 'Button 1',
      loading: false
    },
    button2: {
      name: 'Button 2',
      loading: false
    },
    button3: {
      name: 'Button 3',
      loading: false
    },
  }
  requestID: any;

  form!: FormGroup;
  extraFields: any[] = [];
  private builderSaved = false;
  private builderFields: any[] = [];
  private builtInFieldNames = new Set<string>();
  add = false;
  delete = false;
  itemList: any[] = [];
  selectedItems: any[] = [];
  settings = {};
  check_box_type = CheckBoxType;
  currentlyChecked: CheckBoxType = CheckBoxType.None;
  ritmID: any;
  todaysDate: Date = new Date();
  businessDays: string = "";
  orderDatestamp: string = "";
  pendingDate: any;
  orderDate: any;
  value: any;

  public uploadForm: FormGroup;
  public submitted: boolean = false;
  @ViewChild('uploadModal') someModal!: ElementRef;
  fileInput: any;
  save: any;
  upload: boolean = false;
  handleError: any;
  httpClient: any;
  formData: any;
  // ADD: Control flag for interactive AI component
  showInteractiveAi: boolean = false;
  private destroy$ = new Subject<void>();

  // User search properties
  userList: any[] = [];
  selectedUser: any;
  @Input() control!: FormControl;
  users: User[] = [];
  searchInput: string = '';
  inputValue: string = '';
  pageNo: number = 1;
  fieldHasFocus: boolean = false;
  response: UserDto = new UserDto();

  // ============================================================================
  // CONSTRUCTOR (PRESERVED)
  // ============================================================================
  constructor(
    public router: Router,
    public fb: FormBuilder,
    public fu: FormBuilder,
    private http: HttpClient,
    public appSvc: AppService,
    private aiService: AiSuggestionService,
    private cdr: ChangeDetectorRef,  // NEW
    private ngZone: NgZone   
  ) {
    this.uploadForm = this.fu.group({});
    setTimeout(() => {
      this.homelink = true;
    }, 100);
  }

  // ============================================================================
  // NGONINIT (PRESERVED WITH FORM VALUE CHANGES)
  // ============================================================================
  ngOnInit() {
    const url = `${environment.gdx.denodoTables}`;
    this.http.get<DbNameOption[]>(url).subscribe(data => {
      this.dbnames = data.sort((a, b) =>
        a.dbname.localeCompare(b.dbname)
      );
    });

    moment.updateLocale('en', {
      holidays: [
        '01-02-2023', '01-16-2023', '05-29-2023', '07-04-2023',
        '09-04-2023', '11-23-2023', '11-24-2023', '12-22-2023',
        '12-25-2023', '12-26-2023', '12-27-2023', '12-28-2023', '12-29-2023',
      ],
      holidayFormat: 'MM-DD-YYYY',
    });

    let now = moment().format("YYYY-MM-DD HH:mm:ss");
    let now2 = moment().format("YYYY-MM-DD HH:mm:ss");
    this.businessDays = now;
    this.orderDatestamp = now2;
    this.orderDate = moment(this.orderDatestamp).toDate();

    this.getProfile();

    // Form initialization (preserved)
    this.form = this.fb.group({
      requesting_id: ['Me'],
      v_dar_dm_version: [''],
      v_dar_objectid_createdby: [''],
      v_dar_objectid_reqfor: ['', Validators.required],
      v_dar_platform: ['', Validators.required],
      v_dar_workdayID_created_by: [''],
      v_dar_dataDomainSelect: ['', Validators.required],
      v_dar_workdayID: [''],
      v_dar_userType: ['', Validators.required],
      companyName: [''],
      v_dar_organization: [''],
      v_dar_copy_access_profile_of: [''],
      v_dar_accessType: ['', Validators.required],
      v_dar_environment: [''],
      v_dar_pi: ['', Validators.required],
      v_dar_spi: ['', Validators.required],
      edm_PI_personal_details: [''],
      v_emd_specify_PII_needs: [''],
      v_edm_type_of_work: [''],
      v_edm_3rd_party_vendor: [''],
      chk_dar_terms_message: [false, Validators.requiredTrue],
      v_dat_api_name: [''],
      v_dar_select_a_data_warehouse_mart: [''],
      v_dar_bi_data_access_type: [''],
      v_dar_gateway_if_other: [''],
      v_dar_gateway_database_schema: [''],
      v_dar_post_database_schema: [''],
      v_dar_post_table_names: [null],
      v_dar_tbdp_is_this_request_fort_irm_pricing: [''],
      v_dar_select_an_oracle_access_type: [''],
      v_dar_oracle_other: [''],
      v_dar_OtherType: [''],
      v_dar_mfr_other: [''],
      v_dar_mainframe_access_type: [''],
      v_dar_mainframe_change_tso_id: [''],
      v_dare_mainframe_change_authorizers_vertical_horizontal: [''],
      v_dar_mainframe_changeman_application: [''],
      v_dar_mf_tso_id_removed: [''],
      v_dar_mf_transaction: [''],
      b_dar_mf_db2_plan_grant: [false],
      b_dar_mf_db2_plan_revoke: [false],
      v_dar_mf_db2_plan_tso_id_or_job_name: [''],
      v_dar_mf_db2_plan_plan_name: [''],
      b_dar_mf_db2_plan_bind: [false],
      b_dar_mf_db2_plan_execute: [false],
      v_dar_mf_db2_table_name_s: [''],
      b_dar_mf_db2_select: [false],
      b_dar_mf_db2_update: [false],
      b_dar_mf_db2_insert: [false],
      b_dar_mf_db2_delete: [false],
      b_dar_mf_db2_grant: [false],
      b_dar_mf_db2_revoke: [false],
      v_dar_mf_db2_tso_or_job_name: [''],
      v_dar_mnfr_ims_option_type: [''],
      v_dar_mnfr_ims_options_select: [''],
      v_dar_mnfr_transaction_id: [''],
      v_dar_mnfr_ims_transaction_group: [''],
      v_dar_mfrn_ims_transaction_group_description: [''],
      b_dar_ims_add: [false],
      v_dar_mf_ims_tmna_region_area_code_for_adds: [''],
      v_dar_mf_ims_transaction_group: [''],
      b_dar_ims_delete: [false],
      v_dar_mf_ims_ims_id_for_deletes: [''],
      v_dar_mf_rep_grant_or_revoke: [''],
      v_dar_mainframe_service_id_to_be_added: [''],
      v_dat_data_access_type_flat: [''],
      v_dat_data_access_type: [''],
      v_dar_DataReqDescription: ['', Validators.required],
      v_dar_businessJustification: ['', Validators.required],
      v_custom_control_group: [''],
      v_custom_routing_rule_identifier: [''],
      v_custom_fulfillment_group_1: [''],
      v_dar_mf_rep_list_tso_id_or_project_area_group: [''],
      v_dar_mainframe_service_project_area_select_1: [''],
      v_dar_changeman_add_delete: [''],
      v_dar_cics_add_delete: [''],
      v_dar_tws_opc_scheduling_add_remove: [''],
      v_dar_mfr_dataset_file_access_add_delete: [''],
      v_dar_mfr_service_account_add_delete: [''],
      v_dar_service_account_to_model: [''],
      v_dar_service_account_desc: [''],
      v_dar_service_account_owner: [''],
      v_dar_service_account_default_racf_grp: [''],
      v_dar_mfr_tso_id_add_delete: [''],
      v_dar_mfr_tso_id: [''],
      v_dar_mfr_tso_id_default_racf_grp: [''],
      v_dar_mfr_tso_id_to_model: [''],
      v_dar_ad_group: [''],
      accessDateContS: [''],
      edm_access: [''],
      expected_other: [''],
      if_other_please_specify: [''],
      IO: ['9322b1171b5e04542a59c8c11a4bcbf0:true'],
      m_dar_businessJustification_message: [''],
      m_dar_terms_message: [''],
      m_show_pii_message: [''],
      v_dar_accessReqClassification: [''],
      v_dar_accessStage: [''],
      v_dar_additionalInfoContS: [''],
      v_dar_analytics_platform: [''],
      v_dar_attributeDetails: [''],
      v_dar_databaseName: [''],
      v_dar_databaseType: [''],
      v_dar_expectedAvailability: [''],
      v_dar_frequencyOfUse: [''],
      v_dar_maxUsers: [''],
      v_dar_questionsContS: [''],
      v_dar_reportNames: [''],
      v_dar_requestedDataContS: [''],
      v_dar_sourceApplications: [''],
      v_dar_tableNames: [''],
      v_edm_option: [''],
      v_dar_mainframe_service_project_area: [''],
      v_dar_mf_ims_project_area_group: [''],
      v_dar_mainframe_file_set_name: [''],
      v_dar_mainframe_file_tso_id: [''],
      v_dar_mf_report_id_s_being_requested: [''],
      v_dar_mainframe_TWS_tso_id: [''],
      v_dar_mainframe_TWS_access_group: [''],
      v_dar_mf_mq_explorer: [''],
      v_dar_mf_queue_manager: [''],
      v_dar_mf_message_queue: [''],
      v_dar_mf_what_system: [''],
      v_dar_mf_what_location: [''],
      v_dar_other_mf: [''],
      v_dar_mf_loc_if_other: [''],
      v_dar_mf_ims_ims_id: [''],
      v_dar_mnfr_project_area_group: [''],
    });

    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0)
    });

    this.setSecuredFormValidators();
    this.loadBuilderDocument();

    // ============================================================================
    // AI DISCOVERY TRIGGER - UPDATED
    // ============================================================================
    this.form.valueChanges.pipe(
      debounceTime(2000),

      map((v: Record<string, any>) => ({
        platform: v.v_dar_platform?.trim() || '',
        domain: v.v_dar_dataDomainSelect?.trim() || '',
        dbSchema: v.v_dar_post_database_schema?.trim() || '',
        tables: v.v_dar_post_table_names?.map(t => t.trim()) || null,
        description: v.v_dar_DataReqDescription?.trim() || '',
        justification: v.v_dar_businessJustification?.trim() || '',
        environment: v.v_dar_environment?.trim() || ''
      })),

      // Require base fields and environment = 'Prod' or 'All'
      filter(x => !!(x.platform && x.domain && x.dbSchema && x.tables) && (x.environment === 'Prod'|| x.environment === 'All')),

      // Only fire when something relevant actually changed
      distinctUntilChanged((prev, curr) =>
        prev.platform === curr.platform &&
        prev.domain === curr.domain &&
        prev.dbSchema === curr.dbSchema &&
        prev.tables === curr.tables &&
        prev.description === curr.description &&
        prev.justification === curr.justification &&
        prev.environment === curr.environment
      ),

      // ✅ THIS LINE FIXES THE ERROR
      takeUntil(this.destroy$)

    ).subscribe(() => {
      this.openAiDiscovery();
    });
  }

  ngOnDestroy(): void {
    // Set the flag first
    this.componentIsDestroyed = true;

    // Clear any pending timers
    if (this.aiTimer) {
      clearTimeout(this.aiTimer);
    }

    this.destroy$.next();
    this.destroy$.complete();
  }

  // ============================================================================
  // AI DISCOVERY METHOD - CANONICAL FLOW
  // ============================================================================
  openAiDiscovery(): void {
    console.log("=== AI DISCOVERY TRIGGERED ===");

    // ---- Grab form values ----
    const platform = this.form.get('v_dar_platform')?.value;
    const domain = this.form.get('v_dar_dataDomainSelect')?.value;
    const dbValue = this.form.get('v_dar_post_database_schema')?.value;
    const tables = this.form.get('v_dar_post_table_names')?.value;
    const description = this.form.get('v_dar_DataReqDescription')?.value || '';
    const justification = this.form.get('v_dar_businessJustification')?.value || '';

    // ---- Platform Guard: Only allow TBDP platform ----
    const ALLOWED_PLATFORM = 'TBDP (IRM, PASA, C360, Q360, IRM-Pricing, etc.)';
    if (platform !== ALLOWED_PLATFORM) {
      console.log("GUARD BLOCKED - Platform is not TBDP:", platform);
      return;
    }

    // ---- Environment Guard: Only allow Production Environment or or All Environments ----
    const environment = this.form.get('v_dar_environment')?.value;
    if (environment !== 'Prod' && environment !== 'All') {
      console.log("GUARD BLOCKED - Environment is not Prod or All:", environment);
      return;
    }

    // ---- Determine Tier Logic ----
    const hasBasicFields = !!(platform && domain && dbValue && tables);
    const hasNarrativeFields = description.length >= 10 && justification.length >= 10;

    let currentTier: 'none' | 'standard' | 'verified' = 'none';
    if (hasBasicFields && hasNarrativeFields) currentTier = 'verified';
    else if (hasBasicFields) currentTier = 'standard';

    console.log("Tier check:", { currentTier, lastState: this.lastTriggerState, isSearching: this.isSearching });

    // ---- Guards ----
    if (
      currentTier === 'none' ||
      currentTier === this.lastTriggerState ||
      this.isSearching
    ) {
      console.log("GUARD BLOCKED - returning early");
      return;
    }

    this.isSearching = true;
    console.log("Starting API call...");

    const callApi = (tier: 'standard' | 'verified') => {
      console.log(`Calling API for tier: ${tier}`);

      return this.aiService.getSuggestions({
        query: dbValue,
        platform,
        domain,
        databaseSchema: dbValue,
        tableNames: tables,
        description,
        justification
      });
    };

    // CRITICAL FIX: Ensure we're in Angular zone
    this.ngZone.run(() => {
      // ✅ FIRST CALL (standard)
      callApi('standard').subscribe({
        next: (response: any) => {
          this.ngZone.run(() => {
            const results = Array.isArray(response)
              ? response
              : (response?.product || []);

            if (!results || results.length === 0) {
              this.isSearching = false;
              return;
            }

            // Store first-call results
            this.suggestions = results;
            this.lastTriggerState = 'standard';

            if (this.suggestedAiModal) {
              this.suggestedAiModal.inputGrading = response?.input_grading || {};
            }

            // ✅ SECOND CALL (verified) — ONLY IF BOTH FIELDS EXIST
            if (currentTier === 'verified') {
              console.log("Triggering VERIFIED (2nd) API call...");

              callApi('verified').subscribe({
                next: (verifiedResponse: any) => {
                  this.ngZone.run(() => {
                    const verifiedResults = Array.isArray(verifiedResponse)
                      ? verifiedResponse
                      : (verifiedResponse?.product || []);

                    if (verifiedResults && verifiedResults.length > 0) {
                      // ✅ overwrite with enriched results
                      this.suggestions = verifiedResults;
                      this.lastTriggerState = 'verified';
                    }

                    this.finalizeUiFlow();
                  });
                },
                error: err => {
                  console.error("Verified API error:", err);
                  this.finalizeUiFlow();
                }
              });

            } else {
              // ✅ Standard only
              this.finalizeUiFlow();
            }
          });
        },
        error: err => {
          this.ngZone.run(() => {
            console.error("AI API ERROR:", err);
            this.isSearching = false;
          });
        }
      });
    });
  }

  onDbChange(selectedDb: DbNameOption): void {
    if (!selectedDb?.dbname) {
      this.elements = [];
      return;
    }

    const dbname = selectedDb.dbname;
    const url = `${environment.gdx.denodoTables}?database=${encodeURIComponent(dbname)}`;

    this.http.get<ElementInfo[]>(url).subscribe({
      next: (data: ElementInfo[]) => {
        const uniqueTables = new Map<string, ElementInfo>();

        for (const item of data ?? []) {
          const tableName = item.elementname?.trim();

          if (!tableName) {
            continue;
          }

          // Normalize the key so differences in casing or spaces
          // do not create duplicate table options.
          const normalizedName = tableName.toLowerCase();

          if (!uniqueTables.has(normalizedName)) {
            uniqueTables.set(normalizedName, {
              ...item,
              elementname: tableName
            });
          }
        }

        this.elements = Array.from(uniqueTables.values()).sort((a, b) =>
          a.elementname.localeCompare(
            b.elementname,
            undefined,
            { sensitivity: 'base' }
          )
        );

        console.log('Unique tables loaded:', this.elements);
      },

      error: error => {
        console.error('Error loading elements:', error);
        this.elements = [];
      }
    });
  }

  onTableSelectClose() {
    this.openAiDiscovery();
  }

  /** ✅ UI flow extracted to avoid duplication */
  private finalizeUiFlow(): void {
    this.showInteractiveAi = true;
    this.cdr.detectChanges();

    if (this.aiTimer) {
      clearTimeout(this.aiTimer);
    }

    this.aiTimer = setTimeout(() => {
      this.ngZone.run(() => {
        if (this.componentIsDestroyed) return;

        this.showInteractiveAi = false;
        this.cdr.detectChanges();

        if (this.suggestedAiModal) {
          this.suggestedAiModal.openResults();
        }

        this.isSearching = false;
      });
    }, 3000);
  }

  // ============================================================================
  // ALL EXISTING METHODS PRESERVED BELOW
  // ============================================================================

  setSecuredFormValidators() {
    const oracleaccessControl = this.form.get('v_dar_select_an_oracle_access_type');
    const oracleotherControl = this.form.get('v_dar_oracle_other');
    const biaccessControl = this.form.get('v_dar_analytics_platform');
    const datawarehouseControl = this.form.get('v_dar_select_a_data_warehouse_mart');
    const piidetailsControl = this.form.get('edm_PI_personal_details');
    const piControl = this.form.get('v_dar_pi');
    const piiaccessControl = this.form.get('v_dar_spi');
    const piineedsControl = this.form.get('v_emd_specify_PII_needs');
    const worktypeControl = this.form.get('v_edm_type_of_work');
    const vendorControl = this.form.get('v_edm_3rd_party_vendor');
    const apinameControl = this.form.get('v_dat_api_name');
    const databaseschemaControl = this.form.get('v_dar_post_database_schema');
    const tablenameControl = this.form.get('v_dar_post_table_names');
    //const tbdpricingControl = this.form.get('v_dar_tbdp_is_this_request_fort_irm_pricing');
    const otherplatformControl = this.form.get('v_dar_OtherType');
    const gatewayotherplatformControl = this.form.get('v_dar_gateway_if_other');
    const gatewayschemaplatformControl = this.form.get('v_dar_gateway_database_schema');
    const bidataaccessplatformControl = this.form.get('v_dar_bi_data_access_type');
    const dataaccessplatformControl = this.form.get('v_dat_data_access_type');
    const dataaccesstypeControl = this.form.get('v_dat_data_access_type_flat');
    const cicsaddordeleteControl = this.form.get('v_dar_cics_add_delete');
    const changemanaddordeleteControl = this.form.get('v_dar_changeman_add_delete');
    const fileaccessaddordeleteControl = this.form.get('v_dar_mfr_dataset_file_access_add_delete');
    const mainframefilesetControl = this.form.get('v_dar_mainframe_file_set_name');
    const serviceaccountaddordeleteControl = this.form.get('v_dar_mfr_service_account_add_delete');
    const serviceidtobeaddedControl = this.form.get('v_dar_mainframe_service_id_to_be_added');
    const serviceaccountdescControl = this.form.get('v_dar_service_account_desc');
    const serviceaccountownerControl = this.form.get('v_dar_service_account_owner');
    const defaultracfgroupControl = this.form.get('v_dar_service_account_default_racf_grp');
    const tsoidaddordeleteControl = this.form.get('v_dar_mfr_tso_id_add_delete');
    const mqexplorerControl = this.form.get('v_dar_mf_mq_explorer');
    const queuemanagerControl = this.form.get('v_dar_mf_queue_manager');
    const messagequeueControl = this.form.get('v_dar_mf_message_queue');
    const mainframetsoidControl = this.form.get('v_dar_mfr_tso_id');
    const opcschedulingaddremoveControl = this.form.get('v_dar_tws_opc_scheduling_add_remove');
    const mainframeotherControl = this.form.get('v_dar_mfr_other');
    const environmentControl = this.form.get('v_dar_environment');
    const mainframefiletsoidControl = this.form.get('v_dar_mainframe_file_tso_id');

    //CHANGEMAN AUTHORITY
    const mainframeaccessControl = this.form.get('v_dar_mainframe_access_type');
    const tsoidControl = this.form.get('v_dar_mainframe_change_tso_id');
    const authorizeverticalControl = this.form.get('v_dare_mainframe_change_authorizers_vertical_horizontal');
    const changemanapplicationControl = this.form.get('v_dar_mainframe_changeman_application');
    //CICS ACCESS
    const tsoidremovedControl = this.form.get('v_dar_mf_tso_id_removed');
    const mainframetransactionControl = this.form.get('v_dar_mf_transaction');
    // IMS ACCESS
    const imsoptiontypeControl = this.form.get('v_dar_mnfr_ims_option_type');
    const imsoptionselectControl = this.form.get('v_dar_mnfr_ims_options_select');
    // MAINFRAME REPORT ACCESS
    const grantrevokeControl = this.form.get('v_dar_mf_rep_grant_or_revoke');
    //MAINFRAME MANUFACTURING/MANUFACTURING PARTS
    const manufacturingsystemControl = this.form.get('v_dar_mf_what_system');
    //MANUFACTURING LOCATION OTHER
    const manufacturinglocationotherControl = this.form.get('v_dar_mf_loc_if_other');
    // DB2 PLAN ACCESS/DB2 TABLE ACCESS
    const tsojobnameControl = this.form.get('v_dar_mf_db2_tso_or_job_name');
    const db2tablenameControl = this.form.get('v_dar_mf_db2_table_name_s');
    const db2planjobnameControl = this.form.get('v_dar_mf_db2_plan_tso_id_or_job_name');
    const db2plannameControl = this.form.get('v_dar_mf_db2_plan_plan_name');

    this.form.get('v_dar_platform').valueChanges
      .subscribe(v_dar_platform => {

        if (v_dar_platform === 'API (EIG Application Support)') {
          apinameControl.setValidators([Validators.required]);
          dataaccessplatformControl.setValidators([Validators.required]);
          environmentControl.setValidators([Validators.required]);
        }

        if (v_dar_platform === 'My SQL' || v_dar_platform === 'PostgreSQL' || v_dar_platform === 'SQL') {
          databaseschemaControl.setValidators([Validators.required]);
          dataaccessplatformControl.setValidators([Validators.required]);
          tablenameControl.setValidators([Validators.required]);
          environmentControl.setValidators([Validators.required]);
        }

        if (v_dar_platform === 'TBDP (IRM, PASA, C360, Q360, IRM-Pricing, etc.)') {
          // tbdpricingControl.setValidators([Validators.required]);
          databaseschemaControl.setValidators([Validators.required]);
          tablenameControl.setValidators([Validators.required]);
          dataaccessplatformControl.setValidators([Validators.required]);
          environmentControl.setValidators([Validators.required]);
        }

        if (v_dar_platform === 'Other') {
          otherplatformControl.setValidators([Validators.required]);
          dataaccessplatformControl.setValidators([Validators.required]);
          environmentControl.setValidators([Validators.required]);
        }

        if (v_dar_platform === 'Data Warehouse/Mart (VDW, FDW, FDM, NDW, etc.)') {
          datawarehouseControl.setValidators([Validators.required]);
          dataaccessplatformControl.setValidators([Validators.required]);
          environmentControl.setValidators([Validators.required]);
        }

        if (v_dar_platform === 'Gateway Access Request (PowerBI, Tableau, Alteryx, etc)') {
          gatewayschemaplatformControl.setValidators([Validators.required]);
          bidataaccessplatformControl.setValidators([Validators.required]);
          dataaccessplatformControl.setValidators([Validators.required]);
          environmentControl.setValidators([Validators.required]);
        }

        if (v_dar_platform === 'Oracle (Non-Data Warehouse, MDW, TOMS, Customer Central, etc.)') {
          oracleaccessControl.setValidators([Validators.required]);
          dataaccessplatformControl.setValidators([Validators.required]);
          environmentControl.setValidators([Validators.required]);
        }

        if (v_dar_platform === 'Cloud (AWS)' || v_dar_platform === 'Cloud (Azure)') {
          environmentControl.setValidators([Validators.required]);
        }

        if (v_dar_platform === 'Mainframe (DB2, IMS, CICS, Flat files, Reports, etc.)') {
          mainframeaccessControl.setValidators([Validators.required]);
        }

        apinameControl.updateValueAndValidity();
        databaseschemaControl.updateValueAndValidity();
        tablenameControl.updateValueAndValidity();
        // tbdpricingControl.updateValueAndValidity();
        otherplatformControl.updateValueAndValidity();
        datawarehouseControl.updateValueAndValidity();
        oracleaccessControl.updateValueAndValidity();
        oracleotherControl.updateValueAndValidity();
        biaccessControl.updateValueAndValidity();
        bidataaccessplatformControl.updateValueAndValidity();
        gatewayschemaplatformControl.updateValueAndValidity();
        dataaccessplatformControl.updateValueAndValidity();
        mainframeaccessControl.updateValueAndValidity();
        manufacturingsystemControl.updateValueAndValidity();
        environmentControl.updateValueAndValidity();
      });

    this.form.get('v_dar_mainframe_access_type').valueChanges
      .subscribe(v_dar_mainframe_access_type => {
        if (v_dar_mainframe_access_type === 'CICS Access') {
          dataaccessplatformControl.setValidators([Validators.required]);
          environmentControl.setValidators([Validators.required]);
          cicsaddordeleteControl.setValidators([Validators.required]);
        }

        environmentControl.updateValueAndValidity();
        dataaccessplatformControl.updateValueAndValidity();
        cicsaddordeleteControl.updateValueAndValidity();
      });

    this.form.get('v_dar_mainframe_access_type').valueChanges
      .subscribe(v_dar_mainframe_access_type => {
        if (v_dar_mainframe_access_type === 'MQ Access' || v_dar_mainframe_access_type === 'Other') {
          dataaccessplatformControl.setValidators([Validators.required]);
          environmentControl.setValidators([Validators.required]);
        }

        dataaccessplatformControl.updateValueAndValidity();
        environmentControl.updateValueAndValidity();
      });

    this.form.get('v_dar_mainframe_access_type').valueChanges
      .subscribe(v_dar_mainframe_access_type => {
        if (v_dar_mainframe_access_type === 'Mainframe Flat File Access') {
          dataaccesstypeControl.setValidators([Validators.required]);
          fileaccessaddordeleteControl.setValidators([Validators.required]);
        }

        dataaccesstypeControl.updateValueAndValidity();
        fileaccessaddordeleteControl.updateValueAndValidity();
      });

    this.form.get('v_dar_mfr_dataset_file_access_add_delete').valueChanges.
      subscribe(v_dar_mfr_dataset_file_access_add_delete => {
        if (v_dar_mfr_dataset_file_access_add_delete === 'Grant Access to a Dataset/File' || v_dar_mfr_dataset_file_access_add_delete === 'Remove Access to a Dataset/File') {
          mainframefilesetControl.setValidators([Validators.required]);
          mainframefiletsoidControl.setValidators([Validators.required]);
        }

        mainframefilesetControl.updateValueAndValidity();
        mainframefiletsoidControl.updateValueAndValidity();
      });

    this.form.get('v_dar_mainframe_access_type').valueChanges
      .subscribe(v_dar_mainframe_access_type => {
        if (v_dar_mainframe_access_type === 'Mainframe Service Account') {
          serviceaccountaddordeleteControl.setValidators([Validators.required]);
        }

        serviceaccountaddordeleteControl.updateValueAndValidity();
      });

    this.form.get('v_dar_mfr_service_account_add_delete').valueChanges
      .subscribe(v_dar_mfr_service_account_add_delete => {
        if (v_dar_mfr_service_account_add_delete === 'Add New Service Account') {
          serviceidtobeaddedControl.setValidators([Validators.required]);
          serviceaccountdescControl.setValidators([Validators.required]);
          serviceaccountownerControl.setValidators([Validators.required]);
          defaultracfgroupControl.setValidators([Validators.required]);
        }

        serviceidtobeaddedControl.updateValueAndValidity();
        serviceaccountdescControl.updateValueAndValidity();
        serviceaccountownerControl.updateValueAndValidity();
        defaultracfgroupControl.updateValueAndValidity();
      });

    this.form.get('v_dar_mfr_service_account_add_delete').valueChanges
      .subscribe(v_dar_mfr_service_account_add_delete => {
        if (v_dar_mfr_service_account_add_delete === 'Remove Service Account') {
          serviceidtobeaddedControl.setValidators([Validators.required]);
        }

        serviceidtobeaddedControl.updateValueAndValidity();
      });

    // MAINFRAME TSO ID VALIDATION
    this.form.get('v_dar_mainframe_access_type').valueChanges
      .subscribe(v_dar_mainframe_access_type => {
        if (v_dar_mainframe_access_type === 'Mainframe TSO ID') {
          tsoidaddordeleteControl.setValidators([Validators.required]);
          environmentControl.setValidators(null);
        }

        tsoidaddordeleteControl.updateValueAndValidity();
        environmentControl.updateValueAndValidity();
      });

    this.form.get('v_dar_mfr_tso_id_add_delete').valueChanges
      .subscribe(v_dar_mfr_tso_id_add_delete => {
        if (v_dar_mfr_tso_id_add_delete === 'Remove TSO ID') {
          mainframetsoidControl.setValidators([Validators.required]);
        }

        mainframetsoidControl.updateValueAndValidity();
      });
    // END MAINFRAME TSO ID VALIDATION

    // MQ ACCESS VALIDATION
    this.form.get('v_dar_mainframe_access_type').valueChanges
      .subscribe(v_dar_mainframe_access_type => {
        if (v_dar_mainframe_access_type === 'MQ Access') {
          tsoidremovedControl.setValidators([Validators.required]);
          mqexplorerControl.setValidators([Validators.required]);
          queuemanagerControl.setValidators([Validators.required]);
          messagequeueControl.setValidators([Validators.required]);
        }

        tsoidremovedControl.updateValueAndValidity();
        mqexplorerControl.updateValueAndValidity();
        queuemanagerControl.updateValueAndValidity();
        messagequeueControl.updateValueAndValidity();
      });
    // END MQ ACCESS VALIDATION

    // IMS ACCESS
    this.form.get('v_dar_mnfr_ims_options_select').valueChanges
      .subscribe(v_dar_mnfr_ims_options_select => {
        if (v_dar_mnfr_ims_options_select === 'Add IMS Access' || v_dar_mnfr_ims_options_select === 'Remove IMS Access') {
          environmentControl.setValidators(null);
        }

        environmentControl.updateValueAndValidity();
      });
    // END IMS ACCESS

    this.form.get('v_dar_mainframe_access_type').valueChanges
      .subscribe(v_dar_mainframe_access_type => {
        if (v_dar_mainframe_access_type === 'TWS/OPC Scheduling Access') {
          opcschedulingaddremoveControl.setValidators([Validators.required]);
          environmentControl.setValidators(null);
        }

        opcschedulingaddremoveControl.updateValueAndValidity();
        environmentControl.updateValueAndValidity();
      });

    this.form.get('v_dar_mainframe_access_type').valueChanges
      .subscribe(v_dar_mainframe_access_type => {
        if (v_dar_mainframe_access_type === 'Other') {
          mainframeotherControl.setValidators([Validators.required]);
          environmentControl.setValidators(null);
          dataaccessplatformControl.setValidators(null);
        }

        mainframeotherControl.updateValueAndValidity();
        environmentControl.updateValueAndValidity();
        dataaccessplatformControl.updateValueAndValidity();
      });


    this.form.get('v_dar_mainframe_access_type').valueChanges
      .subscribe(v_dar_mainframe_access_type => {
        if (v_dar_mainframe_access_type === 'ChangeMan Approval Authority') {
          tsoidControl.setValidators([Validators.required]);
          authorizeverticalControl.setValidators([Validators.required]);
          changemanapplicationControl.setValidators([Validators.required]);
          changemanaddordeleteControl.setValidators([Validators.required]);
        }

        tsoidControl.updateValueAndValidity();
        authorizeverticalControl.updateValueAndValidity();
        changemanapplicationControl.updateValueAndValidity();
        changemanaddordeleteControl.updateValueAndValidity();
      });

    this.form.get('v_dar_mainframe_access_type').valueChanges
      .subscribe(v_dar_mainframe_access_type => {
        if (v_dar_mainframe_access_type === 'CICS Access') {
          tsoidremovedControl.setValidators([Validators.required]);
          mainframetransactionControl.setValidators([Validators.required]);
          environmentControl.setValidators([Validators.required]);
        }

        tsoidremovedControl.updateValueAndValidity();
        mainframetransactionControl.updateValueAndValidity();
        environmentControl.updateValueAndValidity();
      });

    this.form.get('v_dar_mainframe_access_type').valueChanges
      .subscribe(v_dar_mainframe_access_type => {
        if (v_dar_mainframe_access_type === 'Mainframe Report Access') {
          grantrevokeControl.setValidators([Validators.required]);
          environmentControl.setValidators(null);
        }

        grantrevokeControl.updateValueAndValidity();
        environmentControl.updateValueAndValidity();
      });

    this.form.get('v_dar_mainframe_access_type').valueChanges
      .subscribe(v_dar_mainframe_access_type => {
        if (v_dar_mainframe_access_type === 'IMS Access') {
          //imsoptiontypeControl.setValidators([Validators.required]);
          imsoptionselectControl.setValidators([Validators.required]);
          environmentControl.setValidators([Validators.required]);
        }

        imsoptiontypeControl.updateValueAndValidity();
        imsoptionselectControl.updateValueAndValidity();
        environmentControl.updateValueAndValidity();
      });

    this.form.get('v_dar_mf_what_location').valueChanges
      .subscribe(v_dar_mf_what_location => {
        if (v_dar_mf_what_location === 'Other') {
          manufacturinglocationotherControl.setValidators([Validators.required]);
        }

        manufacturinglocationotherControl.updateValueAndValidity();
      });

    this.form.get('v_dar_mainframe_access_type').valueChanges
      .subscribe(v_dar_mainframe_access_type => {
        if (v_dar_mainframe_access_type === 'DB2 Plan Access') {
          db2planjobnameControl.setValidators([Validators.required]);
          db2plannameControl.setValidators([Validators.required]);
          environmentControl.setValidators([Validators.required]);
        }

        tsojobnameControl.updateValueAndValidity();
        db2plannameControl.updateValueAndValidity();
        environmentControl.updateValueAndValidity();
      });

    this.form.get('v_dar_mainframe_access_type').valueChanges
      .subscribe(v_dar_mainframe_access_type => {
        if (v_dar_mainframe_access_type === 'DB2 Table Access') {
          tsojobnameControl.setValidators([Validators.required]);
          db2tablenameControl.setValidators([Validators.required]);
          environmentControl.setValidators([Validators.required]);
        }

        tsojobnameControl.updateValueAndValidity();
        db2tablenameControl.updateValueAndValidity();
        environmentControl.updateValueAndValidity();
      });

    this.form.get('v_dar_select_an_oracle_access_type').valueChanges
      .subscribe(v_dar_select_an_oracle_access_type => {
        if (v_dar_select_an_oracle_access_type === 'Other (Non-warehouse)') {
          oracleotherControl.setValidators([Validators.required]);
        }

        oracleotherControl.updateValueAndValidity();
      });

    this.form.get('v_dar_bi_data_access_type').valueChanges
      .subscribe(v_dar_bi_data_access_type => {
        if (v_dar_bi_data_access_type === 'Other') {
          gatewayotherplatformControl.setValidators([Validators.required]);
        }

        gatewayotherplatformControl.updateValueAndValidity();
      });

    // DATA CLASSIFICATION VALIDATION
    this.form.get('v_dar_accessReqClassification').valueChanges
      .subscribe(v_dar_accessReqClassification => {

        if (v_dar_accessReqClassification === 'Public' || v_dar_accessReqClassification === 'Protected') {
          piidetailsControl.setValidators(null);
          piineedsControl.setValidators(null);
          worktypeControl.setValidators(null);
          vendorControl.setValidators(null);
        }

        if (v_dar_accessReqClassification === 'Confidential' || v_dar_accessReqClassification === 'Highly Confidential' || v_dar_accessReqClassification === 'Personal Information' || v_dar_accessReqClassification === 'Legal/Privileged') {

          piidetailsControl.setValidators([Validators.required]);
          piiaccessControl.setValidators([Validators.required]);
          worktypeControl.setValidators([Validators.required]);
          vendorControl.setValidators([Validators.required]);
        }

        piidetailsControl.updateValueAndValidity();
        piiaccessControl.updateValueAndValidity();
        piineedsControl.updateValueAndValidity();
        worktypeControl.updateValueAndValidity();
        vendorControl.updateValueAndValidity();
      });


    // PII VALIDATION
    this.form.get('edm_PI_personal_details').valueChanges
      .subscribe(edm_PI_personal_details => {
        if (edm_PI_personal_details === 'Yes') {
          piineedsControl.setValidators([Validators.required]);
        }

        if (edm_PI_personal_details === 'No') {
          piineedsControl.setValidators(null);
        }

        piineedsControl.updateValueAndValidity();
      });

    const applyPersonalInformationFollowUps = () => {
      const eitherYes = piControl.value === 'Yes' || piiaccessControl.value === 'Yes';
      if (eitherYes) {
        piidetailsControl.setValidators([Validators.required]);
        vendorControl.setValidators([Validators.required]);
        worktypeControl.setValidators([Validators.required]);
      } else {
        piidetailsControl.setValidators(null);
        piineedsControl.setValidators(null);
        worktypeControl.setValidators(null);
        vendorControl.setValidators(null);
      }

      piidetailsControl.updateValueAndValidity();
      piineedsControl.updateValueAndValidity();
      worktypeControl.updateValueAndValidity();
      vendorControl.updateValueAndValidity();
    };
    piControl.valueChanges.subscribe(applyPersonalInformationFollowUps);
    piiaccessControl.valueChanges.subscribe(applyPersonalInformationFollowUps);
  }

  isFieldValid(field: string) {
    const control = this.form.get(field);
    return control ? !control.valid && control.touched : false;
  }

  displayFieldCss(field: string) {
    return {
      'has-error': this.isFieldValid(field),
      'has-feedback': this.isFieldValid(field)
    };
  }

  onSubmit() {
    if (this.form.valid) {
      console.log('form submitted');
    } else {
      this.validateAllFormFields(this.form);
    }
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  submit() {
    let data = {
      sysparm_quantity: ['1'],
      variables: this.form.value
    }

    const headers = {
      'Content-Type': 'application/json',
    }

    var HTTP_URL = `${environment.gdx.addToCart}`;

    this.http.post(HTTP_URL, data).subscribe(
      (response) => {
        if (response) {
          var HTTP2_URL = `${environment.gdx.submitCart}`;

          this.http.post(HTTP2_URL, null).subscribe(
            (res) => {
              this.repos = res;
              this.isShow = true;
              document.body.scrollTop = 0; // For Safari
              document.documentElement.scrollTop = 0;

              if (this.isShow === true) {
                const payload = {
                  requestNum: this.repos.result['request_number'],
                  requestID: this.repos.result['request_id'],
                  ritmID: this.repos.result['ritm_id'],
                  sysID: this.repos.result['sys_id'],
                  objectId: this.selectedUser || this.profile.id,
                  productId: 999999999,
                  productIdentifier: 999999999,
                  ritm: this.repos.result['ritm_number'],
                  approvalStage: 'Requested',
                  ritmState: 'Open',
                  stage: 'Waiting for Approval',
                  formData: {
                    requesting_id: this.form.value.requesting_id,
                    v_dar_objectid_createdby: this.form.value.v_dar_objectid_createdby,
                    v_dar_objectid_reqfor: this.form.value.v_dar_objectid_reqfor,
                    v_dar_workdayID_created_by: this.form.value.v_dar_workdayID_created_by,
                    v_dar_workdayID: this.form.value.v_dar_workdayID,
                    companyName: this.form.value.companyName,
                    v_dar_organization: this.form.value.v_dar_organization,
                    v_dar_platform: this.form.value.v_dar_platform,
                    v_dar_dataDomainSelect: this.form.value.v_dar_dataDomainSelect,
                    v_dar_userType: this.form.value.v_dar_userType,
                    v_dar_accessType: this.form.value.v_dar_accessType,
                    v_dar_environment: this.form.value.v_dar_environment,
                    v_dar_accessReqClassification: this.form.value.v_dar_accessReqClassification,
                    v_dar_accessStage: this.form.value.v_dar_accessStage,
                    v_dar_pi: this.form.value.v_dar_pi,
                    v_dar_spi: this.form.value.v_dar_spi,
                    edm_PI_personal_details: this.form.value.edm_PI_personal_details,
                    v_emd_specify_PII_needs: this.form.value.v_emd_specify_PII_needs,
                    v_edm_type_of_work: this.form.value.v_edm_type_of_work,
                    v_edm_3rd_party_vendor: this.form.value.v_edm_3rd_party_vendor,
                    v_dat_api_name: this.form.value.v_dat_api_name,
                    v_dar_select_a_data_warehouse_mart: this.form.value.v_dar_select_a_data_warehouse_mart,
                    v_dar_bi_data_access_type: this.form.value.v_dar_bi_data_access_type,
                    v_dar_gateway_if_other: this.form.value.v_dar_gateway_if_other,
                    v_dar_gateway_database_schema: this.form.value.v_dar_gateway_database_schema,
                    v_dar_post_database_schema: this.form.value.v_dar_post_database_schema,
                    v_dar_post_table_names: this.form.value.v_dar_post_table_names,
                    v_dar_tbdp_is_this_request_fort_irm_pricing: this.form.value.v_dar_tbdp_is_this_request_fort_irm_pricing,
                    v_dar_select_an_oracle_access_type: this.form.value.v_dar_select_an_oracle_access_type,
                    v_dar_oracle_other: this.form.value.v_dar_oracle_other,
                    v_dar_OtherType: this.form.value.v_dar_OtherType,
                    v_dar_mfr_other: this.form.value.v_dar_mfr_other,
                    v_dar_mainframe_access_type: this.form.value.v_dar_mainframe_access_type,
                    v_dar_mainframe_change_tso_id: this.form.value.v_dar_mainframe_change_tso_id,
                    v_dare_mainframe_change_authorizers_vertical_horizontal: this.form.value.v_dare_mainframe_change_authorizers_vertical_horizontal,
                    v_dar_mainframe_changeman_application: this.form.value.v_dar_mainframe_changeman_application,
                    v_dar_mf_tso_id_removed: this.form.value.v_dar_mf_tso_id_removed,
                    v_dar_mf_transaction: this.form.value.v_dar_mf_transaction,
                    b_dar_mf_db2_plan_grant: this.form.value.b_dar_mf_db2_plan_grant,
                    b_dar_mf_db2_plan_revoke: this.form.value.b_dar_mf_db2_plan_revoke,
                    v_dar_mf_db2_plan_tso_id_or_job_name: this.form.value.v_dar_mf_db2_plan_tso_id_or_job_name,
                    v_dar_mf_db2_plan_plan_name: this.form.value.v_dar_mf_db2_plan_plan_name,
                    b_dar_mf_db2_plan_bind: this.form.value.b_dar_mf_db2_plan_bind,
                    b_dar_mf_db2_plan_execute: this.form.value.b_dar_mf_db2_plan_execute,
                    v_dar_mf_db2_table_name_s: this.form.value.v_dar_mf_db2_table_name_s,
                    b_dar_mf_db2_select: this.form.value.b_dar_mf_db2_select,
                    b_dar_mf_db2_update: this.form.value.b_dar_mf_db2_update,
                    b_dar_mf_db2_insert: this.form.value.b_dar_mf_db2_insert,
                    b_dar_mf_db2_delete: this.form.value.b_dar_mf_db2_delete,
                    b_dar_mf_db2_grant: this.form.value.b_dar_mf_db2_grant,
                    b_dar_mf_db2_revoke: this.form.value.b_dar_mf_db2_revoke,
                    v_dar_mf_db2_tso_or_job_name: this.form.value.v_dar_mf_db2_tso_or_job_name,
                    v_dar_mnfr_ims_option_type: this.form.value.v_dar_mnfr_ims_option_type,
                    v_dar_mnfr_ims_options_select: this.form.value.v_dar_mnfr_ims_options_select,
                    v_dar_mnfr_transaction_id: this.form.value.v_dar_mnfr_transaction_id,
                    v_dar_mnfr_ims_transaction_group: this.form.value.v_dar_mnfr_ims_transaction_group,
                    v_dar_mfrn_ims_transaction_group_description: this.form.value.v_dar_mfrn_ims_transaction_group_description,
                    b_dar_ims_add: this.form.value.b_dar_ims_add,
                    v_dar_mf_ims_tmna_region_area_code_for_adds: this.form.value.v_dar_mf_ims_tmna_region_area_code_for_adds,
                    v_dar_mf_ims_transaction_group: this.form.value.v_dar_mf_ims_transaction_group,
                    b_dar_ims_delete: this.form.value.b_dar_ims_delete,
                    v_dar_mf_ims_ims_id_for_deletes: this.form.value.v_dar_mf_ims_ims_id_for_deletes,
                    v_dat_data_access_type: this.form.value.v_dat_data_access_type,
                    v_dar_DataReqDescription: this.form.value.v_dar_DataReqDescription,
                    v_dar_businessJustification: this.form.value.v_dar_businessJustification,
                    v_custom_control_group: this.form.value.v_custom_control_group,
                    v_custom_routing_rule_identifier: this.form.value.v_custom_routing_rule_identifier,
                    v_custom_fulfillment_group_1: this.form.value.v_custom_fulfillment_group_1,
                    chk_dar_terms_message: this.form.value.chk_dar_terms_message,
                    v_dar_dm_version: this.form.value.v_dar_dm_version,
                    ...this.extraFieldValues()
                  }
                }
                console.log(payload.sysID);
                console.log(payload.ritmID);

                this.http.post(environment.gdx.requestSave, payload).subscribe(
                  (response) => {
                    this.save = response;
                    this.upload = true;
                  }
                );
              }
            },          
          )
        }
      },
    )


    this.isLoading = true;
    this.button = 'Processing Order..';
    this.isProcessing = true;

    setTimeout(() => {
      this.isLoading = false;
      this.button = 'Processing Order...';
      this.isProcessing = false;
    }, 3600000);
  }

  // ... ALL OTHER EXISTING METHODS (handleFileInput, autoSubmit, getProfile, etc.) ...
  // Keep all your existing methods exactly as they were

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
  }

  @ViewChild('myButton') myButton!: ElementRef;

  autoSubmit() {
    let el: HTMLElement = this.myButton.nativeElement as HTMLElement;
    setTimeout(()=> el.click(), 1000);
  }

  getProfile() {this.http.get(environment.microsoft.graphAPI).subscribe(profile => {
      this.profile = profile;
    });
  }

  toggleVisibility(e) {
    this.add = e.target.checked;
  }

  toggleVisibility2(e) {
    this.delete = e.target.checked;
  }

  onModalClose() {
    console.log('AI Suggestions modal closed');
  }

  omit_special_char(event) {
    var k;
    k = event.charCode;  //         k = event.keyCode;  (Both can be used)
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57));
  }

  selectCheckBox(targetType: CheckBoxType) {
    // If the checkbox was already checked, clear the currentlyChecked variable
    if (this.currentlyChecked === targetType) {
      this.currentlyChecked = CheckBoxType.None;
      return;
    }

    this.currentlyChecked = targetType;
  }

  goToLink1() {
    window.open("https://data.toyota.com/docs/protected/access-guide", "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=0,left=0,width=800,height=1000");
  }

  setTimeout() {
    this.interval = setTimeout(() => {

    }, 2000);
  }

  click() {
    this.isLoading = true;
    this.button = 'Processing..';

    setTimeout(() => {
      this.isLoading = false;
      this.button = 'Submit';
      // alert('Done loading');
    }, 3600000)
  }

  actionMethod() {
    //this.isMessage = true;
  }

  toggleDisplay() {
    this.isShow = !this.isShow;
  }

  filterSeries(value: any) {
    this.GetUsers(value);
    this.pageNo = 1
  }

 async GetUsers(value: any) {
    if (value === '') {
      this.response = new UserDto();
      this.users = [];
    } else {
      const payload = await this.http.get<UserDto & { results?: User[] }>(`${environment.apiUrl}/api/integrations/people-finder/search/gac/user/?q=${encodeURIComponent(value)}`).toPromise();
      this.response = new UserDto();
      this.response.value = payload?.value || payload?.results || [];
      this.users = this.response.value.filter(user => user.accountEnabled !== false);
    }
  }

  onFocus() {
    this.response = new UserDto();
    this.fieldHasFocus = true;
  }
  onBlur() {
    this.fieldHasFocus = false;
  }
  onPageChange(event: number) {
    this.pageNo = event;
  }
  itemSelected(item: User) {
    this.fieldHasFocus = false;
    this.searchInput = item.id;
    this.inputValue = item.givenName + ' ' + item.surname + ' | ' + item.mail;
  }

  onSearch(item) {
    console.log('search called' + item.term);
  }

  testSearch(term: string, item) {
    console.log(item);
    console.log(term);
    return item.name.startsWith(term);
  }

  fieldVisible(field): boolean {
    return this.ruleMatches(field?.visible_when, this.form?.value || {});
  }

  fieldLabel(field): string {
    const values = this.form?.value || {};
    for (const rule of field?.label_when || []) {
      if (this.ruleMatches(rule.when, values)) return rule.label;
    }
    return field?.label || field?.name;
  }

  private extraFieldValues() {
    const values = {};
    this.extraFields.forEach((field) => {
      values[field.name] = this.form.value[field.name];
    });
    return values;
  }

  private loadBuilderDocument() {
    this.builtInFieldNames = new Set(Object.keys(this.form.controls));
    this.http.get<any>(`${environment.apiUrl}/api/forms/dar-form-builder/document/`).subscribe({
      next: (payload) => {
        if (!payload?.saved || !payload.document) return;
        this.builderSaved = true;
        this.builderFields = (payload.document.sections || []).flatMap((section) => section.fields || []);
        this.installExtraFields();
        this.applySavedRules();
        this.form.valueChanges.pipe(debounceTime(0), takeUntil(this.destroy$)).subscribe(() => this.applySavedRules());
      },
      error: () => {}
    });
  }

  private installExtraFields() {
    const extras = [];
    this.builderFields.forEach((field) => {
      if (!field?.name || this.builtInFieldNames.has(field.name) || this.form.contains(field.name)) return;
      const initial = field.type === 'checkbox' ? false : '';
      this.form.addControl(field.name, new FormControl(initial));
      extras.push(field);
      if (field.options_source && !(field.options || []).length) this.loadFieldOptions(field);
    });
    this.extraFields = extras;
  }

  private loadFieldOptions(field) {
    const url = String(field.options_source).startsWith('http')
      ? field.options_source
      : `${environment.apiUrl}${field.options_source}`;
    this.http.get<any>(url).subscribe({
      next: (payload) => {
        const rows = Array.isArray(payload) ? payload : (payload?.results || payload?.options || []);
        field.options = rows.map((row) => {
          if (row && typeof row === 'object') {
            return {label: row.label || row.name || row.value, value: row.value || row.id || row.label};
          }
          return {label: row, value: row};
        });
      },
      error: () => {}
    });
  }

  private applySavedRules() {
    if (!this.builderSaved) return;
    const values = this.form.getRawValue();
    this.builderFields.forEach((field) => {
      const control = this.form.get(field.name);
      if (!control) return;
      const enforced = (field.validators || []).some((rule) => rule.enforced);
      const extra = !this.builtInFieldNames.has(field.name);
      if (enforced || extra) {
        control.setValidators(this.validatorsFor(field, values));
        control.updateValueAndValidity({emitEvent: false});
      }
      if (field.disabled || (field.disabled_when && this.ruleMatches(field.disabled_when, values))) {
        control.disable({emitEvent: false});
      } else if (control.disabled && (extra || field.disabled_when)) {
        control.enable({emitEvent: false});
      }
      for (const rule of field.value_when || []) {
        if (this.ruleMatches(rule.when, values) && control.value !== rule.value) {
          control.setValue(rule.value, {emitEvent: false});
        }
      }
    });
    this.paintVisibility();
  }

  private validatorsFor(field, values) {
    const validators = [];
    const enforced = (field.validators || []).filter((rule) => rule.enforced && this.ruleMatches(rule.when, values));
    const required = field.type === 'checkbox' ? Validators.requiredTrue : Validators.required;
    if (field.required && !enforced.some((rule) => rule.type === 'required')) validators.push(required);
    enforced.forEach((rule) => {
      if (rule.type === 'required') validators.push(required);
      if (rule.type === 'min_length' || rule.type === 'minlength') validators.push(Validators.minLength(Number(rule.value)));
      if (rule.type === 'max_length' || rule.type === 'maxlength') validators.push(Validators.maxLength(Number(rule.value)));
      if (rule.type === 'email') validators.push(Validators.email);
      if (rule.type === 'pattern' && rule.value) validators.push(Validators.pattern(rule.value));
    });
    if (field.min_length) validators.push(Validators.minLength(Number(field.min_length)));
    if (field.max_length) validators.push(Validators.maxLength(Number(field.max_length)));
    return validators;
  }

  private ruleMatches(rule, values): boolean {
    if (!rule) return true;
    if (rule.all) return rule.all.every((item) => this.ruleMatches(item, values));
    if (rule.any) return rule.any.some((item) => this.ruleMatches(item, values));
    const current = values[rule.field];
    if (Object.prototype.hasOwnProperty.call(rule, 'equals')) return current === rule.equals;
    if (Object.prototype.hasOwnProperty.call(rule, 'not_equals')) return current !== rule.not_equals;
    if (Object.prototype.hasOwnProperty.call(rule, 'in')) return (rule.in || []).indexOf(current) !== -1;
    return false;
  }

  private paintVisibility() {
    this.builderFields.forEach((field) => {
      if (!field.visible_when) return;
      const show = this.ruleMatches(field.visible_when, this.form.getRawValue());
      document.querySelectorAll(`[formControlName="${field.name}"]`).forEach((node) => {
        const group = node.closest('.form-group');
        if (group) (group as HTMLElement).style.display = show ? '' : 'none';
      });
    });
  }

}

export class UserDto {
  context: string;
  count: number;
  nextLink: string;
  value: User[];
  result: any;
}

export class User {
  id: string;
  displayName: string;
  givenName: string;
  surname: string;
  companyName: string;
  department: string;
  mail: string;
  accountEnabled: boolean;
}