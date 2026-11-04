import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// modules
import { SharedModule } from 'src/app/@shared/shared.module';
import { SupportRoutingModule } from './support-routing.module';
//components
import { SupportComponent } from './support.component';
import { LayoutComponent } from './components/layout/layout.component';
import { PageGettingStartedComponent } from './pages/page-getting-started/page-getting-started.component';
import { PageIntegrationsComponent } from './pages/page-integrations/page-integrations.component';
import { PageAwsComponent } from './pages/page-aws/page-aws.component';
import { PageCloudServerComponent } from './pages/page-cloud-server/page-cloud-server.component';
import { PageQuickIntegrationComponent } from './pages/page-quick-integration/page-quick-integration.component';


@NgModule({
  declarations: [
    SupportComponent,
    LayoutComponent,
    PageGettingStartedComponent,
    PageIntegrationsComponent,
    PageAwsComponent,
    PageCloudServerComponent,
    PageQuickIntegrationComponent
  ],
  exports: [
    SupportComponent,
    LayoutComponent,
    PageGettingStartedComponent,
    PageIntegrationsComponent,
    PageAwsComponent,
    PageCloudServerComponent,
    PageQuickIntegrationComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    SupportRoutingModule
  ]
})
export class SupportModule { }
