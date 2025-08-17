import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil, forkJoin } from 'rxjs';

import { ApiService, Category, Subcategory, Blog } from '../../../services/api.service';
import { SharedModule } from '../../shared/shared.module';

interface DashboardStats {
  totalBlogs: number;
  publishedBlogs: number;
  draftBlogs: number;
  featuredBlogs: number;
  totalCategories: number;
  totalSubcategories: number;
  totalViews: number;
}

interface CategoryStats {
  category: Category;
  blogCount: number;
  subcategoryCount: number;
  totalViews: number;
}

interface SubcategoryStats {
  subcategory: Subcategory;
  blogCount: number;
  totalViews: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ SharedModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  // Dashboard data
  dashboardStats: DashboardStats = {
    totalBlogs: 0,
    publishedBlogs: 0,
    draftBlogs: 0,
    featuredBlogs: 0,
    totalCategories: 0,
    totalSubcategories: 0,
    totalViews: 0
  };

  // Category statistics
  categoryStats: CategoryStats[] = [];
  
  // Subcategory statistics
  subcategoryStats: SubcategoryStats[] = [];
  
  // Recent blogs
  recentBlogs: Blog[] = [];
  
  // Loading states
  isLoading = true;
  isLoadingCategories = false;
  isLoadingSubcategories = false;
  isLoadingBlogs = false;

  // Table columns
  readonly categoryColumns = ['name', 'blogCount', 'subcategoryCount', 'totalViews', 'status'];
  readonly subcategoryColumns = ['name', 'category', 'blogCount', 'totalViews', 'status'];
  readonly recentBlogColumns = ['title', 'category', 'status', 'views', 'createdAt'];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load all dashboard data using forkJoin for parallel requests
   */
  private loadDashboardData(): void {
    this.isLoading = true;

    forkJoin({
      categories: this.apiService.getCategories(),
      subcategories: this.apiService.getSubcategories(),
      blogs: this.apiService.getBlogs({ per_page: 1000 }) // Get all blogs for counting
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        this.processDashboardData(response);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Process and calculate dashboard statistics
   */
  private processDashboardData(data: any): void {
    const categories = data.categories.data || [];
    const subcategories = data.subcategories.data || [];
    const blogs = data.blogs.data.data || [];

    // Calculate blog statistics
    this.calculateBlogStats(blogs);
    
    // Calculate category statistics
    this.calculateCategoryStats(categories, subcategories, blogs);
    
    // Calculate subcategory statistics
    this.calculateSubcategoryStats(subcategories, blogs);
    
    // Get recent blogs
    this.recentBlogs = blogs
      .sort((a: Blog, b: Blog) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }

  /**
   * Calculate blog-related statistics
   */
  private calculateBlogStats(blogs: Blog[]): void {
    this.dashboardStats.totalBlogs = blogs.length;
    this.dashboardStats.publishedBlogs = blogs.filter(blog => blog.is_published).length;
    this.dashboardStats.draftBlogs = blogs.filter(blog => !blog.is_published).length;
    this.dashboardStats.featuredBlogs = blogs.filter(blog => blog.is_featured).length;
    this.dashboardStats.totalViews = blogs.reduce((sum, blog) => sum + (blog.views || 0), 0);
  }

  /**
   * Calculate category statistics
   */
  private calculateCategoryStats(categories: Category[], subcategories: Subcategory[], blogs: Blog[]): void {
    this.dashboardStats.totalCategories = categories.length;
    this.dashboardStats.totalSubcategories = subcategories.length;

    this.categoryStats = categories.map(category => {
      const categoryBlogs = blogs.filter(blog => blog.category_id === category.id);
      const categorySubcategories = subcategories.filter(sub => sub.category_id === category.id);
      
      return {
        category,
        blogCount: categoryBlogs.length,
        subcategoryCount: categorySubcategories.length,
        totalViews: categoryBlogs.reduce((sum, blog) => sum + (blog.views || 0), 0)
      };
    }).sort((a, b) => b.blogCount - a.blogCount);
  }

  /**
   * Calculate subcategory statistics
   */
  private calculateSubcategoryStats(subcategories: Subcategory[], blogs: Blog[]): void {
    this.subcategoryStats = subcategories.map(subcategory => {
      const subcategoryBlogs = blogs.filter(blog => blog.subcategory_id === subcategory.id);
      
      return {
        subcategory,
        blogCount: subcategoryBlogs.length,
        totalViews: subcategoryBlogs.reduce((sum, blog) => sum + (blog.views || 0), 0)
      };
    }).sort((a, b) => b.blogCount - a.blogCount);
  }

  /**
   * Get category name by ID
   */
  getCategoryName(categoryId: number): string {
    const category = this.categoryStats.find(cat => cat.category.id === categoryId);
    return category ? category.category.name : 'Unknown';
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Get status color for blog
   */
  getBlogStatusColor(isPublished: boolean): string {
    return isPublished ? 'accent' : 'warn';
  }

  /**
   * Get status text for blog
   */
  getBlogStatusText(isPublished: boolean): string {
    return isPublished ? 'Published' : 'Draft';
  }

  /**
   * Refresh dashboard data
   */
  refreshDashboard(): void {
    this.loadDashboardData();
  }
}
