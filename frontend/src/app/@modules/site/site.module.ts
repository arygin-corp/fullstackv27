import { NgModule } from '@angular/core';
// modules (angular)
import { CommonModule } from '@angular/common';
// modules (third-party)
import { CarouselModule } from 'ngx-owl-carousel-o';
// modules
import { BlocksModule } from '../blocks/blocks.module';
import { SharedModule } from '../../@shared/shared.module';
import { SiteRoutingModule } from './site-routing.module';
// pages
import { PageAboutUsComponent } from './pages/page-about-us/page-about-us.component';
import { PageContactUsComponent } from './pages/page-contact-us/page-contact-us.component';
import { PageFaqComponent } from './pages/page-faq/page-faq.component';
import { PageTermsComponent } from './pages/page-terms/page-terms.component';
import { PageChangelogComponent } from './pages/page-changelog/page-changelog.component';
import { PageDisclaimerComponent } from './pages/page-disclaimer/page-disclaimer.component';
import { PagePrivacyPolicyComponent } from './pages/page-privacy-policy/page-privacy-policy.component';

@NgModule({
    declarations: [
        // pages
        PageAboutUsComponent,
        PageContactUsComponent,
        PageFaqComponent,
        PageTermsComponent,
        PageChangelogComponent,
        PageDisclaimerComponent,
        PagePrivacyPolicyComponent
    ],
    imports: [
        // modules (angular)
        CommonModule,
        // modules (third-party)
        CarouselModule,
        // modules
        BlocksModule,
        SharedModule,
        SiteRoutingModule
    ]
})
export class SiteModule { }
