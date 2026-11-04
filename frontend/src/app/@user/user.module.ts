import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRoutingModule } from './user-routing.module';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../@shared/shared.module';
import { AvatarModule } from 'ngx-avatar';
import { NgxPaginationModule } from "ngx-pagination";
import { LayoutComponent } from './components/layout/layout.component'
import { PageProfileComponent } from './pages/page-profile/page-profile.component';
import { PageOrderListComponent } from './pages/page-order-list/page-order-list.component';
import { PageOrderDetailsComponent } from './pages/page-order-details/page-order-details.component';
import { PageDashboardComponent } from './pages/page-dashboard/page-dashboard.component';

@NgModule({
  declarations: [
    LayoutComponent,
    PageDashboardComponent,
    PageOrderDetailsComponent,
    PageOrderListComponent,
    PageProfileComponent
  ],
  exports: [
    LayoutComponent,
    PageDashboardComponent,
    PageOrderDetailsComponent,
    PageOrderListComponent,
    PageProfileComponent
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    FormsModule,
    SharedModule,
    AvatarModule,
    NgxPaginationModule
  ]
})

export class UserModule { }
