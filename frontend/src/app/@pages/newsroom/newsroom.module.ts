import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//modules
import { SharedModule } from '../../@shared/shared.module';
import { NewsroomRoutingModule } from './newsroom-routing.module';
//components
import { LayoutComponent } from './components/layout/layout.component';
import { NewsroomComponent } from './newsroom.component';
import { PagePostDetailsComponent } from './pages/page-post-details/page-post-details.component';

@NgModule({
  declarations: [
    LayoutComponent,
    NewsroomComponent,
    PagePostDetailsComponent,
  ],
  exports: [
    LayoutComponent,
    NewsroomComponent,
    PagePostDetailsComponent,
  ],
  imports: [
    CommonModule,
    NewsroomRoutingModule,
    SharedModule
  ]
})

export class NewsroomModule { }
