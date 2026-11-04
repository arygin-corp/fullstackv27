import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourcesRoutingModule } from './resources-routing.module';
import { ResourcesComponent } from './resources.component';
import { LayoutComponent } from './components/layout/layout.component';
import { TabLayoutComponent } from './components/tab-layout/tab-layout.component';
import { PagesMediaPostComponent } from './pages/pages-media-post/pages-media-post.component';
import { PagesMediaPostDetailsComponent } from './pages/pages-media-post-details/pages-media-post-details.component';
import { PagesDocumentsPostComponent } from './pages/pages-documents-post/pages-documents-post.component';
import { PagesDocumentsPostDetailsComponent } from './pages/pages-documents-post-details/pages-documents-post-details.component';
import { PagesBrandsPostDetailsComponent } from './pages/pages-brands-post-details/pages-brands-post-details.component';
import { PagesBrandsComponent } from './pages/pages-brands/pages-brands.component';
import { PagesPoliciesDetailsComponent } from './pages/pages-policies-details/pages-policies-details.component';
import { PagesPoliciesComponent } from './pages/pages-policies/pages-policies.component';
import { PagesProcessesComponent } from './pages/pages-processes/pages-processes.component';
import { PagesProcessesDetailsComponent } from './pages/pages-processes-details/pages-processes-details.component';
import { PagesMindMapComponent } from './pages/pages-mind-map/pages-mind-map.component';


@NgModule({
  declarations: [
    ResourcesComponent,
    LayoutComponent,
    TabLayoutComponent,
    PagesMediaPostComponent,
    PagesMediaPostDetailsComponent,
    PagesDocumentsPostComponent,
    PagesDocumentsPostDetailsComponent,
    PagesBrandsPostDetailsComponent,
    PagesBrandsComponent,
    PagesPoliciesDetailsComponent,
    PagesPoliciesComponent,
    PagesProcessesComponent,
    PagesProcessesDetailsComponent,
    PagesMindMapComponent,
  ],
  exports: [
    ResourcesComponent,
    LayoutComponent,
    TabLayoutComponent,
    PagesMediaPostComponent,
    PagesMediaPostDetailsComponent,
    PagesDocumentsPostComponent,
    PagesDocumentsPostDetailsComponent,
    PagesBrandsPostDetailsComponent,
    PagesBrandsComponent,
    PagesPoliciesDetailsComponent,
    PagesPoliciesComponent,
    PagesProcessesComponent,
    PagesProcessesDetailsComponent,
  ],
  imports: [
    CommonModule,
    ResourcesRoutingModule,
  ]
})
export class ResourcesModule { }
