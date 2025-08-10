import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService, Blog, Category } from '../../../services/api.service';
import { SharedModule } from '../../shared/shared.module';
import { BlogCardComponent } from '../blog-card/blog-card.component';

@Component({
  selector: 'app-blog-category-view',
  standalone: true,
  imports: [SharedModule, BlogCardComponent, RouterModule],
  templateUrl: './blog-category-view.component.html',
  styleUrls: ['./blog-category-view.component.scss']
})
export class BlogCategoryViewComponent {
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);

  category = signal<Category | null>(null);
  blogs = signal<Blog[]>([]);

  constructor() {
    effect(() => {
      const params = this.route.snapshot.params;
      const categoryId = +params['id'];
      if (categoryId) {
        this.loadCategoryData(categoryId);
      }
    });
  }

  private loadCategoryData(categoryId: number) {

    this.apiService.getCategory(categoryId).subscribe({
      next: (response) => {
        if (response.success) {
          this.category.set(response.data);
        }
        this.loadCategoryBlogs(categoryId);
      }
    });
  }

  private loadCategoryBlogs(categoryId: number) {
    this.apiService.getCategoryBlogs(categoryId).subscribe({
      next: (response) => {
        if (response.success) {
          this.blogs.set(response.data);
        }
      },
      error: () => {}
    });
  }
}
