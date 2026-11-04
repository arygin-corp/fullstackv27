import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { ResourcesComponent } from './resources.component'; 
import { PagesMediaPostComponent } from './pages/pages-media-post/pages-media-post.component';
import { PagesMediaPostDetailsComponent } from './pages/pages-media-post-details/pages-media-post-details.component';
import { PagesDocumentsPostComponent } from './pages/pages-documents-post/pages-documents-post.component';
import { PagesDocumentsPostDetailsComponent } from './pages/pages-documents-post-details/pages-documents-post-details.component';
import { PagesBrandsComponent } from './pages/pages-brands/pages-brands.component';
import { PagesBrandsPostDetailsComponent } from './pages/pages-brands-post-details/pages-brands-post-details.component';
import { PagesPoliciesComponent } from './pages/pages-policies/pages-policies.component';
import { PagesPoliciesDetailsComponent } from './pages/pages-policies-details/pages-policies-details.component';
import { PagesProcessesComponent } from './pages/pages-processes/pages-processes.component';
import { PagesProcessesDetailsComponent } from './pages/pages-processes-details/pages-processes-details.component';
import { PagesMindMapComponent } from './pages/pages-mind-map/pages-mind-map.component';

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
                path: '',
                component: ResourcesComponent
            },
            {
                path: 'brands',
                component: PagesBrandsComponent
            },
            {
                path: 'brands/details/:id',
                component: PagesBrandsPostDetailsComponent
            },
            {
                path: 'docs',
                component: PagesDocumentsPostComponent
            },
            {
                path: 'docs/details/:id',
                component: PagesDocumentsPostDetailsComponent
            },
            {
                path: 'policies',
                component: PagesPoliciesComponent
            },
            {
                path: 'policies/details/:id',
                component: PagesPoliciesDetailsComponent
            },
            {
                path: 'processes',
                component: PagesProcessesComponent
            },
            {
                path: 'processes/details/:id',
                component: PagesProcessesDetailsComponent
            },
            {
                path: 'media',
                component: PagesMediaPostComponent
            },
            {
                path: 'media/details/:id',
                component: PagesMediaPostDetailsComponent
            },
            {
                path: 'mind-map',
                component: PagesMindMapComponent
            },
        ]
    }
];

@NgModule({
imports: [RouterModule.forChild(routes)],
exports: [RouterModule]
})

export class ResourcesRoutingModule { }

