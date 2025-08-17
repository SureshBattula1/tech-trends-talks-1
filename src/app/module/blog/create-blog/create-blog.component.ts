import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService, Category, Subcategory, CreateBlogRequest } from '../../../services/api.service';
import { SharedModule } from '../../shared/shared.module';
import { Editor, Toolbar } from 'ngx-editor';

@Component({
  selector: 'app-create-blog',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './create-blog.component.html',
  styleUrl: './create-blog.component.scss'
})
export class CreateBlogComponent {
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



  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
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

    this.loadCategories();
    this.loadSubcategories();
    
    // Watch for category changes to filter subcategories
    this.blogForm.get('category_id')?.valueChanges.subscribe(categoryId => {
      this.filterSubcategories(categoryId);
      this.blogForm.get('subcategory_id')?.setValue('');
    });
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
  }

  private uploadImage(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.selectedImage) {
        resolve('');
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

        // Create blog using API service
        this.apiService.createBlog(blogData).subscribe({
          next: (response) => {
            if (response.success) {
              this.showSuccess('Blog created successfully!');
              this.router.navigate(['/blogs']);
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

      } catch (error) {
        console.error('Error creating blog:', error);
        this.showError('Failed to create blog');
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

        // Create blog as draft using API service
        this.apiService.createBlog(blogData).subscribe({
          next: (response) => {
            if (response.success) {
              this.showSuccess('Blog draft saved successfully!');
              this.router.navigate(['/blogs']);
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
        this.router.navigate(['/blogs']);
      }
    } else {
      this.router.navigate(['/blogs']);
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
      console.log('Starting image upload for file:', file);
      this.apiService.uploadImage(file, 'blog').subscribe({
        next: (response:any) => {
          console.log('Image upload response received:', response);
          if (response.success) {
            const imageUrl = response.data.full_url;
            console.log('Image URL from response:', imageUrl);
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
    console.log('Testing upload endpoint...');
    this.apiService.testImageUploadEndpoint().subscribe({
      next: (response) => {
        console.log('Test endpoint response:', response);
        this.showSuccess('Upload endpoint test successful!');
      },
      error: (error) => {
        console.error('Test endpoint error:', error);
        this.showError('Upload endpoint test failed!');
      }
    });
  }
}
