import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { NewsroomComponent } from './newsroom.component';
import { PagePostDetailsComponent } from './pages/page-post-details/page-post-details.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: NewsroomComponent },                          // /newsroom
      { path: 'category/:category', component: NewsroomComponent },        // /newsroom/category/updates
      { path: 'post/:category/:slug', component: PagePostDetailsComponent } // /newsroom/post/features/...
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class NewsroomRoutingModule { }
