import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//modules
import { FormsModule } from '@angular/forms';
import { Forms2Module } from './forms2/forms2.module';
import { PagesRoutingModule } from './pages-routing.module';
import { SharedModule } from '../@shared/shared.module';
import { BlocksModule } from './../@modules/blocks/blocks.module';
import { CarouselModule } from 'ngx-owl-carousel-o';

//components
import { TeamComponent } from './team/team.component';
import { HackathonComponent } from './hackathon/hackathon.component';
import { RoadmapComponent } from './roadmap/roadmap.component';
import { CampaignsComponent } from './campaigns/campaigns.component';
import { OrgComponent } from './org/org.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { ProductIntakeComponent } from './product-intake/product-intake.component';
import { FeatureWalkthroughComponent, OpenFeatureWalkthroughComponent } from './feature-walkthrough/feature-walkthrough.component';

@NgModule({
  declarations: [
    TeamComponent,
    HackathonComponent,
    RoadmapComponent,
    CampaignsComponent,
    OrgComponent,
    LandingPageComponent,
    ProductIntakeComponent,
    FeatureWalkthroughComponent,
    OpenFeatureWalkthroughComponent,
  ],
  exports: [
    FeatureWalkthroughComponent,
    TeamComponent,
    HackathonComponent,
    RoadmapComponent,
    CampaignsComponent,
    LandingPageComponent,
    OrgComponent
  ],
  imports: [
    CommonModule,
    PagesRoutingModule,
    FormsModule,
    Forms2Module,
    SharedModule,
    CarouselModule,
    BlocksModule
  ]
})

export class PagesModule { }
