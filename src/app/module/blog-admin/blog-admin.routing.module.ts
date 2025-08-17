import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BlogAdminLayoutComponent } from '../../core/blog-admin-layout/blog-admin-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CreateBlogComponent } from '../blog/create-blog/create-blog.component';
import { CategoriesComponent } from './categories/categories.component';
import { SubcategoriesComponent } from './subcategories/subcategories.component';
import { BlogsComponent } from './blogs/blogs.component';


const routes: Routes = [
  { 
    path: '', component: BlogAdminLayoutComponent, children: [
      { path: 'dashboard', component: DashboardComponent, data: { breadcrumb: 'Dashboard' } },
      { path: 'create-post', component: CreateBlogComponent, data: { breadcrumb: 'Create Post' } },
      { path: 'categories', component: CategoriesComponent, data: { breadcrumb: 'Categories' } },
      { path: 'subcategories', component: SubcategoriesComponent, data: { breadcrumb: 'Subcategories' } },
      { path: 'blogs', component: BlogsComponent, data: { breadcrumb: 'Blogs' } },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ], data: { breadcrumb: 'Admin' },

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BlogAdminRoutingModule { }