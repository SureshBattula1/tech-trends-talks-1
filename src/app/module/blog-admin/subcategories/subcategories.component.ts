import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Subject, takeUntil } from 'rxjs';

import { ApiService, Category, Subcategory } from '../../../services/api.service';
import { PaginationService } from '../../../services/pagination.service';
import { SearchFilterConfig, AdvancedSearchFilterComponent } from '../../shared/components/advanced-search-filter/advanced-search-filter.component';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-subcategories',
  standalone: true,
  imports: [SharedModule, AdvancedSearchFilterComponent],
  templateUrl: './subcategories.component.html',
  styleUrls: ['./subcategories.component.scss']
})
export class SubcategoriesComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private destroy$ = new Subject<void>();

  // Data
  subcategories: Subcategory[] = [];
  categories: Category[] = [];
  dataSource = new MatTableDataSource<Subcategory>();
  
  // Loading states
  isLoading = false;
  isCreating = false;
  isUpdating = false;
  isDeleting = false;

  // Forms
  subcategoryForm!: FormGroup;
  editForm!: FormGroup;
  
  // Dialog states
  showCreateDialog = false;
  showEditDialog = false;
  showDeleteDialog = false;
  selectedSubcategory: Subcategory | null = null;

  // Search and filters
  searchFilters: any = {};
  
  // Search filter configuration
  searchFilterConfig: SearchFilterConfig = {
    fields: [
      { key: 'search', label: 'Search', type: 'text', placeholder: 'Search subcategories...' },
      { key: 'category_id', label: 'Category', type: 'select', options: [] },
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
  displayedColumns = ['name', 'slug', 'category', 'description', 'blogCount', 'status', 'createdAt', 'actions'];

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
    this.loadSubcategories();
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
    this.subcategoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category_id: ['', Validators.required],
      is_active: [true]
    });

    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category_id: ['', Validators.required],
      is_active: [true]
    });
  }

  /**
   * Setup pagination
   */
  private setupPagination(): void {
    // Don't subscribe to pagination state changes to avoid infinite loops
    // Subcategories will be loaded when filters change or pagination is manually triggered
  }

  /**
   * Load categories for filter options
   */
  loadCategories(): void {
    this.apiService.getCategories().subscribe({
      next: (response) => {
        if (response.success) {
          this.categories = response.data;
          // Update search filter options
          this.searchFilterConfig.fields[1].options = this.categories.map(cat => ({
            value: cat.id,
            label: cat.name
          }));
          // console.log('Categories loaded for filters:', this.categories.length);
        } else {
          console.error('Categories API returned success: false:', response.message);
          this.showError(response.message || 'Failed to load categories for filters');
        }
      },
      error: (error) => {
        console.error('Error loading categories for filters:', error);
        this.showError(`Failed to load categories for filters: ${error.message || error.statusText || 'Unknown error'}`);
      }
    });
  }

  /**
   * Load subcategories with filters and pagination
   */
  loadSubcategories(): void {
    // Prevent multiple simultaneous calls
    if (this.isLoading) {
      return;
    }
    
    this.isLoading = true;
    
    const pagination = this.paginationService.getPaginationConfig();
    const filters = { ...this.searchFilters, ...pagination };

    this.apiService.getSubcategories().subscribe({
      next: (response) => {
        if (response.success) {
          this.subcategories = response.data;
          this.dataSource.data = this.subcategories;
          this.paginationService.updatePaginationState({ length: this.subcategories.length });
          // console.log('Subcategories loaded successfully:', this.subcategories.length);
        } else {
          console.error('Subcategories API returned success: false:', response.message);
          this.showError(response.message || 'Failed to load subcategories');
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading subcategories:', error);
        this.showError(`Failed to load subcategories: ${error.message || error.statusText || 'Unknown error'}`);
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
    this.loadSubcategories();
  }

  /**
   * Handle filter changes
   */
  onFilterChange(filters: any): void {
    this.searchFilters = filters;
    this.paginationService.resetToFirstPage();
    this.loadSubcategories();
  }

  /**
   * Handle pagination changes
   */
  onPageChange(event: any): void {
    this.paginationService.onPageChange(event);
  }

  /**
   * Open create subcategory dialog
   */
  openCreateDialog(): void {
    this.showCreateDialog = true;
    this.subcategoryForm.reset({ is_active: true });
  }

  /**
   * Close create subcategory dialog
   */
  closeCreateDialog(): void {
    this.showCreateDialog = false;
    this.subcategoryForm.reset();
  }

  /**
   * Create new subcategory
   */
  createSubcategory(): void {
    if (this.subcategoryForm.valid) {
      this.isCreating = true;
      
      const subcategoryData = {
        ...this.subcategoryForm.value,
        slug: this.generateSlug(this.subcategoryForm.value.name)
      };

      this.apiService.createSubcategory(subcategoryData).subscribe({
        next: (response) => {
          if (response.success) {
            this.showSuccess('Subcategory created successfully');
            this.closeCreateDialog();
            this.loadSubcategories();
          } else {
            this.showError(response.message || 'Failed to create subcategory');
          }
          this.isCreating = false;
        },
        error: (error) => {
          console.error('Error creating subcategory:', error);
          this.showError('Failed to create subcategory');
          this.isCreating = false;
        }
      });
    }
  }

  /**
   * Open edit subcategory dialog
   */
  openEditDialog(subcategory: Subcategory): void {
    this.selectedSubcategory = subcategory;
    this.editForm.patchValue({
      name: subcategory.name,
      description: subcategory.description,
      category_id: subcategory.category_id,
      is_active: subcategory.is_active
    });
    this.showEditDialog = true;
  }

  /**
   * Close edit subcategory dialog
   */
  closeEditDialog(): void {
    this.showEditDialog = false;
    this.selectedSubcategory = null;
    this.editForm.reset();
  }

  /**
   * Update subcategory
   */
  updateSubcategory(): void {
    if (this.editForm.valid && this.selectedSubcategory) {
      this.isUpdating = true;
      
      const updateData = {
        ...this.editForm.value,
        slug: this.generateSlug(this.editForm.value.name)
      };

      this.apiService.updateSubcategory(this.selectedSubcategory.id, updateData).subscribe({
        next: (response) => {
          if (response.success) {
            this.showSuccess('Subcategory updated successfully');
            this.closeEditDialog();
            this.loadSubcategories();
          } else {
            this.showError(response.message || 'Failed to update subcategory');
          }
          this.isUpdating = false;
        },
        error: (error) => {
          console.error('Error updating subcategory:', error);
          this.showError('Failed to update subcategory');
          this.isUpdating = false;
        }
      });
    }
  }

  /**
   * Open delete confirmation dialog
   */
  openDeleteDialog(subcategory: Subcategory): void {
    this.selectedSubcategory = subcategory;
    this.showDeleteDialog = true;
  }

  /**
   * Close delete confirmation dialog
   */
  closeDeleteDialog(): void {
    this.showDeleteDialog = false;
    this.selectedSubcategory = null;
  }

  /**
   * Delete subcategory
   */
  deleteSubcategory(): void {
    if (this.selectedSubcategory) {
      this.isDeleting = true;
      
      this.apiService.deleteSubcategory(this.selectedSubcategory.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.showSuccess('Subcategory deleted successfully');
            this.closeDeleteDialog();
            this.loadSubcategories();
          } else {
            this.showError(response.message || 'Failed to delete subcategory');
          }
          this.isDeleting = false;
        },
        error: (error) => {
          console.error('Error deleting subcategory:', error);
          this.showError('Failed to delete subcategory');
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
   * Get category name by ID
   */
  getCategoryName(categoryId: number): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  }

  /**
   * Get blog count for subcategory
   */
  getBlogCount(subcategory: Subcategory): number {
    return subcategory.blogs?.length || 0;
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
  trackById(index: number, item: Subcategory): number {
    return item.id;
  }


}
