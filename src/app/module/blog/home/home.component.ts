import { Component, inject, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { Router, RouterModule } from '@angular/router';
import { BlogCardComponent } from '../blog-card/blog-card.component';
import { ApiService, Blog, Category, Subcategory, BlogFilters } from '../../../services/api.service';
import { NgOptimizedImage } from '@angular/common';
import { EnvironmentService } from '../../../services/environment.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { PaginationService, PaginationState } from '../../../services/pagination.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SharedModule, RouterModule,   BlogCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  featuredBlogs: Blog[] = [];
  latestBlogs: Blog[] = [];
  filteredBlogs: Blog[] = [];
  categories: Category[] = [];
  subcategories: Subcategory[] = [];
  selectedCategoryId: number | null = null;
  selectedSubcategoryId: number | null = null;
  isLoading = true;
  isLoadingBlogs = false;
  error: string | null = null;

  // Pagination properties
  totalBlogs = 0;
  pageSize = 25;
  pageSizeOptions = [5, 10, 25, 50]
  currentPageIndex = 0;
  
  // Category tabs scroll state
  canScrollCategoriesLeft = false;
  canScrollCategoriesRight = false;
  
  // Subcategory chips scroll state
  canScrollLeft = false;
  canScrollRight = false;
  
  // Touch/swipe support for mobile
  private touchStartX = 0;
  private touchEndX = 0;
  private categoryTouchStartX = 0;
  private categoryTouchEndX = 0;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private paginationService: PaginationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadHomeData();
  }

  ngAfterViewInit() {
    // Initialize pagination service after view is ready
    setTimeout(() => {
      this.paginationService.updatePaginationState({
        pageIndex: this.currentPageIndex,
        pageSize: this.pageSize,
        length: this.totalBlogs
      });
    });
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
        this.filteredBlogs = [...this.latestBlogs]; // Initialize filtered blogs
        this.totalBlogs = latestResponse.data.total || this.latestBlogs.length; // Initialize total count
      }
      
      if (categoriesResponse?.success) {
        this.categories = categoriesResponse.data;
        // Initialize category scroll buttons after categories are loaded
        setTimeout(() => this.updateCategoryScrollButtons(), 200);
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

  private environmentService = inject(EnvironmentService);

  getCategoryImageUrl(image: string): string {
    if (!image) {
      return 'https://picsum.photos/300/200?random=' + Math.floor(Math.random() * 1000);
    }
    if (image.startsWith('http')) {
      return image;
    }
    if (image.startsWith('/storage')) {
      return `${this.environmentService.apiBaseUrl}${image}`;
    }
    return `${this.environmentService.apiBaseUrl}/storage/images/category/${image}`;
  }

  onImageError(event: any) {
    event.target.src = 'https://picsum.photos/300/200?random=' + Math.floor(Math.random() * 1000);
  }

  // Pagination methods
  onPageChange(event: PageEvent) {
    this.currentPageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadFilteredBlogs();
  }

  shouldShowPagination(): boolean {
    const hasBlogs = this.filteredBlogs.length > 0;
    const notLoading = !this.isLoadingBlogs;
    const hasFilters = !!(this.selectedCategoryId || this.selectedSubcategoryId);
    const hasMultiplePages = this.totalBlogs > this.pageSize;
    
    return hasBlogs && notLoading && (hasFilters || hasMultiplePages);
  }

  // Category selection methods
  onCategorySelect(categoryId: number | null) {
    this.selectedCategoryId = categoryId;
    this.selectedSubcategoryId = null; // Reset subcategory selection
    this.resetPagination(); // Reset pagination when filters change
    
    if (categoryId) {
      this.loadSubcategories(categoryId);
      this.loadFilteredBlogs();
    } else {
      this.subcategories = [];
      // For "All" category, load all blogs with pagination
      this.loadFilteredBlogs();
    }
  }

  onSubcategorySelect(subcategoryId: number | null) {
    console.log('Subcategory selected:', subcategoryId);
    console.log('Current page before reset:', this.currentPageIndex);
    this.selectedSubcategoryId = subcategoryId;
    this.resetPagination(); // Reset pagination when filters change
    console.log('Current page after reset:', this.currentPageIndex);
    // Add a small delay to ensure the pagination reset is processed
    setTimeout(() => {
      this.loadFilteredBlogs();
    }, 10);
  }

  private resetPagination() {
    this.currentPageIndex = 0;
    // Use setTimeout to ensure the change is detected properly
    setTimeout(() => {
      this.cdr.detectChanges();
    });
  }

  private loadSubcategories(categoryId: number) {
    this.apiService.getCategorySubcategories(categoryId).subscribe({
      next: (response) => {
        if (response.success) {
          this.subcategories = response.data;
          // Initialize scroll buttons after subcategories are loaded
          setTimeout(() => this.updateScrollButtons(), 200);
        }
      },
      error: (error) => {
        console.error('Error loading subcategories:', error);
        this.subcategories = [];
      }
    });
  }

  private loadFilteredBlogs() {
    this.isLoadingBlogs = true;
    
    const filters: BlogFilters = {
      per_page: this.pageSize,
      page: this.currentPageIndex + 1
    };
    
    if (this.selectedCategoryId) {
      filters.category_id = this.selectedCategoryId;
    }
    
    if (this.selectedSubcategoryId) {
      filters.subcategory_id = this.selectedSubcategoryId;
    }
    
    console.log('Loading blogs with filters:', filters);
    console.log('Selected category ID:', this.selectedCategoryId);
    console.log('Selected subcategory ID:', this.selectedSubcategoryId);
    
    this.apiService.getBlogs(filters).subscribe({
      next: (response) => {
        if (response.success) {
          this.filteredBlogs = response.data.data;
          // Handle total count - if API doesn't provide total for filtered results, estimate it
          if (response.data.total !== undefined) {
            this.totalBlogs = response.data.total;
          } else {
            // If no total provided and we got a full page of results, assume there might be more
            this.totalBlogs = response.data.data.length === this.pageSize ? 
              response.data.data.length + 1 : response.data.data.length;
          }
          
          console.log('API Response data:', response.data);
          console.log('Total blogs from API:', response.data.total);
          console.log('Blogs count:', response.data.data.length);
          console.log('Final totalBlogs:', this.totalBlogs);
          console.log('Page size:', this.pageSize);
          console.log('Should show pagination:', this.totalBlogs > this.pageSize);
          console.log('Pagination visibility conditions:');
          console.log('- filteredBlogs.length > 0:', this.filteredBlogs.length > 0);
          console.log('- !isLoadingBlogs:', !this.isLoadingBlogs);
          console.log('- selectedCategoryId:', this.selectedCategoryId);
          console.log('- selectedSubcategoryId:', this.selectedSubcategoryId);
          console.log('- totalBlogs > pageSize:', this.totalBlogs > this.pageSize);
          
          // Update pagination service
          this.paginationService.updatePaginationState({
            pageIndex: this.currentPageIndex,
            pageSize: this.pageSize,
            length: this.totalBlogs
          });

          // Trigger change detection and reset paginator if needed
          setTimeout(() => {
            if (this.paginator && this.paginator.pageIndex !== this.currentPageIndex) {
              this.paginator.pageIndex = this.currentPageIndex;
            }
            this.cdr.detectChanges();
          });
        }
        this.isLoadingBlogs = false;
      },
      error: (error) => {
        console.error('Error loading filtered blogs:', error);
        this.filteredBlogs = [];
        this.totalBlogs = 0;
        this.isLoadingBlogs = false;
      }
    });
  }

  // Category tabs scroll methods
  scrollCategories(direction: 'left' | 'right') {
    const container = document.querySelector('.categories-tabs');
    if (container) {
      const scrollAmount = 200;
      const scrollLeft = direction === 'left' ? -scrollAmount : scrollAmount;
      container.scrollBy({ left: scrollLeft, behavior: 'smooth' });
      
      setTimeout(() => this.updateCategoryScrollButtons(), 300);
    }
  }

  private updateCategoryScrollButtons() {
    setTimeout(() => {
      const container = document.querySelector('.categories-tabs');
      if (container) {
        this.canScrollCategoriesLeft = container.scrollLeft > 0;
        this.canScrollCategoriesRight = container.scrollLeft < (container.scrollWidth - container.clientWidth);
      }
    }, 100);
  }

  onCategoriesScroll() {
    this.updateCategoryScrollButtons();
  }

  // Category touch handlers for mobile swipe navigation
  onCategoryTouchStart(event: TouchEvent) {
    this.categoryTouchStartX = event.changedTouches[0].screenX;
  }

  onCategoryTouchEnd(event: TouchEvent) {
    this.categoryTouchEndX = event.changedTouches[0].screenX;
    this.handleCategorySwipeGesture();
  }

  private handleCategorySwipeGesture() {
    const swipeThreshold = 50;
    const swipeDistance = this.categoryTouchStartX - this.categoryTouchEndX;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0 && this.canScrollCategoriesRight) {
        // Swipe left - scroll right
        this.scrollCategories('right');
      } else if (swipeDistance < 0 && this.canScrollCategoriesLeft) {
        // Swipe right - scroll left
        this.scrollCategories('left');
      }
    }
  }

  // Category keyboard navigation support
  onCategoryKeyDown(event: KeyboardEvent, direction: 'left' | 'right') {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.scrollCategories(direction);
    }
  }

  // Subcategory chips scroll methods
  scrollSubcategories(direction: 'left' | 'right') {
    const container = document.querySelector('.subcategories-scroll-container');
    if (container) {
      const scrollAmount = 200;
      const scrollLeft = direction === 'left' ? -scrollAmount : scrollAmount;
      container.scrollBy({ left: scrollLeft, behavior: 'smooth' });
      
      setTimeout(() => this.updateScrollButtons(), 300);
    }
  }

  private updateScrollButtons() {
    setTimeout(() => {
      const container = document.querySelector('.subcategories-scroll-container');
      if (container) {
        this.canScrollLeft = container.scrollLeft > 0;
        this.canScrollRight = container.scrollLeft < (container.scrollWidth - container.clientWidth);
      }
    }, 100);
  }

  onSubcategoriesScroll() {
    this.updateScrollButtons();
  }

  // Touch handlers for mobile swipe navigation
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent) {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipeGesture();
  }

  private handleSwipeGesture() {
    const swipeThreshold = 50;
    const swipeDistance = this.touchStartX - this.touchEndX;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0 && this.canScrollRight) {
        // Swipe left - scroll right
        this.scrollSubcategories('right');
      } else if (swipeDistance < 0 && this.canScrollLeft) {
        // Swipe right - scroll left
        this.scrollSubcategories('left');
      }
    }
  }

  // Keyboard navigation support
  onKeyDown(event: KeyboardEvent, direction: 'left' | 'right') {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.scrollSubcategories(direction);
    }
  }
}
