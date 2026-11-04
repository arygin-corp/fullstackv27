import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomainsRoutingModule } from './domains-routing.module';
import { SharedModule } from 'src/app/@shared/shared.module';

import { DomainsComponent } from './domains.component';
import { SubdomainsOneComponent } from '../domains/subdomains/subdomains-one/subdomains-one.component';
import { SubdomainsTwoComponent } from '../domains/subdomains/subdomains-two/subdomains-two.component';

@NgModule({
  declarations: [
    DomainsComponent,
    SubdomainsOneComponent,
    SubdomainsTwoComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    DomainsRoutingModule
  ]
})
export class DomainsModule { }
