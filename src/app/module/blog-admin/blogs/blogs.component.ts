import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Subject, takeUntil } from 'rxjs';

import { ApiService, Blog, Category, Subcategory, ApiResponse, PaginatedResponse } from '../../../services/api.service';
import { PaginationService } from '../../../services/pagination.service';
import { SearchFilterConfig, AdvancedSearchFilterComponent } from '../../shared/components/advanced-search-filter/advanced-search-filter.component';
import { SharedModule } from '../../shared/shared.module';
import { Router } from '@angular/router';

@Component({
  selector: 'app-blogs',
  standalone: true,
  imports: [SharedModule, AdvancedSearchFilterComponent],
  templateUrl: './blogs.component.html',
  styleUrls: ['./blogs.component.scss']
})
export class BlogsComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private destroy$ = new Subject<void>();

  // Data
  blogs: Blog[] = [];
  categories: Category[] = [];
  subcategories: Subcategory[] = [];
  filteredSubcategories: Subcategory[] = [];
  dataSource = new MatTableDataSource<Blog>();
  
  // Loading states
  isLoading = false;
  isCreating = false;
  isUpdating = false;
  isDeleting = false;

  // Forms
  blogForm!: FormGroup;
  editForm!: FormGroup;
  
  // Dialog states
  showCreateDialog = false;
  showEditDialog = false;
  showDeleteDialog = false;
  selectedBlog: Blog | null = null;

  // Search and filters
  searchFilters: any = {};
  
  // Search filter configuration
  searchFilterConfig: SearchFilterConfig = {
    fields: [
      { key: 'search', label: 'Search', type: 'text', placeholder: 'Search blogs...' },
      { key: 'category_id', label: 'Category', type: 'select', options: [] },
      { key: 'subcategory_id', label: 'Subcategory', type: 'select', options: [] },
      { key: 'status', label: 'Status', type: 'select', options: [
        { value: true, label: 'Published' },
        { value: false, label: 'Draft' }
      ]},
      { key: 'featured', label: 'Featured', type: 'select', options: [
        { value: true, label: 'Featured' },
        { value: false, label: 'Not Featured' }
      ]},
      { key: 'created_after', label: 'Created After', type: 'date' },
      { key: 'created_before', label: 'Created Before', type: 'date' }
    ],
    showAdvanced: true,
    debounceTime: 500
  };

  // Table columns
  displayedColumns = ['title', 'category', 'subcategory', 'author', 'status', 'featured', 'views', 'createdAt', 'actions'];

  constructor(
    private apiService: ApiService,
    private paginationService: PaginationService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBlogs();
    this.setupPagination();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Setup pagination
   */
  private setupPagination(): void {
    // Don't subscribe to pagination state changes to avoid infinite loops
    // Blogs will be loaded when filters change or pagination is manually triggered
  }

 
  /**
   * Load blogs with filters and pagination
   */
  loadBlogs(): void {
    // Prevent multiple simultaneous calls
    if (this.isLoading) {
      return;
    }
    
    this.isLoading = true;
    
    const pagination = this.paginationService.getPaginationConfig();
    const filters = { ...this.searchFilters, ...pagination };

    this.apiService.getMyBlogs(filters).subscribe({
      next: (response: ApiResponse<PaginatedResponse<Blog>>) => {
        if (response.success) {
          this.blogs = response.data.data;
          this.dataSource.data = this.blogs;
          this.paginationService.updatePaginationState({ length: response.data.total });
          // console.log('Blogs loaded successfully:', this.blogs.length);
        } else {
          // console.error('Blogs API returned success: false:', response.message || 'Unknown error');
          this.showError(response.message || 'Failed to load blogs');
        }
        this.isLoading = false;
      },
      error: (error) => {
        // console.error('Error loading blogs:', error);
        this.showError(`Failed to load blogs: ${error.message || error.statusText || 'Unknown error'}`);
        this.isLoading = false;
      }
    });
  }

  /**
   * Handle search filter changes
   */
  onSearchChange(filters: any): void {
    this.searchFilters = filters;
    this.paginationService.resetToFirstPage();
    this.loadBlogs();
  }

  /**
   * Handle filter changes
   */
  onFilterChange(filters: any): void {
    this.searchFilters = filters;
    this.paginationService.resetToFirstPage();
    this.loadBlogs();
  }

  /**
   * Handle pagination changes
   */
  onPageChange(event: any): void {
    this.paginationService.onPageChange(event);
  }

  openEditDialog(blog: Blog): void {
    this.router.navigate(['/blogs-admin/edit-post', blog.id]);
  }

  /**
   * Open delete confirmation dialog
   */
  openDeleteDialog(blog: Blog): void {
    this.selectedBlog = blog;
    this.showDeleteDialog = true;
  }

  /**
   * Close delete confirmation dialog
   */
  closeDeleteDialog(): void {
    this.showDeleteDialog = false;
    this.selectedBlog = null;
  }

  /**
   * Delete blog
   */
  deleteBlog(): void {
    if (this.selectedBlog) {
      this.isDeleting = true;
      
      this.apiService.deleteBlog(this.selectedBlog.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.showSuccess('Blog deleted successfully');
            this.closeDeleteDialog();
            this.loadBlogs();
          } else {
            this.showError(response.message || 'Failed to delete blog');
          }
          this.isDeleting = false;
        },
        error: (error) => {
          console.error('Error deleting blog:', error);
          this.showError('Failed to delete blog');
          this.isDeleting = false;
        }
      });
    }
  }

  /**
   * Toggle blog status (published/unpublished)
   */
  toggleBlogStatus(blog: Blog): void {
    const newStatus = !blog.is_published;
    // console.log(`Toggling blog ${blog.id} status to: ${newStatus}`);
    
    this.apiService.updateBlog(blog.id, { is_published: newStatus }).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSuccess(`Blog ${newStatus ? 'published' : 'unpublished'} successfully`);
          this.loadBlogs();
        } else {
          this.showError(response.message || 'Failed to update blog status');
        }
      },
      error: (error) => {
        console.error('Error updating blog status:', error);
        this.showError('Failed to update blog status');
      }
    });
  }

  /**
   * Toggle blog featured status
   */
  toggleBlogFeatured(blog: Blog): void {
    const newFeatured = !blog.is_featured;

    // Temporary implementation
    setTimeout(() => {
      this.showSuccess(`Blog ${newFeatured ? 'featured' : 'unfeatured'} successfully`);
      this.loadBlogs();
    }, 1000);
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
   * Get category name by ID
   */
  getCategoryName(categoryId: number): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  }

  /**
   * Get subcategory name by ID
   */
  getSubcategoryName(subcategoryId?: number): string {
    if (!subcategoryId) return 'None';
    const subcategory = this.subcategories.find(sub => sub.id === subcategoryId);
    return subcategory ? subcategory.name : 'Unknown';
  }

  /**
   * Show success message
   */
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Track items for ngFor optimization
   */
  trackById(index: number, item: Blog): number {
    return item.id;
  }

  

 
}
