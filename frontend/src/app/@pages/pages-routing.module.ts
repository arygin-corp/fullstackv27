import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//components
import { TeamComponent } from './team/team.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { RoadmapComponent } from './roadmap/roadmap.component';
import { HackathonComponent } from './hackathon/hackathon.component';
import { SupportComponent } from './support/support.component';
import { CampaignsComponent } from './campaigns/campaigns.component';
import { OrgComponent } from './org/org.component';
import { ProductIntakeComponent } from './product-intake/product-intake.component';

const routes: Routes = [
  { path: 'team', component: TeamComponent },
  { path: 'roadmap', component: RoadmapComponent },
  { path: 'hackathon', component: HackathonComponent },
  { path: 'support', component: SupportComponent },
  { path: 'ads', component: CampaignsComponent },
  { path: 'product-intake', component: ProductIntakeComponent },
  { path: 'organization-chart', component: OrgComponent },
  { path: 'landing', component: LandingPageComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
