import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DataAccessRequestComponent } from './data-access-request/data-access-request.component';

const routes: Routes = [
  {
    path: 'data-access-request',
    redirectTo: 'data-access-request',
    pathMatch: 'full'
  },
  {
    path: 'data-access-request',
    component: DataAccessRequestComponent,
    data: { 
      title: 'Data Access Request',
      version: 'MDARF-v2' 
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Forms2RoutingModule { }