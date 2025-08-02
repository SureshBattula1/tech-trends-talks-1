import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComponentSidenavComponent } from '../../core/component-sidenav/component-sidenav.component';
import { BlogListComponent } from './blog-list/blog-list.component';
import { BlogCreateComponent } from './blog-create/blog-create.component';
import { BlogLayoutComponent } from '../../core/blog-layout/blog-layout.component';
import { BlogViewComponent } from './blog-view/blog-view.component';

const routes: Routes = [
  // { 
  //   path: '', component: ComponentSidenavComponent, children: [
  //     { path: 'list', component: BlogListComponent },
  //     { path: 'create', component: BlogCreateComponent },
  //     { path: 'view', component: BlogViewComponent },
  //     { path: '', redirectTo: 'list', pathMatch: 'full' },
  //   ]
  // },
  { 
    path: '', component: BlogLayoutComponent, children: [
      { path: 'list', component: BlogListComponent, data: { breadcrumb: 'List' } },
      { path: 'create', component: BlogCreateComponent, data: { breadcrumb: 'Create' } },
      { path: 'view', component: BlogViewComponent,data: { breadcrumb: 'View' } },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ], data: { breadcrumb: 'Blogs' },

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BlogRoutingModule { }