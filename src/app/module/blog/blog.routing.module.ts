import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BlogListComponent } from './blog-list/blog-list.component';
import { BlogCreateComponent } from './blog-create/blog-create.component';
import { BlogLayoutComponent } from '../../core/blog-layout/blog-layout.component';
import { BlogViewComponent } from './blog-view/blog-view.component';
import { BlogCategoriesComponent } from './blog-categories/blog-categories.component';
import { CategoryBreadcrumbResolver } from '../../services/breadcrumb/category-breadcrumb.resolver';
import { HomeComponent } from './home/home.component';
import { BlogCategoryViewComponent } from './blog-category-view/blog-category-view.component';
import { BlogDetailsComponent } from './blog-details/blog-details.component';
import { CreateBlogComponent } from './create-blog/create-blog.component';

const routes: Routes = [
  { 
    path: '', component: BlogLayoutComponent, children: [
      { path: 'categories', component: BlogCategoriesComponent , data: { breadcrumb: 'Categories' } },
      // { path: 'category/:categoryName', component: BlogListComponent, resolve: { breadcrumb: CategoryBreadcrumbResolver } },
      { path: 'create', component: BlogCreateComponent, data: { breadcrumb: 'Create' } },
      { path: 'view', component: BlogViewComponent,data: { breadcrumb: 'View' } },
      { path: 'home', component: HomeComponent,data: { breadcrumb: 'Home' } },
      { path: 'category/:id', component: BlogCategoryViewComponent , data: { breadcrumb: 'Category' } },
      { path: 'create-post', component: CreateBlogComponent, data: { breadcrumb: 'Create Post' } },
      { path: ':id', component: BlogDetailsComponent, data: { breadcrumb: 'Details' } },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ], data: { breadcrumb: 'Blogs' },

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BlogRoutingModule { }