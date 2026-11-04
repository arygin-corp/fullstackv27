import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestAccessComponent } from './components/request-access/request-access.component';

@NgModule({
  declarations: [
    RequestAccessComponent
  ],
  exports: [
    RequestAccessComponent
  ],
  imports: [
    CommonModule
  ]
})

export class ProductModule { }
