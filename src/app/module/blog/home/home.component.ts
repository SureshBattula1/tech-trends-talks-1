import { Component, inject, ViewChild, AfterViewInit, ChangeDetectorRef, signal, computed, effect, DestroyRef } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { Router, RouterModule } from '@angular/router';
import { BlogCardComponent } from '../blog-card/blog-card.component';
import { ApiService, Blog, Category, Subcategory, BlogFilters } from '../../../services/api.service';
import { NgOptimizedImage } from '@angular/common';
import { EnvironmentService } from '../../../services/environment.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { PaginationService, PaginationState } from '../../../services/pagination.service';
import { Observable, combineLatest, of, EMPTY, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, tap, startWith, distinctUntilChanged, shareReplay, filter, map } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SharedModule, RouterModule, BlogCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Signals for reactive state management
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);
  private readonly paginationService = inject(PaginationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly environmentService = inject(EnvironmentService);

  // Data signals
  readonly featuredBlogs = signal<Blog[]>([]);
  readonly latestBlogs = signal<Blog[]>([]);
  readonly filteredBlogs = signal<Blog[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly subcategories = signal<Subcategory[]>([]);
  
  // Filter signals
  readonly selectedCategoryId = signal<number | null>(null);
  readonly selectedSubcategoryId = signal<number | null>(null);
  
  // Loading signals
  readonly isLoading = signal(true);
  readonly isLoadingBlogs = signal(false);
  readonly error = signal<string | null>(null);
  
  // Pagination signals
  readonly totalBlogs = signal(0);
  readonly pageSize = signal(25);
  readonly pageSizeOptions = signal([5, 10, 25, 50]);
  readonly currentPageIndex = signal(0);
  
  // UI state signals
  readonly canScrollCategoriesLeft = signal(false);
  readonly canScrollCategoriesRight = signal(false);
  readonly canScrollLeft = signal(false);
  readonly canScrollRight = signal(false);
  
  // Computed signals for derived state
  readonly hasFilters = computed(() => 
    this.selectedCategoryId() !== null || this.selectedSubcategoryId() !== null
  );
  
  readonly shouldShowPagination = computed(() => {
    const hasBlogs = this.filteredBlogs().length > 0;
    const notLoading = !this.isLoadingBlogs();
    const hasMultiplePages = this.totalBlogs() > this.pageSize();
    const result = hasBlogs && notLoading && hasMultiplePages;
    
    // Debug logging
    console.log('Pagination visibility check:', {
      hasBlogs,
      notLoading,
      hasMultiplePages,
      totalBlogs: this.totalBlogs(),
      pageSize: this.pageSize(),
      filteredBlogsLength: this.filteredBlogs().length,
      result
    });
    
    // Temporarily force pagination to show for testing
    return hasBlogs && notLoading;
  });
  
  readonly sectionTitle = computed(() => 
    this.selectedCategoryId() ? 'Filtered Blogs' : 'Latest Blogs'
  );

  // Reactive streams for data loading
  private readonly filterTrigger$ = new BehaviorSubject<{categoryId: number | null, subcategoryId: number | null}>({
    categoryId: null,
    subcategoryId: null
  });

  private readonly paginationTrigger$ = new BehaviorSubject<{pageIndex: number, pageSize: number}>({
    pageIndex: 0,
    pageSize: 25
  });

  // Touch/swipe support for mobile
  private touchStartX = 0;
  private touchEndX = 0;
  private categoryTouchStartX = 0;
  private categoryTouchEndX = 0;

  constructor() {
    this.setupReactiveDataStreams();
    this.setupEffects();
  }

  ngOnInit() {
    // Initial data loading is handled by reactive streams
  }

  ngAfterViewInit() {
    // Initialize pagination service after view is ready
    setTimeout(() => {
      this.paginationService.updatePaginationState({
        pageIndex: this.currentPageIndex(),
        pageSize: this.pageSize(),
        length: this.totalBlogs()
      });
    });
  }

  private setupReactiveDataStreams(): void {
    // Initial data loading with combineLatest for parallel requests
    combineLatest([
      this.apiService.getFeaturedBlogs(),
      this.apiService.getLatestBlogs(8),
      this.apiService.getCategories()
    ]).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(error => {
        console.error('Error loading home data:', error);
        this.error.set('Failed to load content. Please try again later.');
        this.isLoading.set(false);
        return EMPTY;
      })
    ).subscribe(([featuredResponse, latestResponse, categoriesResponse]: any[]) => {
      // Update featured blogs
      if (featuredResponse?.success) {
        this.featuredBlogs.set(featuredResponse.data.data);
      }
      
      // Update latest blogs and initialize filtered blogs
      if (latestResponse?.success) {
        console.log('Latest blogs response:', latestResponse.data);
        this.latestBlogs.set(latestResponse.data.data);
        this.filteredBlogs.set([...latestResponse.data.data]);
        this.totalBlogs.set(latestResponse.data.total || latestResponse.data.data.length);
        
        console.log('Set total blogs to:', this.totalBlogs());
        console.log('Page size:', this.pageSize());
        console.log('Should show pagination:', this.shouldShowPagination());
        
        // Trigger initial pagination state update
        this.paginationTrigger$.next({
          pageIndex: 0,
          pageSize: this.pageSize()
        });
      }
      
      // Update categories
      if (categoriesResponse?.success) {
        this.categories.set(categoriesResponse.data);
        // Initialize category scroll buttons after categories are loaded
        setTimeout(() => this.updateCategoryScrollButtons(), 200);
      }
      
      this.isLoading.set(false);
    });

    // Reactive filtered blogs loading
    combineLatest([
      this.filterTrigger$.pipe(distinctUntilChanged()),
      this.paginationTrigger$.pipe(distinctUntilChanged())
    ]).pipe(
      takeUntilDestroyed(this.destroyRef),
      tap(() => this.isLoadingBlogs.set(true)),
      switchMap(([filter, pagination]: any[]) => {
        const filters: BlogFilters = {
          per_page: pagination.pageSize,
          page: pagination.pageIndex + 1
        };
        
        if (filter.categoryId) {
          filters.category_id = filter.categoryId;
        }
        
        if (filter.subcategoryId) {
          filters.subcategory_id = filter.subcategoryId;
        }
        
        return this.apiService.getBlogs(filters).pipe(
          catchError(error => {
            console.error('Error loading filtered blogs:', error);
            this.filteredBlogs.set([]);
            this.totalBlogs.set(0);
            this.isLoadingBlogs.set(false);
            return EMPTY;
          })
        );
      }),
      tap(() => this.isLoadingBlogs.set(false))
    ).subscribe(response => {
      if (response?.success) {
        console.log('Filtered blogs response:', response.data);
        this.filteredBlogs.set(response.data.data);
        
        // Handle total count - if API doesn't provide total for filtered results, estimate it
        if (response.data.total !== undefined) {
          this.totalBlogs.set(response.data.total);
          console.log('Set total blogs from API to:', response.data.total);
        } else {
          // If no total provided and we got a full page of results, assume there might be more
          const estimatedTotal = response.data.data.length === this.pageSize() ? 
            response.data.data.length + 1 : response.data.data.length;
          this.totalBlogs.set(estimatedTotal);
          console.log('Estimated total blogs to:', estimatedTotal);
        }
        
        // Update pagination service
        this.paginationService.updatePaginationState({
          pageIndex: this.currentPageIndex(),
          pageSize: this.pageSize(),
          length: this.totalBlogs()
        });

        // Trigger change detection and reset paginator if needed
        setTimeout(() => {
          if (this.paginator && this.paginator.pageIndex !== this.currentPageIndex()) {
            this.paginator.pageIndex = this.currentPageIndex();
          }
          this.cdr.detectChanges();
        });
      }
    });

    // Subcategories loading when category changes - handled by effect instead
  }

  private setupEffects(): void {
    // Effect to update scroll buttons when categories change
    effect(() => {
      const categories = this.categories();
      if (categories.length > 0) {
        setTimeout(() => this.updateCategoryScrollButtons(), 200);
      }
    });

    // Effect to load subcategories when category changes
    effect(() => {
      const categoryId = this.selectedCategoryId();
      if (categoryId) {
        this.apiService.getCategorySubcategories(categoryId).pipe(
          takeUntilDestroyed(this.destroyRef),
          catchError(error => {
            console.error('Error loading subcategories:', error);
            this.subcategories.set([]);
            return EMPTY;
          })
        ).subscribe((response: any) => {
          if (response?.success) {
            this.subcategories.set(response.data);
            // Initialize scroll buttons after subcategories are loaded
            setTimeout(() => this.updateScrollButtons(), 200);
          }
        });
      } else {
        this.subcategories.set([]);
      }
    });

    // Effect to update pagination state when relevant signals change
    effect(() => {
      this.paginationService.updatePaginationState({
        pageIndex: this.currentPageIndex(),
        pageSize: this.pageSize(),
        length: this.totalBlogs()
      });
    });
  }

  navigateToBlogs(): void {
    this.router.navigate(['/blogs']);
  }

  navigateToCategory(categoryId: number): void {
    this.router.navigate(['/blogs/category', categoryId]);
  }

  navigateToBlog(blogId: number): void {
    this.router.navigate(['/blogs', blogId]);
  }

  retryLoad(): void {
    this.error.set(null);
    this.isLoading.set(true);
    // Retrigger data loading by recreating the streams
    this.setupReactiveDataStreams();
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
      return `${this.environmentService.apiBaseUrl}${image}`;
    }
    return `${this.environmentService.apiBaseUrl}/storage/images/category/${image}`;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://picsum.photos/300/200?random=' + Math.floor(Math.random() * 1000);
  }

  // Pagination methods
  onPageChange(event: PageEvent): void {
    this.currentPageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.paginationTrigger$.next({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize
    });
  }

  // Category selection methods
  onCategorySelect(categoryId: number | null): void {
    this.selectedCategoryId.set(categoryId);
    this.selectedSubcategoryId.set(null); // Reset subcategory selection
    this.resetPagination(); // Reset pagination when filters change
    
    // Trigger filter change
    this.filterTrigger$.next({
      categoryId,
      subcategoryId: null
    });
  }

  onSubcategorySelect(subcategoryId: number | null): void {
    this.selectedSubcategoryId.set(subcategoryId);
    this.resetPagination(); // Reset pagination when filters change
    
    // Trigger filter change
    this.filterTrigger$.next({
      categoryId: this.selectedCategoryId(),
      subcategoryId
    });
  }

  private resetPagination(): void {
    this.currentPageIndex.set(0);
    this.paginationTrigger$.next({
      pageIndex: 0,
      pageSize: this.pageSize()
    });
  }


  // Category tabs scroll methods
  scrollCategories(direction: 'left' | 'right'): void {
    const container = document.querySelector('.categories-tabs');
    if (container) {
      const scrollAmount = 200;
      const scrollLeft = direction === 'left' ? -scrollAmount : scrollAmount;
      container.scrollBy({ left: scrollLeft, behavior: 'smooth' });
      
      setTimeout(() => this.updateCategoryScrollButtons(), 300);
    }
  }

  private updateCategoryScrollButtons(): void {
    setTimeout(() => {
      const container = document.querySelector('.categories-tabs');
      if (container) {
        this.canScrollCategoriesLeft.set(container.scrollLeft > 0);
        this.canScrollCategoriesRight.set(container.scrollLeft < (container.scrollWidth - container.clientWidth));
      }
    }, 100);
  }

  onCategoriesScroll(): void {
    this.updateCategoryScrollButtons();
  }

  // Category touch handlers for mobile swipe navigation
  onCategoryTouchStart(event: TouchEvent): void {
    this.categoryTouchStartX = event.changedTouches[0].screenX;
  }

  onCategoryTouchEnd(event: TouchEvent): void {
    this.categoryTouchEndX = event.changedTouches[0].screenX;
    this.handleCategorySwipeGesture();
  }

  private handleCategorySwipeGesture(): void {
    const swipeThreshold = 50;
    const swipeDistance = this.categoryTouchStartX - this.categoryTouchEndX;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0 && this.canScrollCategoriesRight()) {
        // Swipe left - scroll right
        this.scrollCategories('right');
      } else if (swipeDistance < 0 && this.canScrollCategoriesLeft()) {
        // Swipe right - scroll left
        this.scrollCategories('left');
      }
    }
  }

  // Category keyboard navigation support
  onCategoryKeyDown(event: KeyboardEvent, direction: 'left' | 'right'): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.scrollCategories(direction);
    }
  }

  // Subcategory chips scroll methods
  scrollSubcategories(direction: 'left' | 'right'): void {
    const container = document.querySelector('.subcategories-scroll-container');
    if (container) {
      const scrollAmount = 200;
      const scrollLeft = direction === 'left' ? -scrollAmount : scrollAmount;
      container.scrollBy({ left: scrollLeft, behavior: 'smooth' });
      
      setTimeout(() => this.updateScrollButtons(), 300);
    }
  }

  private updateScrollButtons(): void {
    setTimeout(() => {
      const container = document.querySelector('.subcategories-scroll-container');
      if (container) {
        this.canScrollLeft.set(container.scrollLeft > 0);
        this.canScrollRight.set(container.scrollLeft < (container.scrollWidth - container.clientWidth));
      }
    }, 100);
  }

  onSubcategoriesScroll(): void {
    this.updateScrollButtons();
  }

  // Touch handlers for mobile swipe navigation
  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipeGesture();
  }

  private handleSwipeGesture(): void {
    const swipeThreshold = 50;
    const swipeDistance = this.touchStartX - this.touchEndX;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0 && this.canScrollRight()) {
        // Swipe left - scroll right
        this.scrollSubcategories('right');
      } else if (swipeDistance < 0 && this.canScrollLeft()) {
        // Swipe right - scroll left
        this.scrollSubcategories('left');
      }
    }
  }

  // Keyboard navigation support
  onKeyDown(event: KeyboardEvent, direction: 'left' | 'right'): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.scrollSubcategories(direction);
    }
  }
}
