import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from '../support/components/layout/layout.component';
import { SupportComponent } from './support.component';
import { PageGettingStartedComponent } from './pages/page-getting-started/page-getting-started.component';
import { PageIntegrationsComponent } from './pages/page-integrations/page-integrations.component';
import { PageAwsComponent } from './pages/page-aws/page-aws.component';
import { PageCloudServerComponent } from './pages/page-cloud-server/page-cloud-server.component';
import { PageQuickIntegrationComponent } from './pages/page-quick-integration/page-quick-integration.component';

const routes: Routes = [
  {
      path: '',
      component: LayoutComponent,
      children: [
          {
              path: '',
              pathMatch: 'full',
              redirectTo: 'home'
          },
          {
            path: 'support',
            component: SupportComponent
          }, 
          {
              path: 'support/getting-started',
              component: PageGettingStartedComponent
          },
          {
              path: 'support/integrations',
              component: PageIntegrationsComponent
          },
          {
              path: 'support/aws',
              component: PageAwsComponent
          },
          {
              path: 'support/cloud-server',
              component: PageCloudServerComponent
          },
          {
              path: 'support/quick-integrations',
              component: PageQuickIntegrationComponent
          },
      ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class SupportRoutingModule { }