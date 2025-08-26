import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Subject, takeUntil, debounceTime } from 'rxjs';

import { ApiService, Category } from '../../../services/api.service';
import { PaginationService, PaginationState } from '../../../services/pagination.service';
import { SearchFilterConfig, SearchFilterField, AdvancedSearchFilterComponent } from '../../shared/components/advanced-search-filter/advanced-search-filter.component';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [ SharedModule, AdvancedSearchFilterComponent],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private destroy$ = new Subject<void>();

  // Data
  categories: Category[] = [];
  dataSource = new MatTableDataSource<Category>();
  
  // Loading states
  isLoading = false;
  isCreating = false;
  isUpdating = false;
  isDeleting = false;

  // Forms
  categoryForm!: FormGroup;
  editForm!: FormGroup;
  
  // Dialog states
  showCreateDialog = false;
  showEditDialog = false;
  showDeleteDialog = false;
  selectedCategory: Category | null = null;

  // Search and filters
  searchFilters: any = {};
  
  // Search filter configuration
  searchFilterConfig: SearchFilterConfig = {
    fields: [
      { key: 'search', label: 'Search', type: 'text', placeholder: 'Search categories...' },
      { key: 'status', label: 'Status', type: 'select', options: [
        { value: true, label: 'Active' },
        { value: false, label: 'Inactive' }
      ]},
      { key: 'created_after', label: 'Created After', type: 'date' },
      { key: 'created_before', label: 'Created Before', type: 'date' }
    ],
    showAdvanced: true,
    debounceTime: 500
  };

  // Table columns
  displayedColumns = ['name', 'slug', 'description', 'blogCount', 'status', 'createdAt', 'actions'];

  constructor(
    private apiService: ApiService,
    private paginationService: PaginationService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadCategories();
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
   * Initialize forms
   */
  private initializeForms(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      is_active: [true]
    });

    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      is_active: [true]
    });
  }

  /**
   * Setup pagination
   */
  private setupPagination(): void {
    // Don't subscribe to pagination state changes to avoid infinite loops
    // Categories will be loaded when filters change or pagination is manually triggered
  }

  /**
   * Load categories with filters and pagination
   */
  loadCategories(): void {
    // Prevent multiple simultaneous calls
    if (this.isLoading) {
      return;
    }
    
    this.isLoading = true;
    
    const pagination = this.paginationService.getPaginationConfig();
    const filters = { ...this.searchFilters, ...pagination };

    this.apiService.getCategories().subscribe({
      next: (response) => {
        if (response.success) {
          this.categories = response.data;
          this.dataSource.data =  this.categories;
          this.paginationService.updatePaginationState({ length: this.categories.length });
          // console.log('Categories loaded successfully:', this.categories.length);
        } else {
          console.error('Categories API returned success: false:', response.message);
          this.showError(response.message || 'Failed to load categories');
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.showError(`Failed to load categories: ${error.message || error.statusText || 'Unknown error'}`);
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
    this.loadCategories();
  }

  /**
   * Handle filter changes
   */
  onFilterChange(filters: any): void {
    this.searchFilters = filters;
    this.paginationService.resetToFirstPage();
    this.loadCategories();
  }

  /**
   * Handle pagination changes
   */
  onPageChange(event: any): void {
    this.paginationService.onPageChange(event);
  }

  /**
   * Open create category dialog
   */
  openCreateDialog(): void {
    this.showCreateDialog = true;
    this.categoryForm.reset({ is_active: true });
  }

  /**
   * Close create category dialog
   */
  closeCreateDialog(): void {
    this.showCreateDialog = false;
    this.categoryForm.reset();
  }

  /**
   * Create new category
   */
  createCategory(): void {
    if (this.categoryForm.valid) {
      this.isCreating = true;
      
      const categoryData = {
        ...this.categoryForm.value,
        slug: this.generateSlug(this.categoryForm.value.name)
      };

      this.apiService.createCategory(categoryData).subscribe({
        next: (response) => {
          if (response.success) {
            this.showSuccess('Category created successfully');
            this.closeCreateDialog();
            this.loadCategories();
          } else {
            this.showError(response.message || 'Failed to create category');
          }
          this.isCreating = false;
        },
        error: (error) => {
          console.error('Error creating category:', error);
          this.showError('Failed to create category');
          this.isCreating = false;
        }
      });
    }
  }

  /**
   * Open edit category dialog
   */
  openEditDialog(category: Category): void {
    this.selectedCategory = category;
    this.editForm.patchValue({
      name: category.name,
      description: category.description,
      is_active: category.is_active
    });
    this.showEditDialog = true;
  }

  /**
   * Close edit category dialog
   */
  closeEditDialog(): void {
    this.showEditDialog = false;
    this.selectedCategory = null;
    this.editForm.reset();
  }

  /**
   * Update category
   */
  updateCategory(): void {
    if (this.editForm.valid && this.selectedCategory) {
      this.isUpdating = true;
      
      const updateData = {
        ...this.editForm.value,
        slug: this.generateSlug(this.editForm.value.name)
      };

      this.apiService.updateCategory(this.selectedCategory.id, updateData).subscribe({
        next: (response) => {
          if (response.success) {
            this.showSuccess('Category updated successfully');
            this.closeEditDialog();
            this.loadCategories();
          } else {
            this.showError(response.message || 'Failed to update category');
          }
          this.isUpdating = false;
        },
        error: (error) => {
          console.error('Error updating category:', error);
          this.showError('Failed to update category');
          this.isUpdating = false;
        }
      });
    }
  }

  /**
   * Open delete confirmation dialog
   */
  openDeleteDialog(category: Category): void {
    this.selectedCategory = category;
    this.showDeleteDialog = true;
  }

  /**
   * Close delete confirmation dialog
   */
  closeDeleteDialog(): void {
    this.showDeleteDialog = false;
    this.selectedCategory = null;
  }

  /**
   * Delete category
   */
  deleteCategory(): void {
    if (this.selectedCategory) {
      this.isDeleting = true;
      
      this.apiService.deleteCategory(this.selectedCategory.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.showSuccess('Category deleted successfully');
            this.closeDeleteDialog();
            this.loadCategories();
          } else {
            this.showError(response.message || 'Failed to delete category');
          }
          this.isDeleting = false;
        },
        error: (error) => {
          console.error('Error deleting category:', error);
          this.showError('Failed to delete category');
          this.isDeleting = false;
        }
      });
    }
  }

  /**
   * Generate slug from name
   */
  private generateSlug(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
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
   * Get blog count for category
   */
  getBlogCount(category: Category): number {
    return category.blogs?.length || 0;
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
  trackById(index: number, item: Category): number {
    return item.id;
  }

  
}
