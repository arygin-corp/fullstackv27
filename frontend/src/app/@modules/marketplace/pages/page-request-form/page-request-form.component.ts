import { Component, OnInit, HostBinding, ElementRef, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MsalService } from '@azure/msal-angular';
import { CartService } from '../../../../@shared/services/cart.service';
import { PodOptions, PodsService } from '../../../../@shared/services/pods.service';
import { ProductService } from '../../../../@shared/services/product.service';
import { AppService } from '../../../../@shared/services/app.service';
import { environment } from '../../../../../environments/environment';
import { Product } from '../../../../@shared/interfaces/product';
import { AuthError, InteractionRequiredAuthError } from '@azure/msal-browser';

const GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0/me?$select=id,displayName,givenName,surname,jobTitle,userPrincipalName,mail,businessPhones,officeLocation,employeeId,department,companyName,streetAddress,city,state,postalCode,country';

@Component({
  selector: 'app-page-request-form',
  templateUrl: './page-request-form.component.html',
  styleUrls: ['./page-request-form.component.scss'],
})

export class PageRequestFormComponent implements OnInit {
  currentApplicationVersion = environment.version;
  @Input() product!: Product;
  quantity: FormControl = new FormControl(1);
  title = "Request Access";
  form: FormGroup;
  addingToCart = false;
  podsOptions: PodOptions[] = [];
  profile;

  constructor(
    private productService: ProductService,
    private msalService: MsalService,
    public router: Router,
    public fb: FormBuilder,
    private http: HttpClient,
    private cart: CartService,
    private podsService: PodsService,
    public appSvc: AppService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      requesting_id: ['Me'],
      requesting_tdsp_processing: ['No'],
      appropriateTDSPPod: [''],
      v_dar_workdayID_created_by: [''],
      workdayID: [''],
      v_dar_objectid_createdby: [''],
      v_dar_objectid_reqfor: ['', Validators.required], //REQUESTED FOR
      v_dar_dm_version: [''],
      productName: [''],
      quantity: [1],
      // Add your form controls here
    });
    this.podsService.getPodsOptions().subscribe({
      next: (options) => this.podsOptions = options || [],
      error: () => this.podsOptions = [],
    });
  }

  getProfile() {
    this.http.get(GRAPH_ENDPOINT).subscribe({
        next: (profile) => {
        this.profile = profile;
        },
        error: (err: AuthError) => {
        if (InteractionRequiredAuthError.isInteractionRequiredError(err.errorCode)) {
            this.msalService.acquireTokenPopup({
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

  addToCart(): void {
    const quantity = this.form.get('quantity')?.value;
    if (!this.addingToCart && this.product && quantity && quantity > 0) {
      this.addingToCart = true;
      this.cart.add(this.product, quantity).subscribe({
        complete: () => this.addingToCart = false
      });
    }
  }

  onFormSubmit(form: FormGroup): void {
    if (form.valid) {
      const quantity = this.form.get('quantity')?.value ?? 1;
      this.cart.add(this.product, quantity).subscribe({
        complete: () => console.log('Product added to cart')
      });
    }
  }

  public open(): void {
    const url = `https://data.toyota.com/docs/protected/domains`;
    const w = 1200; // Set width to 800px
    const h = screen.height; 
    const left = screen.width - w; // Adjusted to position at the right edge
    const top = 0; // Adjusted to position at the top edge
    const randomnumber = Math.floor((Math.random() * 100) + 1);
    // tslint:disable-next-line:max-line-length
    window.open(url, '_blank', 'PopUp' + randomnumber + ',scrollbars=1,menubar=0,resizable=1,width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);
  }
}
