import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BlogLayoutComponent } from '../../core/blog-layout/blog-layout.component';
import { HomeComponent } from './home/home.component';
import { BlogCategoryViewComponent } from './blog-category-view/blog-category-view.component';
import { BlogDetailsComponent } from './blog-details/blog-details.component';
import { BlogFormComponent } from './create-blog/create-blog.component';

const routes: Routes = [
  { 
    path: '', component: BlogLayoutComponent, children: [
      { path: 'home', component: HomeComponent, data: { breadcrumb: 'Home', hideBreadcrumb: true } },
      { path: 'category/:id', component: BlogCategoryViewComponent , data: { breadcrumb: 'Category' } },
      { path: 'create-post', component: BlogFormComponent, data: { breadcrumb: 'Create Post' } },
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