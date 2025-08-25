import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  is_active: boolean;
  subcategories?: Subcategory[];
  blogs?: Blog[];
  created_at: string;
  updated_at: string;
}

export interface Subcategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  category_id: number;
  is_active: boolean;
  category?: Category;
  blogs?: Blog[];
  created_at: string;
  updated_at: string;
}

export interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  gallery: string[];
  category_id: number;
  subcategory_id?: number;
  author: string;
  is_published: boolean;
  is_featured: boolean;
  views: number;
  tags: string[];
  published_at: string;
  category?: Category;
  subcategory?: Subcategory;
  created_at: string;
  updated_at: string;
  image?: string; 
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

export interface BlogFilters {
  category_id?: number;
  subcategory_id?: number;
  search?: string;
  featured?: boolean;
  per_page?: number;
  page?: number;
}

export interface CreateBlogRequest {
  title: string;
  excerpt: string;
  content: string;
  category_id: number;
  subcategory_id?: number;
  author: string;
  tags: string[];
  is_published: boolean;
  is_featured: boolean;
  featured_image?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = `http://127.0.0.1:8000` + '/api/v1';

  constructor(private http: HttpClient) {
    console.log('ApiService initialized with base URL:', this.baseUrl);
  }

  /**
   * Test API connectivity
   */
  testApiConnection(): Observable<any> {
    console.log('Testing API connection to:', this.baseUrl);
    return this.http.get(`${this.baseUrl}/health`).pipe(
      tap(response => console.log('API health check response:', response)),
      catchError(this.handleError)
    );
  }

  // Categories
  getCategories(): Observable<ApiResponse<Category[]>> {
    console.log('Fetching categories from:', `${this.baseUrl}/categories`);
    return this.http.get<ApiResponse<Category[]>>(`${this.baseUrl}/categories`).pipe(
      tap(response => console.log('Categories API response:', response)),
      catchError(this.handleError)
    );
  }

  getCategory(id: number): Observable<ApiResponse<Category>> {
    console.log('Fetching category:', id, 'from:', `${this.baseUrl}/categories/${id}`);
    return this.http.get<ApiResponse<Category>>(`${this.baseUrl}/categories/${id}`);
  }

  createCategory(categoryData: Partial<Category>): Observable<ApiResponse<Category>> {
    console.log('Creating category with data:', categoryData);
    return this.http.post<ApiResponse<Category>>(`${this.baseUrl}/categories`, categoryData).pipe(
      tap(response => console.log('Create category response:', response)),
      catchError(this.handleError)
    );
  }

  updateCategory(id: number, categoryData: Partial<Category>): Observable<ApiResponse<Category>> {
    console.log('Updating category:', id, 'with data:', categoryData);
    return this.http.put<ApiResponse<Category>>(`${this.baseUrl}/categories/${id}`, categoryData).pipe(
      tap(response => console.log('Update category response:', response)),
      catchError(this.handleError)
    );
  }

  deleteCategory(id: number): Observable<ApiResponse<void>> {
    console.log('Deleting category:', id);
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/categories/${id}`).pipe(
      tap(response => console.log('Delete category response:', response)),
      catchError(this.handleError)
    );
  }

  getCategorySubcategories(categoryId: number): Observable<ApiResponse<Subcategory[]>> {
    console.log('Fetching subcategories for category:', categoryId);
    return this.http.get<ApiResponse<Subcategory[]>>(`${this.baseUrl}/categories/${categoryId}/subcategories`).pipe(
      tap(response => console.log('Category subcategories response:', response)),
      catchError(this.handleError)
    );
  }

  getCategoryBlogs(categoryId: number): Observable<ApiResponse<Blog[]>> {
    console.log('Fetching blogs for category:', categoryId);
    return this.http.get<ApiResponse<Blog[]>>(`${this.baseUrl}/categories/${categoryId}/blogs`).pipe(
      tap(response => console.log('Category blogs response:', response)),
      catchError(this.handleError)
    );
  }

  // Subcategories
  getSubcategories(categoryId?: number): Observable<ApiResponse<Subcategory[]>> {
    let params = new HttpParams();
    if (categoryId) {
      params = params.set('category_id', categoryId.toString());
    }
    console.log('Fetching subcategories with params:', params.toString());
    return this.http.get<ApiResponse<Subcategory[]>>(`${this.baseUrl}/subcategories`, { params }).pipe(
      tap(response => console.log('Subcategories API response:', response)),
      catchError(this.handleError)
    );
  }

  getSubcategory(id: number): Observable<ApiResponse<Subcategory>> {
    console.log('Fetching subcategory:', id);
    return this.http.get<ApiResponse<Subcategory>>(`${this.baseUrl}/subcategories/${id}`).pipe(
      tap(response => console.log('Subcategory response:', response)),
      catchError(this.handleError)
    );
  }

  createSubcategory(subcategoryData: Partial<Subcategory>): Observable<ApiResponse<Subcategory>> {
    console.log('Creating subcategory with data:', subcategoryData);
    return this.http.post<ApiResponse<Subcategory>>(`${this.baseUrl}/subcategories`, subcategoryData).pipe(
      tap(response => console.log('Create subcategory response:', response)),
      catchError(this.handleError)
    );
  }

  updateSubcategory(id: number, subcategoryData: Partial<Subcategory>): Observable<ApiResponse<Subcategory>> {
    console.log('Updating subcategory:', id, 'with data:', subcategoryData);
    return this.http.put<ApiResponse<Subcategory>>(`${this.baseUrl}/subcategories/${id}`, subcategoryData).pipe(
      tap(response => console.log('Update subcategory response:', response)),
      catchError(this.handleError)
    );
  }

  deleteSubcategory(id: number): Observable<ApiResponse<void>> {
    console.log('Deleting subcategory:', id);
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/subcategories/${id}`).pipe(
      tap(response => console.log('Delete subcategory response:', response)),
      catchError(this.handleError)
    );
  }

  getSubcategoryBlogs(subcategoryId: number): Observable<ApiResponse<Blog[]>> {
    console.log('Fetching blogs for subcategory:', subcategoryId);
    return this.http.get<ApiResponse<Blog[]>>(`${this.baseUrl}/subcategories/${subcategoryId}/blogs`).pipe(
      tap(response => console.log('Subcategory blogs response:', response)),
      catchError(this.handleError)
    );
  }

  getMyBlogs(filters?: BlogFilters): Observable<PaginatedResponse<Blog>> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.category_id) params = params.set('category_id', filters.category_id.toString());
      if (filters.subcategory_id) params = params.set('subcategory_id', filters.subcategory_id.toString());
      if (filters.search) params = params.set('search', filters.search);
      if (filters.featured) params = params.set('featured', 'true');
      if (filters.per_page) params = params.set('per_page', filters.per_page.toString());
      if (filters.page) params = params.set('page', filters.page.toString());
    }

    return this.http.get<PaginatedResponse<Blog>>(`${this.baseUrl}/my-blogs`, { params });
  }

  // Blogs
  getBlogs(filters?: BlogFilters): Observable<PaginatedResponse<Blog>> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.category_id) params = params.set('category_id', filters.category_id.toString());
      if (filters.subcategory_id) params = params.set('subcategory_id', filters.subcategory_id.toString());
      if (filters.search) params = params.set('search', filters.search);
      if (filters.featured) params = params.set('featured', 'true');
      if (filters.per_page) params = params.set('per_page', filters.per_page.toString());
      if (filters.page) params = params.set('page', filters.page.toString());
    }

    return this.http.get<PaginatedResponse<Blog>>(`${this.baseUrl}/blogs`, { params });
  }

  getBlog(id: number): Observable<ApiResponse<Blog>> {
    return this.http.get<ApiResponse<Blog>>(`${this.baseUrl}/blogs/${id}`);
  }

  getFeaturedBlogs(): Observable<PaginatedResponse<Blog>> {
    return this.getBlogs({ featured: true, per_page: 6 });
  }

  getLatestBlogs(limit: number = 5): Observable<PaginatedResponse<Blog>> {
    return this.getBlogs({ per_page: limit });
  }

  // Create Blog
  createBlog(blogData: CreateBlogRequest): Observable<ApiResponse<Blog>> {
    return this.http.post<ApiResponse<Blog>>(`${this.baseUrl}/blogs`, blogData).pipe(
      tap(response => console.log('Create blog response:', response)),
      catchError(this.handleError)
    );
  }

  // Update Blog
  updateBlog(id: number, blogData: Partial<Blog>): Observable<ApiResponse<Blog>> {
    console.log('Updating blog:', id, 'with data:', blogData);
    return this.http.put<ApiResponse<Blog>>(`${this.baseUrl}/blogs/${id}`, blogData).pipe(
      tap(response => console.log('Update blog response:', response)),
      catchError(this.handleError)
    );
  }

  // Delete Blog
  deleteBlog(id: number): Observable<ApiResponse<void>> {
    console.log('Deleting blog:', id);
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/blogs/${id}`).pipe(
      tap(response => console.log('Delete blog response:', response)),
      catchError(this.handleError)
    );
  }

  // Upload Image
  uploadImage(image: File, type: string = 'blog'): Observable<ApiResponse<{ url: string; full_url: string }>> {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('type', type);
    
    console.log('Uploading image:', { name: image.name, size: image.size, type: image.type });
    console.log('FormData entries:');
    // Log FormData contents for debugging
    console.log('Image file:', image);
    console.log('Type:', type);
    console.log('Upload endpoint:', `${this.baseUrl}/upload-image`);
    
    return this.http.post<ApiResponse<{ url: string; full_url: string }>>(`${this.baseUrl}/upload-image`, formData).pipe(
      tap(response => {
        console.log('Upload image response:', response);
        console.log('Response data:', response.data);
        console.log('Response success:', response.success);
      }),
      catchError(error => {
        console.error('Upload image error:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error details:', error.error);
        return this.handleError(error);
      })
    );
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API Error:', error);
    
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server Error: ${error.status} - ${error.message}`;
      if (error.error?.message) {
        errorMessage += ` - ${error.error.message}`;
      }
    }
    
    console.error('Error Message:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Test image upload endpoint specifically
   */
  testImageUploadEndpoint(): Observable<any> {
    console.log('Testing image upload endpoint...');
    const testFormData = new FormData();
    testFormData.append('test', 'test');
    
    return this.http.post(`${this.baseUrl}/upload-image`, testFormData).pipe(
      tap(response => console.log('Test upload endpoint response:', response)),
      catchError(error => {
        console.error('Test upload endpoint error:', error);
        return this.handleError(error);
      })
    );
  }
}