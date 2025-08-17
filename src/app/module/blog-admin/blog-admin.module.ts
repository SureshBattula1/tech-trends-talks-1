import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogAdminRoutingModule } from './blog-admin.routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CategoriesComponent } from './categories/categories.component';

@NgModule({
  declarations: [
    // DashboardComponent,
    // CategoriesComponent
  ],
  imports: [
    CommonModule,
    BlogAdminRoutingModule
  ]
})
export class BlogAdminModule { }
