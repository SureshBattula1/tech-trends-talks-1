import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService, Category, Subcategory, CreateBlogRequest, Blog } from '../../../services/api.service';
import { SharedModule } from '../../shared/shared.module';
import { Editor, Toolbar } from 'ngx-editor';
import { EnvironmentService } from '../../../services/environment.service';

@Component({
  selector: 'app-blog-form',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './create-blog.component.html',
  styleUrl: './create-blog.component.scss'
})
export class BlogFormComponent implements OnInit {
  editor!: Editor;
  editorConfig: any;
  @ViewChild('imageInput') imageInput!: ElementRef; 

  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];
 
  blogForm: FormGroup;
  categories: Category[] = [];
  subcategories: Subcategory[] = [];
  filteredSubcategories: Subcategory[] = [];
  isLoading = false;
  selectedImage: File | null = null;
  imagePreview: string | null = null;

  // Edit mode properties
  isEditMode = false;
  blogId: number | null = null;
  existingBlog: Blog | null = null;
  existingFeaturedImage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.blogForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      excerpt: ['', [Validators.required, Validators.minLength(10)]],
      content: ['', [Validators.required, Validators.minLength(50)]],
      category_id: ['', Validators.required],
      subcategory_id: [''],
      author: ['Admin', Validators.required],
      tags: [''],
      is_published: [false],
      is_featured: [false]
    });
  }

  ngOnInit() {
    this.editor = new Editor();
    
    // Check if we're in edit mode by looking for blog ID in route params
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.blogId = +params['id'];
        this.loadBlogForEdit(this.blogId);
      }
    });

    this.loadCategories();
    this.loadSubcategories();
    
    // Watch for category changes to filter subcategories
    this.blogForm.get('category_id')?.valueChanges.subscribe(categoryId => {
      console.log('Category changed to:', categoryId);
      this.filterSubcategories(categoryId);
      console.log('Filtered subcategories:', this.filteredSubcategories);
      
      if (this.isEditMode) {
        // In edit mode, try to preserve the existing subcategory if it belongs to the new category
        const currentSubcategory = this.blogForm.get('subcategory_id')?.value;
        if (currentSubcategory) {
          const subcategoryExists = this.filteredSubcategories.some(
            sub => sub.id === currentSubcategory
          );
          
          if (subcategoryExists) {
            console.log('Preserving existing subcategory:', currentSubcategory);
            // Keep the existing subcategory
          } else {
            console.log('Clearing subcategory as it doesn\'t belong to new category');
            this.blogForm.get('subcategory_id')?.setValue('');
          }
        } else {
          console.log('No current subcategory to preserve');
        }
      } else {
        // In create mode, always clear subcategory when category changes
        this.blogForm.get('subcategory_id')?.setValue('');
      }
    });
  }

  /**
   * Load existing blog data for editing
   */
  loadBlogForEdit(blogId: number) {
    this.isLoading = true;
    this.apiService.getBlog(blogId).subscribe({
      next: (response) => {
        if (response.success) {
          this.existingBlog = response.data;
          // Wait for subcategories to be loaded before populating form
          this.waitForSubcategoriesAndPopulateForm(this.existingBlog);
          this.existingFeaturedImage = this.existingBlog.featured_image || null;
        } else {
          this.showError('Failed to load blog for editing');
          this.router.navigate(['/blogs-admin/blogs']);
        }
      },
      error: (error) => {
        console.error('Error loading blog for edit:', error);
        this.showError('Failed to load blog for editing');
        this.router.navigate(['/blogs-admin/blogs']);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  /**
   * Wait for subcategories to be loaded before populating form
   */
  private waitForSubcategoriesAndPopulateForm(blog: Blog) {
    // If subcategories are already loaded, populate form immediately
    if (this.subcategories.length > 0) {
      this.populateFormWithExistingData(blog);
    } else {
      // Wait for subcategories to be loaded
      const checkSubcategories = () => {
        if (this.subcategories.length > 0) {
          this.populateFormWithExistingData(blog);
        } else {
          // Check again after a short delay
          setTimeout(checkSubcategories, 100);
        }
      };
      checkSubcategories();
    }
  }

  /**
   * Populate form with existing blog data
   */
  populateFormWithExistingData(blog: Blog) {
    console.log('Populating form with blog data:', blog);
    console.log('Available subcategories:', this.subcategories);
    
    // First, filter subcategories for the selected category
    this.filterSubcategories(blog.category_id);
    console.log('Filtered subcategories for category', blog.category_id, ':', this.filteredSubcategories);
    
    // Then populate the form
    this.blogForm.patchValue({
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      category_id: blog.category_id,
      subcategory_id: blog.subcategory_id || '',
      author: blog.author,
      tags: blog.tags ? blog.tags.join(', ') : '',
      is_published: blog.is_published,
      is_featured: blog.is_featured
    });

    // Ensure subcategory is set after form population
    if (blog.subcategory_id) {
      console.log('Setting subcategory to:', blog.subcategory_id);
      
      // Double-check that the subcategory exists in the filtered list
      const subcategoryExists = this.filteredSubcategories.some(
        sub => sub.id === blog.subcategory_id
      );
      
      if (subcategoryExists) {
        this.blogForm.get('subcategory_id')?.setValue(blog.subcategory_id);
        console.log('Subcategory set successfully');
      } else {
        console.warn(`Subcategory with ID ${blog.subcategory_id} not found in filtered list`);
        this.blogForm.get('subcategory_id')?.setValue('');
      }
    } else {
      console.log('No subcategory to set');
    }
  }

  loadCategories() {
    this.apiService.getCategories().subscribe({
      next: (response) => {
        if (response.success) {
          this.categories = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.showError('Failed to load categories');
      }
    });
  }

  loadSubcategories() {
    this.apiService.getSubcategories().subscribe({
      next: (response) => {
        if (response.success) {
          this.subcategories = response.data;
          
          // If we're in edit mode and have existing blog data, populate form now
          if (this.isEditMode && this.existingBlog) {
            this.populateFormWithExistingData(this.existingBlog);
          }
        }
      },
      error: (error) => {
        console.error('Error loading subcategories:', error);
      }
    });
  }

  filterSubcategories(categoryId: number) {
    this.filteredSubcategories = this.subcategories.filter(
      sub => sub.category_id === categoryId
    );
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.showError('Please select a valid image file');
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.showError('Image size should be less than 5MB');
        return;
      }

      this.selectedImage = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        console.log('New image selected and preview created');
        console.log('Current state - existingFeaturedImage:', this.existingFeaturedImage, 'imagePreview:', this.imagePreview);
      };
      reader.readAsDataURL(file);
    }
  }

  clearSelectedImage() {
    this.selectedImage = null;
    this.imagePreview = null;
    
    // Reset the file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    
    console.log('Cleared selected image and preview');
    console.log('Current state - existingFeaturedImage:', this.existingFeaturedImage, 'imagePreview:', this.imagePreview);
  }

  /**
   * Remove existing featured image in edit mode
   */
  removeExistingImage() {
    if (this.isEditMode) {
      this.existingFeaturedImage = null;
      console.log('Removed existing featured image');
      this.showSuccess('Existing featured image removed. You can upload a new one or leave it empty.');
    }
  }

  private uploadImage(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.selectedImage) {
        // In edit mode, return existing image if no new image selected and existing image is not cleared
        if (this.isEditMode && this.existingFeaturedImage) {
          resolve(this.existingFeaturedImage);
        } else {
          resolve('');
        }
        return;
      }

      this.apiService.uploadImage(this.selectedImage, 'blog').subscribe({
        next: (response) => {
          if (response.success) {
            resolve(response.data.url);
          } else {
            reject(new Error(response.message || 'Image upload failed'));
          }
        },
        error: (error) => {
          console.error('Image upload error:', error);
          if (error.status === 413) {
            reject(new Error('Image file is too large. Please select a smaller image.'));
          } else if (error.status === 415) {
            reject(new Error('Invalid image format. Please select a valid image file.'));
          } else {
            reject(new Error('Failed to upload image. Please try again.'));
          }
        }
      });
    });
  }

  async onSubmit() {
    if (this.blogForm.valid) {
      this.isLoading = true;

      try {
        // Upload image first if selected
        const featuredImage = await this.uploadImage();

        const blogData: CreateBlogRequest = {
          title: this.blogForm.value.title,
          excerpt: this.blogForm.value.excerpt,
          content: this.blogForm.value.content,
          category_id: this.blogForm.value.category_id,
          subcategory_id: this.blogForm.value.subcategory_id || undefined,
          author: this.blogForm.value.author,
          tags: this.blogForm.value.tags ? 
            this.blogForm.value.tags.split(',').map((tag: string) => tag.trim()) : [],
          is_published: this.blogForm.value.is_published,
          is_featured: this.blogForm.value.is_featured,
          featured_image: featuredImage || undefined
        };

        if (this.isEditMode && this.blogId) {
          // Update existing blog
          this.apiService.updateBlog(this.blogId, blogData).subscribe({
            next: (response) => {
              if (response.success) {
                this.showSuccess('Blog updated successfully!');
                this.router.navigate(['/blogs-admin/blogs']);
              } else {
                this.showError(response.message || 'Failed to update blog');
              }
            },
            error: (error) => {
              console.error('Error updating blog:', error);
              this.showError('Failed to update blog. Please try again.');
            },
            complete: () => {
              this.isLoading = false;
            }
          });
        } else {
          // Create new blog
          this.apiService.createBlog(blogData).subscribe({
            next: (response) => {
              if (response.success) {
                this.showSuccess('Blog created successfully!');
                this.router.navigate(['/blogs-admin/blogs']);
              } else {
                this.showError(response.message || 'Failed to create blog');
              }
            },
            error: (error) => {
              console.error('Error creating blog:', error);
              this.showError('Failed to create blog. Please try again.');
            },
            complete: () => {
              this.isLoading = false;
            }
          });
        }

      } catch (error) {
        console.error('Error saving blog:', error);
        this.showError('Failed to save blog');
        this.isLoading = false;
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.blogForm.controls).forEach(key => {
      const control = this.blogForm.get(key);
      control?.markAsTouched();
    });
  }

  private hasMinimumRequiredFields(): boolean {
    const title = this.blogForm.get('title')?.value;
    const content = this.blogForm.get('content')?.value;
    const category_id = this.blogForm.get('category_id')?.value;
    
    return title && content && category_id;
  }

  async saveDraft() {
    if (this.hasMinimumRequiredFields()) {
      this.isLoading = true;

      try {
        // Upload image first if selected
        const featuredImage = await this.uploadImage();

        const blogData: CreateBlogRequest = {
          title: this.blogForm.value.title,
          excerpt: this.blogForm.value.excerpt || 'Draft excerpt',
          content: this.blogForm.value.content,
          category_id: this.blogForm.value.category_id,
          subcategory_id: this.blogForm.value.subcategory_id || undefined,
          author: this.blogForm.value.author || 'Admin',
          tags: this.blogForm.value.tags ? 
            this.blogForm.value.tags.split(',').map((tag: string) => tag.trim()) : [],
          is_published: false, // Always false for drafts
          is_featured: false,  // Always false for drafts
          featured_image: featuredImage || undefined
        };

        if (this.isEditMode && this.blogId) {
          // Update existing blog as draft
          this.apiService.updateBlog(this.blogId, blogData).subscribe({
            next: (response) => {
              if (response.success) {
                this.showSuccess('Blog draft updated successfully!');
                this.router.navigate(['/blogs-admin/blogs']);
              } else {
                this.showError(response.message || 'Failed to update draft');
              }
            },
            error: (error) => {
              console.error('Error updating draft:', error);
              this.showError('Failed to update draft. Please try again.');
            },
            complete: () => {
              this.isLoading = false;
            }
          });
        } else {
          // Create new blog as draft
          this.apiService.createBlog(blogData).subscribe({
            next: (response) => {
              if (response.success) {
                this.showSuccess('Blog draft saved successfully!');
                this.router.navigate(['/blogs-admin/blogs']);
              } else {
                this.showError(response.message || 'Failed to save draft');
              }
            },
            error: (error) => {
              console.error('Error saving draft:', error);
              this.showError('Failed to save draft. Please try again.');
            },
            complete: () => {
              this.isLoading = false;
            }
          });
        }

      } catch (error) {
        console.error('Error saving draft:', error);
        this.showError('Failed to save draft');
        this.isLoading = false;
      }
    } else {
      this.showError('Please fill in at least title, content, and category to save a draft');
      this.markFormGroupTouched();
    }
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  onCancel() {
    if (this.blogForm.dirty || this.selectedImage) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        this.router.navigate(['/blogs-admin/blogs']);
      }
    } else {
      this.router.navigate(['/blogs-admin/blogs']);
    }
  }

  onImageButtonClick() {
    this.imageInput.nativeElement.click(); // Trigger the file input click
 }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.showError('Image size should be less than 5MB');
        return;
      }

      // Show loading state
      this.isLoading = true;

      // Upload image to server using API service
      this.apiService.uploadImage(file, 'blog').subscribe({
        next: (response:any) => {
          if (response.success) {
            const imageUrl = response.data.full_url;
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

  private environmentService = inject(EnvironmentService);

  // Helper functions
  getImageUrl(image: string): string {
    if (!image) {
      return 'https://picsum.photos/400/250?random=' + Math.floor(Math.random() * 1000);
    }
    if (image.startsWith('http')) {
      return image;
    }
    if (image.startsWith('/storage')) {
      return `${this.environmentService.apiBaseUrl}${image}`;
    }
    return `${this.environmentService.apiBaseUrl}/storage/images/blog/${image}`;
  }


  /**
   * Test the upload endpoint to debug issues
   */
  testUploadEndpoint() {
    this.apiService.testImageUploadEndpoint().subscribe({
      next: (response) => {
        this.showSuccess('Upload endpoint test successful!');
      },
      error: (error) => {
        console.error('Test endpoint error:', error);
        this.showError('Upload endpoint test failed!');
      }
    });
  }
}
