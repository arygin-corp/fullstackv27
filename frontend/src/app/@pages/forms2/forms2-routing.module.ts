import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'data-access-request',
    loadChildren: () => import('./data-access-request/data-access-request.module').then(m => m.DataAccessRequestModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Forms2RoutingModule { }
