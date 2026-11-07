import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormControl, Validators, ValidatorFn } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { CartService } from '../../../../@shared/services/cart.service';
import { RootService } from '../../../../@shared/services/root.service';
import { OffcanvasProductService } from '../../../../../app/@shared/services/offcanvas-product.service';
import { AppService } from '../../../../@shared/services/app.service';
import { MsalService } from "@azure/msal-angular";
import { NotificationService } from '../../../../@shared/services/notification.service';
import { environment } from '../../../../../environments/environment';
import { NewProductService } from '../../../../@shared/services/new-product.service';

export type DropcartType = 'dropdown' | 'offcanvas';

@Component({
    selector: 'app-header-dropproduct',
    templateUrl: './dropproduct.component.html',
    styleUrls: ['./dropproduct.component.scss']
})

export class DropproductComponent {
    @Input() type: DropcartType = 'dropdown';
    @Output() closeMenu: EventEmitter<void> = new EventEmitter<void>();
    addNewProductForm:FormGroup;
    productType$:Subscription;
    imageConfirm$:Subscription;
    productPII$:Subscription;
    typeIsReportOrDashboardOrWebservice:boolean=true;
    typeIsDashboardOrAPI:boolean=false;
    selectedOption;
    isShow: boolean = false;
    PIIHasValue:boolean=false;
    public shouldShow = false;
    public shouldHide = true; 
    isFieldValid: any;
    isRequiredField: any;
    productTags: FormArray;
    availableTags: any[] = []; // Add this property

    constructor(
        public state: OffcanvasProductService,
        public newState: NewProductService, // Engine B Service
        public cart: CartService,
        public root: RootService,
        public fb: FormBuilder,
        private http: HttpClient,
        private msalService: MsalService,
        public appSvc: AppService,
        private notify:NotificationService,
        ) { }

    // Add auto-save logic
    onFormChange() {
        this.newState.saveDraft(this.addNewProductForm.value);
    }

    onSubmit(): void {
        if (this.addNewProductForm.valid) {
            this.addingToCart = true; // Use loading state

            this.newState.submitToStaging(this.addNewProductForm.value).subscribe({
                next: (response) => {
                    this.addingToCart = false;
                    this.newState.clearDraft();
                    this.state.close();
                    this.appSvc.notifySuccess?.("Your new product request was successfully added to our queue!");
                },
                error: (err) => {
                    this.addingToCart = false;
                    this.appSvc.notifyError?.("Your new product request was not submitted!");
                }
            });
        }
    }

    ngOnInit() {
        this.generateForm();
        this.fillRequester();
        this.setFormValidators('');
        const productTypeControl = this.addNewProductForm.get('productType');
        const productURLControl = this.addNewProductForm.get('productURL');
        const productPIIControl = this.addNewProductForm.get('productPII');
        
        if (productTypeControl && productURLControl) {
            this.productType$ = productTypeControl.valueChanges.subscribe((value) => {
                this.setFormValidators(value);
                this.typeIsDashboardOrAPI = ['Dashboard', 'Webservice (API)'].indexOf(value) > -1;
                productURLControl.reset('');
            });
        }
        
        if (productPIIControl) {
            this.productPII$ = productPIIControl.valueChanges.subscribe((value) => {
                this.setPIIValidators(value);
            });
        }
    }

    fillRequester(): void {
        const user = this.appSvc?.userData;
        if (!user || !this.addNewProductForm) {
            return;
        }
        this.addNewProductForm.patchValue({
            requesterName: `${user.givenName || ''} ${user.surname || ''}`.trim(),
            requesterID: user.id || '',
            requesterMail: user.mail || user.userPrincipalName || ''
        });
    }

    generateForm():void{
        this.addNewProductForm=this.fb.group({
            requestingAdd:['', Validators.required],
            requesterName:[''],
            requesterMail:[''],
            requesterID:[''],
            productName:['', Validators.required],
            productDesc:['', [Validators.required, Validators.minLength(16)]],
            productType:['', Validators.required],
            productURL:[''],
            productTags: [[]],
            productDomain:['', Validators.required],
            stakeholderName:['', Validators.required],
            productPII:['', Validators.required],
            piiExplanation:[''],
            fulfillmentGroup:['', [Validators.required, Validators.minLength(10)]]
        });
    }

    setFormValidators(productType:string):void {
        const productURL= this.addNewProductForm.get('productURL');
        const productTags= this.addNewProductForm.get('productTags');
        const productDomain= this.addNewProductForm.get('productDomain');
        const stakeholderName= this.addNewProductForm.get('stakeholderName');
        const productPII= this.addNewProductForm.get('productPII');
        if (productURL) productURL.clearValidators();
        if (productTags) productTags.clearValidators();
        if (productDomain) productDomain.clearValidators();
        if (stakeholderName) stakeholderName.clearValidators();
        if (productPII) productPII.clearValidators();

        this.typeIsReportOrDashboardOrWebservice=false;

        switch(productType){
        case 'Report':
        case 'Dashboard' : 
        case 'Webservice (API)' :{
            this.typeIsReportOrDashboardOrWebservice=true;
            if (productTags) productTags.setValidators(Validators.required);
            if (productDomain) productDomain.setValidators(Validators.required);
            if (stakeholderName) stakeholderName.setValidators(Validators.required);
            if (productPII) productPII.setValidators(Validators.required);
            if (productURL) productURL.setValidators([Validators.required,Validators.minLength(16)]);
            break;
        }
        case 'Data Science Model' :
        case 'Dataset' : {
            if (productTags) productTags.setValidators(Validators.required);
            if (productDomain) productDomain.setValidators(Validators.required);
            if (stakeholderName) stakeholderName.setValidators(Validators.required);
            if (productPII) productPII.setValidators(Validators.required);
            break;
        }
        
        default : {
            this.typeIsReportOrDashboardOrWebservice=true;
            if (productTags) productTags.setValidators(Validators.required);
            if (productDomain) productDomain.setValidators(Validators.required);
            if (stakeholderName) stakeholderName.setValidators(Validators.required);
            if (productPII) productPII.setValidators(Validators.required);
        }
        }
        if (productURL) productURL.updateValueAndValidity();
        if (productTags) productTags.updateValueAndValidity();
        if (productDomain) productDomain.updateValueAndValidity();
        if (stakeholderName) stakeholderName.updateValueAndValidity();
        if (productPII) productPII.updateValueAndValidity();
    }
    
    setPIIValidators(productPIIvalue:string):void{
        this.PIIHasValue=productPIIvalue=='true' || productPIIvalue=='false';
        const piiExplanation= this.addNewProductForm.get('piiExplanation');
        const fulfillmentGroup= this.addNewProductForm.get('fulfillmentGroup');
        if (piiExplanation) piiExplanation.clearValidators();
        if (fulfillmentGroup) fulfillmentGroup.clearValidators();

        if (fulfillmentGroup) fulfillmentGroup.setValidators([Validators.required, Validators.minLength(10)]);
        if(productPIIvalue=="true"){
            if (piiExplanation) piiExplanation.setValidators([Validators.required,Validators.minLength(12)]);
        }
        if (piiExplanation) piiExplanation.updateValueAndValidity();
        if (fulfillmentGroup) fulfillmentGroup.updateValueAndValidity();
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

    ngOnDestroy(): void {
        this.productType$.unsubscribe();
    }

    displayFieldCss(field: string): { [key: string]: boolean } {
        return {
            'has-error': this.isFieldValid(field),
            'has-feedback': this.isFieldValid(field)
        };
    }

    validateField(field: string):boolean {
        const formField = this.addNewProductForm.get(field);
        return formField ? !formField.valid && formField.touched : false;
    }    
    
    isFieldRequired(field: string):boolean {
        const form_field = this.addNewProductForm.get(field);
        if (!form_field || !form_field.validator) {
            return false;
        }

        const validator = form_field.validator({} as AbstractControl);
        return (validator && validator.required);
    }

    close(): void {
        this.state.close();
    }
      
    resetForm() {
        this.addNewProductForm.reset();
    }

    @Input() control: FormControl;
    addingToCart = false;
    users: User[] = [];
    searchInput: string;
    inputValue: string;
    pageNo: number = 1;
    fieldHasFocus: boolean = false;
    response: UserDto = new UserDto();
    selectedUser: User;

    filterSeries(value: any) {
        this.GetUsers(value);
        this.pageNo = 1;
    }

    async GetUsers(value: any) {
        if (value === '') {
        this.response = new UserDto();
        } else {
        const headers = new HttpHeaders().set('x-api-key', environment.gdx.users);
        this.response = await this.http.get<UserDto>(`${environment.gdx.users}${value}`, { headers }).toPromise();
        console.log(this.response); // Log the response to check the structure
        this.users = this.response.value;
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

    onSearch(event: any) {
        this.filterSeries(event.term);
    }

    testSearch(term: string, item: User): boolean {
        term = term.toLowerCase();
        return item.givenName.toLowerCase().includes(term) || item.surname.toLowerCase().includes(term) || item.companyName.toLowerCase().includes(term) || item.department.toLowerCase().includes(term) || item.mail.toLowerCase().includes(term);
    }

    onTagAdd(event: any): void {
        // Implement tag addition logic
        console.log('Tag added:', event);
    }
}

export class UserDto {
  context: string;
  count: number;
  nextLink: string;
  value: User[];
}

export class User {
  id: string;
  accountEnabled?: boolean;
  displayName: string;
  givenName: string;
  surname: string;
  companyName: string;
  department: string;
  mail: string;
}
