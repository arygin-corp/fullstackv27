import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RootComponent } from './@components/root/root.component'; 
import { LandingPageComponent } from './@pages/landing-page/landing-page.component';
import { PageNotFoundComponent } from './@pages/error-pages/page-not-found/page-not-found.component';
import { MsalGuard } from "@azure/msal-angular";
import { DomainsComponent } from './@pages/domains/domains.component';

const routes: Routes = [
    // 1. Pprotected
    // { 
    //     path: '', 
    //     component: DomainsComponent, 
    //     canActivate: [MsalGuard],
    // },
    // 2. Main Application Wrapper (Protected)
    {   
        path: '',
        component: RootComponent,
        canActivate: [MsalGuard],
        data: { 
            headerLayout: 'classic', 
            dropcartType: 'offcanvas' 
        },
        children: [
            /**
             * 3. SPECIFIC SUB-MODULES
             * These must come BEFORE the base 'marketplace' path to prevent shadowing.
             */
            {
                path: 'marketplace/user',
                loadChildren: () => import('./@user/user.module').then(m => m.UserModule)
            },
            {
                path: 'docs/protected',
                loadChildren: () => import('./@docs/docs.module').then(m => m.DocsModule)
            },
            /**
             * 4. MAIN MODULES
             */
            {
                path: 'marketplace',
                loadChildren: () => import('./@modules/marketplace/marketplace.module').then(m => m.MarketplaceModule)
            },
            {
                path: 'newsroom',
                loadChildren: () => import('./@pages/newsroom/newsroom.module').then(m => m.NewsroomModule)
            },
            {
                path: 'form',
                loadChildren: () => import('./@pages/forms2/forms2.module').then(m => m.Forms2Module)
            },
            {
                path: 'blog',
                loadChildren: () => import('./@modules/blog/blog.module').then(m => m.BlogModule)
            },
            {
                path: 'changelog',
                loadChildren: () => import('./@modules/changelog/changelog.module').then(m => m.ChangelogModule)
            },
            {
                path: 'pages',
                loadChildren: () => import('./@pages/pages.module').then(m => m.PagesModule)
            },
            {
                path: 'site',
                loadChildren: () => import('./@modules/site/site.module').then(m => m.SiteModule)
            },
            {
                path: 'resources', 
                loadChildren: () => import('./@pages/resources/resources.module').then(m => m.ResourcesModule)
            },
            // {
            //     path: 'platforms',
            //     loadChildren: () => import('./@pages/platform/platform.module').then(m => m.PlatformModule)
            // },
            {
                path: '',
                loadChildren: () => import('./@pages/domains/domains.module').then(m => m.DomainsModule)
            },
            /**
             * 5. FALLBACKS
             */
            {
                path: '404',
                component: PageNotFoundComponent
            },
            {
                path: '**',
                redirectTo: '404' // Better to redirect to '/404' explicitly
            }
        ],
    },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            scrollPositionRestoration: 'disabled',
            anchorScrolling: 'enabled',
            initialNavigation: 'enabled',
            relativeLinkResolution: 'legacy'
        })
    ],
    exports: [RouterModule]
})

export class AppRoutingModule { }