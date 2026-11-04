import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/@shared/shared.module';
import { Forms2RoutingModule } from './forms2-routing.module'; 
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgSelectModule } from '@ng-select/ng-select';

import { DataAccessRequestComponent } from './data-access-request/data-access-request.component';
// import { FieldErrorDisplayComponent } from './data-access-request/field-error-display/field-error-display.component';

@NgModule({
  declarations: [
    DataAccessRequestComponent,
    // FieldErrorDisplayComponent
  ],
  imports: [
    CommonModule,
    Forms2RoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    NgbModule,
    NgSelectModule
  ]
})
export class Forms2Module { }