import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Product } from '../../../../../@shared/interfaces/product';
import { CartService } from '../../../../../@shared/services/cart.service';
import { RootService } from '../../../../../@shared/services/root.service';
import { AppService } from '../../../../../../app/@shared/services/app.service';
import { CartItem } from '../../../../../@shared/interfaces/cart-item'; 
import { OffcanvasRequestService } from '../../../../services/offcanvas-request.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MsalService } from '@azure/msal-angular';
import { environment } from '../../../../../../environments/environment';
import { RequestAccess } from '../../../../interfaces/request-access';
import { AuthError, InteractionRequiredAuthError } from '@azure/msal-browser';

const GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0/me?$select=id,displayName,givenName,surname,jobTitle,userPrincipalName,mail,businessPhones,officeLocation,employeeId,department,companyName,streetAddress,city,state,postalCode,country,extension_f9db8ce126544afb895293c1adb4b749_extensionAttribute3';

export type DropcartType = 'dropdown' | 'offcanvas';

@Component({
    selector: 'app-header-request-access',
    templateUrl: './request-access.component.html',
    styleUrls: ['./request-access.component.scss']
})

export class RequestAccessComponent implements OnChanges {
    currentApplicationVersion = environment.version;
    @Input() itemToEdit: CartItem | null = null;
    @Input() product!: Product;
    @Input() currentProduct!: any;
    @Input() type: DropcartType = 'dropdown';
    @Output() closeMenu: EventEmitter<void> = new EventEmitter<void>();
    @Input() requestAccess: RequestAccess | null = null;
    @Output() accessRequested = new EventEmitter<RequestAccess>();
    quantity: FormControl = new FormControl(1);
    savedProduct: any = null;
    savedFormData: any = null;
    addingToCart = false;
    updatingRequest = false;
    profile;
    photo:any;
    sanitizer: any; 
    isSelected: any;
    isDisabled: any;
    survey: any;
    input: any;
    success: any;
    isChecked : boolean;
    productType: Array<any> = [];
    dataDomainsList: Array<any> = [];

    constructor(
        public state: OffcanvasRequestService,
        public cart: CartService,
        public root: RootService,
        public fb: FormBuilder,
        private http: HttpClient,
        private authService: MsalService,
        public appSvc: AppService
    ) {
        this.productType = [
            { value: "", label: "Choose Platform Type" },
            { value: "Dashboards", label: "Dashboards" },
            { value: "Reports", label: "Reports" },
            { value: "Datasets", label: "Datasets" },
            { value: "Data Science", label: "Data Science" },
            { value: "Webservices (API)", label: "Webservices (API)" }
        ],
        this.dataDomainsList = [
            { value: "", label: "Choose Date Domain Type" },
            { value: "Customer", label: "Customer" },
            { value: "Dealer Identity", label: "Dealer Identity" },
            { value: "Dealership", label: "Dealership" },
            { value: "Digital Assets", label: "Digital Assets" },
            { value: "Finance", label: "Enterprise Corporate Applications" },
            { value: "Finance", label: "Finance" },
            { value: "Identity Access Management", label: "Identity Access Management" },
            { value: "Manufacturing", label: "Manufacturing" },
            { value: "Manufacturing Parts", label: "Manufacturing Parts" },
            { value: "Product Quality", label: "Product Quality" },
            { value: "Research and Development", label: "Research and Development" },
            { value: "Service History", label: "Service History" },
            { value: "Service Parts and Accessories", label: "Service Parts and Accessories" },
            { value: "Telematics", label: "Telematics" },
            { value: "Vehicles", label: "Vehicles" },
            { value: "Warranty", label: "Warranty" }
        ];
    }

    get f() { return this.form.controls; }

    form: FormGroup;

    ngOnInit() {
        this.getProfile();
        this.savedFormData = this.loadFormData();
        this.savedProduct = this.loadProduct();
        this.form = this.fb.group({
            v_dar_product_name: [''],
            radar_productname: [''],
            v_dar_dm_version: [''],
            v_dar_createdby_fullname: `${this.appSvc?.userData?.givenName} ${this.appSvc?.userData?.surname}`,
            v_dar_objectid_createdby: [''],
            requesting_id: ['Me'],
            v_dar_objectid_reqfor: [''],
            v_dar_copy_access_profile_of: [''],
            companyName: [''],
            v_dar_organization: [''],
            v_dar_accessType: [''],
            v_dar_ad_group: [''],
            accessDateContS: [''],
            chk_dar_terms_message: [false, Validators.requiredTrue],
            edm_access: [''],
            edm_PI_personal_details: [''],
            expected_other: [''],
            if_other_please_specify: [''],
            IO: ['9322b1171b5e04542a59c8c11a4bcbf0:true'],
            v_custom_control_group: [''],
            v_custom_routing_rule_identifier: [''],
            m_dar_businessJustification_message: [''],
            m_dar_terms_message: [''],
            m_show_pii_message: [''],
            v_dar_accessReqClassification: [''],
            v_dar_accessStage: [''],
            v_dar_userType: ['', {disabled: true}],
            v_dar_additionalInfoContS: [''],
            v_dar_platform:[''],
            v_dar_analytics_platform: [''],
            v_dat_api_name:[''],
            v_dar_post_database_schema:[''],
            v_dar_post_table_names:[''],
            v_dar_tbdp_is_this_request_fort_irm_pricing:[''],
            v_dar_attributeDetails: [''],
            v_dar_businessJustification: ['', Validators.required],
            v_dar_databaseName: [''],
            v_dar_databaseType: [''],
            v_dar_dataDomainSelect: [''],
            v_dar_environment: [''],
            v_dar_expectedAvailability: [''],
            v_dar_frequencyOfUse: [''],
            v_dar_maxUsers: [''],
            v_dar_OtherType: [''],
            v_dar_questionsContS: [''],
            v_dar_reportNames: [''],
            v_dar_requestedDataContS: [''],
            v_dar_sourceApplications: [''],
            v_dar_tableNames: [''],
            v_dar_workdayID: [''],
            v_dat_data_access_type: [''],
            v_edm_3rd_party_vendor: [''],
            v_edm_option: [''],
            v_edm_type_of_work: [''],
            v_emd_PI_access: ['', Validators.required],
            v_emd_specify_PII_needs: [''],
            v_dar_DataReqDescription: ['', Validators.required],
        })

        const storedItem = sessionStorage.getItem('cartItems');
        if (storedItem) {
            const parsed = JSON.parse(storedItem);
            const item = Array.isArray(parsed) ? parsed[0] : parsed;
            this.savedProduct = item.product;
            this.savedFormData = item.formData;
        }

        this.savedFormData = this.loadFormData();
        this.savedProduct = this.loadProduct();

    }

    ngOnChanges(changes: SimpleChanges) {
        // If the item to edit changes (user clicked the edit button)
        if (changes['itemToEdit'] && this.itemToEdit && this.itemToEdit.formData) {
            // This fills all matching fields in your form automatically
            this.form.patchValue(this.itemToEdit.formData);
        }
    }

    getProfile() {
        this.http.get(GRAPH_ENDPOINT).subscribe({
            next: (profile) => {
            this.profile = profile;
            },
            error: (err: AuthError) => {
            if (InteractionRequiredAuthError.isInteractionRequiredError(err.errorCode)) {
                this.authService.acquireTokenPopup({
                scopes: ["user.read"]
                }).subscribe({
                next: (result) => {
                    this.http.get(GRAPH_ENDPOINT).subscribe(profile => {
                    this.profile = profile;
                    });
                }
                });
            }
            }
        });
    }

    get isProductInCart(): boolean {
        return this.cart.items.some(item => item.product.name === this.product?.name);
    }

    // ADD THESE METHODS to support the ngOnInit calls
    loadFormData() {
        const storedItem = sessionStorage.getItem('cartItems');
        if (storedItem) {
            const parsed = JSON.parse(storedItem);
            // Handle if cart is an array or single object
            const item = Array.isArray(parsed) ? parsed[0] : parsed;
            return item?.formData || null;
        }
        return null;
    }

    loadProduct() {
        const storedItem = sessionStorage.getItem('cartItems');
        if (storedItem) {
            const parsed = JSON.parse(storedItem);
            const item = Array.isArray(parsed) ? parsed[0] : parsed;
            return item?.product || null;
        }
        return null;
    }

    private syncWithServiceNow(formData: any) {
        const url = environment.serviceNow.addToCart;
        const headers = new HttpHeaders({
            'Authorization': 'Basic ' + environment.serviceNow.auth,
            'Content-Type': 'application/json'
        });
        const body = {
            sysparm_quantity: '1',
            variables: formData
        };
        return this.http.post(url, body, { headers });
    }

    // Ensure the submit method matches the HTML (addToCart)
    // and sends data to the unified CartService
    addToCart(): void {
        if (!(this.product && this.form.valid)) {
            this.validateAllFormFields(this.form);
            return;
        }

        const isAlreadyInCart = this.cart.items.some(item => item.product.id === this.product.id);
        if (!this.itemToEdit && isAlreadyInCart) {
            this.appSvc.notifyInfo?.(`"${this.product.name}" is already in your cart.`);
            this.state.close();
            return;
        }

        this.addingToCart = true;
        const formData = this.form.getRawValue();

        // Local dev detection: force local-only behavior when not production
        const host = window.location.hostname || '';
        const isLocalhost = host === 'localhost' || host === '127.0.0.1' || host === '::1' || host.includes('local');
        const forcedMock = !!((environment as any).useMockServiceNow) || !environment.production;
        const useLocalOnly = isLocalhost || forcedMock;

        if (useLocalOnly) {
            // LOCAL: skip any ServiceNow API call and add directly to local cart
            this.cart.add(this.product, 1, [], formData).subscribe({
                next: () => {
                    const msg = this.itemToEdit ? `Changes saved.` : `"${this.product.name}" added to cart.`;
                    this.appSvc.notifySuccess?.(msg);
                },
                complete: () => {
                    this.addingToCart = false;
                    this.state.close();
                    this.itemToEdit = null;
                    this.form.reset({ requesting_id: 'Me' });
                },
                error: () => {
                    this.addingToCart = false;
                    this.appSvc.notifyError?.('Failed to add to local cart.');
                }
            });
            return;
        }

        // PRODUCTION / REAL flow: keep original ServiceNow sync logic
        // this.syncWithServiceNow(formData).subscribe({
        //     next: (snResponse) => {
        //     console.log('ServiceNow sync success:', snResponse);
        //     this.cart.add(this.product, 1, [], formData).subscribe({
        //         next: () => {
        //         const msg = this.itemToEdit ? `Changes saved.` : `"${this.product.name}" added to cart.`;
        //         this.appSvc.notifySuccess?.(msg);
        //         },
        //         complete: () => {
        //         this.addingToCart = false;
        //         this.state.close();
        //         this.itemToEdit = null;
        //         this.form.reset({ requesting_id: 'Me' });
        //         },
        //         error: () => this.addingToCart = false
        //     });
        //     },
        //     error: (err) => {
        //     console.error('ServiceNow sync error:', err);
        //     this.appSvc.notifyError?.('Failed to sync with ServiceNow. Please try again.');
        //     this.addingToCart = false;
        //     }
        // });
    }

    updateRequest(): void {
        if (this.product && this.form.valid) {
            this.updatingRequest = true;
            const formData = this.form.getRawValue();

            // Step 1: Post to ServiceNow
            this.syncWithServiceNow(formData).subscribe({
                next: () => {
                    // Step 2: Update local cart
                    this.cart.add(this.product, 1, [], formData).subscribe({
                        next: () => this.appSvc.notifySuccess?.(`Updated "${this.product.name}" request.`),
                        complete: () => {
                            this.updatingRequest = false;
                            this.state.close();
                            this.itemToEdit = null;
                            this.form.reset({ requesting_id: 'Me' });
                        },
                        error: () => this.updatingRequest = false
                    });
                },
                error: (err) => {
                    this.appSvc.notifyError?.('Failed to update ServiceNow request.');
                    this.updatingRequest = false;
                }
            });
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


    close(): void {
        this.state.close();
    }
      
    resetForm() {
        this.form.reset();
    }

}