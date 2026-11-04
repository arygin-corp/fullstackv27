// src/app/@pages/domains/domains-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DomainsComponent } from './domains.component';
import { SubdomainsOneComponent } from '../domains/subdomains/subdomains-one/subdomains-one.component';
import { SubdomainsTwoComponent } from '../domains/subdomains/subdomains-two/subdomains-two.component';
import { MsalGuard } from '@azure/msal-angular';

const routes: Routes = [
  {
    path: "",
    component: DomainsComponent,
    canActivate: [MsalGuard]
  },
  {
    path: ":type",
    component: SubdomainsOneComponent,
    canActivate: [MsalGuard]
  },
  {
    path: ":type/:subtype",
    component: SubdomainsTwoComponent,
    canActivate: [MsalGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DomainsRoutingModule { }
