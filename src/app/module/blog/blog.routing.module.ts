import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BlogListComponent } from './blog-list/blog-list.component';
import { BlogCreateComponent } from './blog-create/blog-create.component';
import { BlogLayoutComponent } from '../../core/blog-layout/blog-layout.component';
import { BlogViewComponent } from './blog-view/blog-view.component';
import { BlogCategoriesComponent } from './blog-categories/blog-categories.component';
import { CategoryBreadcrumbResolver } from '../../services/breadcrumb/category-breadcrumb.resolver';

const routes: Routes = [
  { 
    path: '', component: BlogLayoutComponent, children: [
      { path: 'categories', component: BlogCategoriesComponent , data: { breadcrumb: 'Categories' } },
      { path: 'category/:categoryName', component: BlogListComponent, resolve: { breadcrumb: CategoryBreadcrumbResolver } },
      { path: 'create', component: BlogCreateComponent, data: { breadcrumb: 'Create' } },
      { path: 'view', component: BlogViewComponent,data: { breadcrumb: 'View' } },
      { path: '', redirectTo: 'categories', pathMatch: 'full' },
    ], data: { breadcrumb: 'Blogs' },

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BlogRoutingModule { }