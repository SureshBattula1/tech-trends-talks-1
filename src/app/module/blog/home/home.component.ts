import { Component } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { Router, RouterModule } from '@angular/router';
import { BlogCategoriesComponent } from '../blog-categories/blog-categories.component';
import { BlogListItemComponent } from '../blog-list-item/blog-list-item.component';
import { BlogListComponent } from '../blog-list/blog-list.component';
import { BlogCardComponent } from '../blog-card/blog-card.component';
import { ApiService, Blog, Category } from '../../../services/api.service';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SharedModule, RouterModule, BlogCategoriesComponent, BlogListComponent, BlogCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  featuredBlogs: Blog[] = [];
  latestBlogs: Blog[] = [];
  categories: Category[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadHomeData();
  }


  private loadHomeData() {
 

    // Load featured blogs, latest blogs, and categories in parallel
    Promise.all([
      this.apiService.getFeaturedBlogs().toPromise(),
      this.apiService.getLatestBlogs(8).toPromise(),
      this.apiService.getCategories().toPromise()
    ]).then(([featuredResponse, latestResponse, categoriesResponse]) => {
      if (featuredResponse?.success) {
        this.featuredBlogs = featuredResponse.data.data;
      }
      
      if (latestResponse?.success) {
        this.latestBlogs = latestResponse.data.data;
      }
      
      if (categoriesResponse?.success) {
        this.categories = categoriesResponse.data.slice(0, 8); // Limit to 8 categories
      }
      
      this.isLoading = false;
    }).catch(error => {
      console.error('Error loading home data:', error);
      this.error = 'Failed to load content. Please try again later.';
      this.isLoading = false;
    });
  }

  navigateToBlogs() {
    this.router.navigate(['/blogs']);
  }

  navigateToCategory(categoryId: number) {
    this.router.navigate(['/blogs/category', categoryId]);
  }

  navigateToBlog(blogId: number) {
    this.router.navigate(['/blogs', blogId]);
  }

  retryLoad() {
    this.loadHomeData();
  }

  getHeroImageUrl(): string {
    return 'https://picsum.photos/1200/600?random=' + Math.floor(Math.random() * 1000);
  }

  getCategoryImageUrl(image: string): string {
    if (!image) {
      return 'https://picsum.photos/300/200?random=' + Math.floor(Math.random() * 1000);
    }
    if (image.startsWith('http')) {
      return image;
    }
    if (image.startsWith('/storage')) {
      return `http://localhost:8000${image}`;
    }
    return `http://localhost:8000/storage/images/category/${image}`;
  }

  onImageError(event: any) {
    event.target.src = 'https://picsum.photos/300/200?random=' + Math.floor(Math.random() * 1000);
  }
}
