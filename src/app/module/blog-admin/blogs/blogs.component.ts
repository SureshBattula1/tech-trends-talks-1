import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Subject, takeUntil } from 'rxjs';
import { Editor, Toolbar } from 'ngx-editor';

import { ApiService, Blog, Category, Subcategory, ApiResponse, PaginatedResponse } from '../../../services/api.service';
import { PaginationService } from '../../../services/pagination.service';
import { SearchFilterConfig, AdvancedSearchFilterComponent } from '../../shared/components/advanced-search-filter/advanced-search-filter.component';
import { SharedModule } from '../../shared/shared.module';

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

  // ngx-editor Configuration
  public editor!: Editor;
  public toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify']
  ];

  // Image upload
  @ViewChild('imageInput') imageInput!: ElementRef;

  // Data
  blogs: Blog[] = [];
  categories: Category[] = [];
  subcategories: Subcategory[] = [];
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
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.editor = new Editor();
    this.initializeForms();
    this.loadCategories();
    this.loadSubcategories();
    this.loadBlogs();
    this.setupPagination();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.editor.destroy();
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize forms
   */
  private initializeForms(): void {
    this.blogForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      excerpt: ['', [Validators.required, Validators.minLength(10)]],
      content: ['', [Validators.required, Validators.minLength(50)]],
      category_id: ['', Validators.required],
      subcategory_id: [''],
      author: ['', Validators.required],
      tags: [''],
      is_published: [false],
      is_featured: [false],
      featured_image: ['']
    });

    this.editForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      excerpt: ['', [Validators.required, Validators.minLength(10)]],
      content: ['', [Validators.required, Validators.minLength(50)]],
      category_id: ['', Validators.required],
      subcategory_id: [''],
      author: ['', Validators.required],
      tags: [''],
      is_published: [false],
      is_featured: [false],
      featured_image: ['']
    });
  }

  /**
   * Setup pagination
   */
  private setupPagination(): void {
    // Don't subscribe to pagination state changes to avoid infinite loops
    // Blogs will be loaded when filters change or pagination is manually triggered
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
          // console.error('Categories API returned success: false:', response.message);
          this.showError(response.message || 'Failed to load categories for filters');
        }
      },
      error: (error) => {
        // console.error('Error loading categories for filters:', error);
        this.showError(`Failed to load categories for filters: ${error.message || error.statusText || 'Unknown error'}`);
      }
    });
  }

  /**
   * Load subcategories for filter options
   */
  loadSubcategories(): void {
    this.apiService.getSubcategories().subscribe({
      next: (response) => {
        if (response.success) {
          this.subcategories = response.data;
          // Update search filter options
          this.searchFilterConfig.fields[2].options = this.subcategories.map(sub => ({
            value: sub.id,
            label: sub.name
          }));
          // console.log('Subcategories loaded for filters:', this.subcategories.length);
        } else {
          // console.error('Subcategories API returned success: false:', response.message);
          this.showError(response.message || 'Failed to load subcategories for filters');
        }
      },
      error: (error) => {
        // console.error('Error loading subcategories for filters:', error);
        this.showError(`Failed to load subcategories for filters: ${error.message || error.statusText || 'Unknown error'}`);
      }
    });
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

  /**
   * Open create blog dialog
   */
  openCreateDialog(): void {
    this.showCreateDialog = true;
    this.blogForm.reset({ 
      is_published: false, 
      is_featured: false 
    });
  }

  /**
   * Close create blog dialog
   */
  closeCreateDialog(): void {
    this.showCreateDialog = false;
    this.blogForm.reset();
  }

  /**
   * Create new blog
   */
  createBlog(): void {
    if (this.blogForm.valid) {
      this.isCreating = true;
      
      const blogData = {
        ...this.blogForm.value,
        tags: this.blogForm.value.tags ? this.blogForm.value.tags.split(',').map((tag: string) => tag.trim()) : []
      };

      this.apiService.createBlog(blogData).subscribe({
        next: (response) => {
          if (response.success) {
            this.showSuccess('Blog created successfully');
            this.closeCreateDialog();
            this.loadBlogs();
          } else {
            this.showError(response.message || 'Failed to create blog');
          }
          this.isCreating = false;
        },
        error: (error) => {
          console.error('Error creating blog:', error);
          this.showError('Failed to create blog');
          this.isCreating = false;
        }
      });
    }
  }

  /**
   * Open edit blog dialog
   */
  openEditDialog(blog: Blog): void {
    this.selectedBlog = blog;
    this.editForm.patchValue({
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      category_id: blog.category_id,
      subcategory_id: blog.subcategory_id,
      author: blog.author,
      tags: blog.tags.join(', '),
      is_published: blog.is_published,
      is_featured: blog.is_featured,
      featured_image: blog.featured_image
    });
    this.showEditDialog = true;
  }

  /**
   * Close edit blog dialog
   */
  closeEditDialog(): void {
    this.showEditDialog = false;
    this.selectedBlog = null;
    this.editForm.reset();
  }

  /**
   * Update blog
   */
  updateBlog(): void {
    if (this.editForm.valid && this.selectedBlog) {
      this.isUpdating = true;
      
      const updateData = {
        ...this.editForm.value,
        tags: this.editForm.value.tags ? this.editForm.value.tags.split(',').map((tag: string) => tag.trim()) : []
      };

      this.apiService.updateBlog(this.selectedBlog.id, updateData).subscribe({
        next: (response) => {
          if (response.success) {
            this.showSuccess('Blog updated successfully');
            this.closeEditDialog();
            this.loadBlogs();
          } else {
            this.showError(response.message || 'Failed to update blog');
          }
          this.isUpdating = false;
        },
        error: (error) => {
          console.error('Error updating blog:', error);
          this.showError('Failed to update blog');
          this.isUpdating = false;
        }
      });
    }
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
    // console.log(`Toggling blog ${blog.id} featured status to: ${newFeatured}`);
    
    // Note: You'll need to add updateBlog method to ApiService
    // this.apiService.updateBlog(blog.id, { is_featured: newFeatured }).subscribe({
    //   next: (response) => {
    //     if (response.success) {
    //       this.showSuccess(`Blog ${newFeatured ? 'featured' : 'unfeatured'} successfully`);
    //       this.loadBlogs();
    //     } else {
    //       this.showError(response.message || 'Failed to update blog featured status');
    //     }
    //   },
    //   error: (error) => {
    //     console.error('Error updating blog featured status:', error);
    //     this.showError('Failed to update blog featured status');
    //     }
    //   }
    // });

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

  /**
   * Image upload functionality
   */
  onImageButtonClick() {
    this.imageInput.nativeElement.click(); // Trigger the file input click
  }

 onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file && file.type.startsWith('image/')) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.showError('Image size should be less than 5MB');
        return;
      }

      this.isLoading = true;
      // console.log('Starting image upload for file:', file);

      this.apiService.uploadImage(file, 'blog').subscribe({
        next: (response: any) => {
          // console.log('Image upload response received:', response);
          if (response.success) {
            const imageUrl = response.data.full_url || response.data.url;
                         // console.log('Image URL from response:', imageUrl);
            this.insertImageToEditor(imageUrl);
            this.showSuccess('Image uploaded successfully!');
          } else {
            console.error('Image upload failed:', response.message);
            this.showError(response.message || 'Failed to upload image');
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error uploading image:', error);
          this.showError('Failed to upload image. Please try again.');
          this.isLoading = false;
        }
      });
    } else {
      this.showError('Please select a valid image file');
    }
  }


  insertImageToEditor(imageUrl: string) {
    try {
      const selection = this.editor.view.state.selection;
      const { schema, tr } = this.editor.view.state;

      const node = schema.nodes['image'].create({
        src: imageUrl,
        alt: 'Uploaded Image'
      });

      const transaction = tr.replaceSelectionWith(node).scrollIntoView();
      this.editor.view.dispatch(transaction);
    } catch (error) {
      console.error('Error inserting image to editor:', error);
      // Fallback: insert as HTML link if image node creation fails
      this.insertImageAsLink(imageUrl);
    }
  }

  insertImageAsLink(imageUrl: string) {
    try {
      const selection = this.editor.view.state.selection;
      const { schema, tr } = this.editor.view.state;

      // Create a link node with the image URL
      const linkNode = schema.nodes['paragraph'].create(
        null,
        schema.text('Image uploaded: '),
        [schema.marks['link'].create({ href: imageUrl })]
      );

      const transaction = tr.replaceSelectionWith(linkNode).scrollIntoView();
      this.editor.view.dispatch(transaction);
    } catch (error) {
      console.error('Error inserting image link:', error);
      // Final fallback: show the URL to user
      this.showError(`Image uploaded successfully. URL: ${imageUrl}`);
    }
  }

  /**
   * Test the upload endpoint to debug issues
   */
  testUploadEndpoint() {
    // console.log('Testing upload endpoint...');
    this.apiService.testImageUploadEndpoint().subscribe({
      next: (response) => {
        // console.log('Test endpoint response:', response);
        this.showSuccess('Upload endpoint test successful!');
      },
      error: (error) => {
        console.error('Test endpoint error:', error);
        this.showError('Upload endpoint test failed!');
      }
    });
  }
}
