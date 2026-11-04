import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageCategoryComponent } from './pages/page-category/page-category.component';
import { PagePostComponent } from './pages/page-post/page-post.component';

const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'post'
    },
    {
        path: 'post-list',
        component: PageCategoryComponent,
        data: {
            sidebarPosition: 'end', // one of [start, end]. For LTR scripts "start" is "left" and "end" is "right"
            layout:          'list' // one of [classic, grid, list]
        }
    },
    {
        path: 'post',
        component: PagePostComponent,
        data: {
            sidebarPosition: 'end',    // one of [start, end]. For LTR scripts "start" is "left" and "end" is "right"
            layout:          'classic'
        }
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ChangelogRoutingModule { }
