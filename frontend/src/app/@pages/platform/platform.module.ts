import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../@shared/shared.module';
import { PlatformRoutingModule } from './platform-routing.module';

import { PlatformComponent } from './platform.component';
import { LayoutComponent } from './components/layout/layout.component';


@NgModule({
  declarations: [
    PlatformComponent,
    LayoutComponent,
  ],
  exports: [
    PlatformComponent,
    LayoutComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    PlatformRoutingModule
  ]
})
export class PlatformModule { }
