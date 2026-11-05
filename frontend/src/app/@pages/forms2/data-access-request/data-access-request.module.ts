import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from 'src/app/@shared/shared.module';
import { DataAccessRequestComponent } from './data-access-request.component';
import { FieldErrorDisplayComponent } from './field-error-display/field-error-display.component';

const routes: Routes = [{
  path: '',
  component: DataAccessRequestComponent,
  data: {
    title: 'Data Access Request',
    version: 'MDARF-v2'
  }
}];

@NgModule({
  declarations: [
    DataAccessRequestComponent,
    FieldErrorDisplayComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgbModule,
    NgSelectModule,
    RouterModule.forChild(routes)
  ]
})
export class DataAccessRequestModule {}
