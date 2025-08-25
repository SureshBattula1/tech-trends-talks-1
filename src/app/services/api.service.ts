import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { EnvironmentService } from './environment.service';
import { LoggingService } from './logging.service';

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
  data: T;
  message: string;
  success: boolean;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
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
  
  constructor(
    private http: HttpClient,
    private environmentService: EnvironmentService,
    private loggingService: LoggingService
  ) {}
  
  /**
   * Get request with environment-aware URL
   */
  get<T>(endpoint: string, params?: HttpParams, headers?: HttpHeaders): Observable<ApiResponse<T>> {
    const url = this.environmentService.getApiEndpoint(endpoint);
    
    this.loggingService.debug(`API GET: ${url}`, { params, headers });
    
    return this.http.get<ApiResponse<T>>(url, { params, headers })
      .pipe(
        retry(1),
        catchError(this.handleError.bind(this))
      );
  }
  
  /**
   * Post request with environment-aware URL
   */
  post<T>(endpoint: string, body: any, headers?: HttpHeaders): Observable<ApiResponse<T>> {
    const url = this.environmentService.getApiEndpoint(endpoint);
    
    this.loggingService.debug(`API POST: ${url}`, { body, headers });
    
    return this.http.post<ApiResponse<T>>(url, body, { headers })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }
  
  /**
   * Put request with environment-aware URL
   */
  put<T>(endpoint: string, body: any, headers?: HttpHeaders): Observable<ApiResponse<T>> {
    const url = this.environmentService.getApiEndpoint(endpoint);
    
    this.loggingService.debug(`API PUT: ${url}`, { body, headers });
    
    return this.http.put<ApiResponse<T>>(url, body, { headers })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }
  
  /**
   * Delete request with environment-aware URL
   */
  delete<T>(endpoint: string, headers?: HttpHeaders): Observable<ApiResponse<T>> {
    const url = this.environmentService.getApiEndpoint(endpoint);
    
    this.loggingService.debug(`API DELETE: ${url}`, { headers });
    
    return this.http.delete<ApiResponse<T>>(url, { headers })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }
  
  /**
   * Patch request with environment-aware URL
   */
  patch<T>(endpoint: string, body: any, headers?: HttpHeaders): Observable<ApiResponse<T>> {
    const url = this.environmentService.getApiEndpoint(endpoint);
    
    this.loggingService.debug(`API PATCH: ${url}`, { body, headers });
    
    return this.http.patch<ApiResponse<T>>(url, body, { headers })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }
  
  /**
   * Create default headers with authentication if needed
   */
  createHeaders(additionalHeaders?: { [key: string]: string }): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    // Add authentication token if available
    const token = this.getAuthToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Add additional headers
    if (additionalHeaders) {
      Object.keys(additionalHeaders).forEach(key => {
        headers = headers.set(key, additionalHeaders[key]);
      });
    }
    
    return headers;
  }
  
  /**
   * Create query parameters
   */
  createParams(params: { [key: string]: any }): HttpParams {
    let httpParams = new HttpParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });
    
    return httpParams;
  }
  
  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server Error: ${error.status} - ${error.message}`;
      
      // Log detailed error in development
      if (this.environmentService.isDevelopment) {
        this.loggingService.error('API Error Details:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          error: error.error
        });
      }
    }
    
    this.loggingService.error(errorMessage, error);
    
    return throwError(() => new Error(errorMessage));
  }
  
  /**
   * Get authentication token from storage
   */
  private getAuthToken(): string | null {
    // TODO: Implement token retrieval from your auth service
    return localStorage.getItem('auth_token');
  }

  // ===== CATEGORY METHODS =====
  
  /**
   * Get all categories
   */
  getCategories(): Observable<ApiResponse<Category[]>> {
    return this.get<Category[]>('categories');
  }
  
  /**
   * Get a specific category by ID
   */
  getCategory(id: number): Observable<ApiResponse<Category>> {
    return this.get<Category>(`categories/${id}`);
  }
  
  /**
   * Create a new category
   */
  createCategory(categoryData: Partial<Category>): Observable<ApiResponse<Category>> {
    const headers = this.createHeaders();
    return this.post<Category>('categories', categoryData, headers);
  }
  
  /**
   * Update an existing category
   */
  updateCategory(id: number, categoryData: Partial<Category>): Observable<ApiResponse<Category>> {
    const headers = this.createHeaders();
    return this.put<Category>(`categories/${id}`, categoryData, headers);
  }
  
  /**
   * Delete a category
   */
  deleteCategory(id: number): Observable<ApiResponse<void>> {
    const headers = this.createHeaders();
    return this.delete<void>(`categories/${id}`, headers);
  }
  
  /**
   * Get subcategories for a specific category
   */
  getCategorySubcategories(categoryId: number): Observable<ApiResponse<Subcategory[]>> {
    return this.get<Subcategory[]>(`categories/${categoryId}/subcategories`);
  }
  
  /**
   * Get blogs for a specific category
   */
  getCategoryBlogs(categoryId: number): Observable<ApiResponse<Blog[]>> {
    return this.get<Blog[]>(`categories/${categoryId}/blogs`);
  }

  // ===== SUBCATEGORY METHODS =====
  
  /**
   * Get all subcategories
   */
  getSubcategories(categoryId?: number): Observable<ApiResponse<Subcategory[]>> {
    let params: HttpParams | undefined;
    if (categoryId) {
      params = this.createParams({ category_id: categoryId });
    }
    return this.get<Subcategory[]>('subcategories', params);
  }
  
  /**
   * Get a specific subcategory by ID
   */
  getSubcategory(id: number): Observable<ApiResponse<Subcategory>> {
    return this.get<Subcategory>(`subcategories/${id}`);
  }
  
  /**
   * Create a new subcategory
   */
  createSubcategory(subcategoryData: Partial<Subcategory>): Observable<ApiResponse<Subcategory>> {
    const headers = this.createHeaders();
    return this.post<Subcategory>('subcategories', subcategoryData, headers);
  }
  
  /**
   * Update an existing subcategory
   */
  updateSubcategory(id: number, subcategoryData: Partial<Subcategory>): Observable<ApiResponse<Subcategory>> {
    const headers = this.createHeaders();
    return this.put<Subcategory>(`subcategories/${id}`, subcategoryData, headers);
  }
  
  /**
   * Delete a subcategory
   */
  deleteSubcategory(id: number): Observable<ApiResponse<void>> {
    const headers = this.createHeaders();
    return this.delete<void>(`subcategories/${id}`, headers);
  }
  
  /**
   * Get blogs for a specific subcategory
   */
  getSubcategoryBlogs(subcategoryId: number): Observable<ApiResponse<Blog[]>> {
    return this.get<Blog[]>(`subcategories/${subcategoryId}/blogs`);
  }

  // ===== BLOG METHODS =====
  
  /**
   * Get all blogs with optional filters
   */
  getBlogs(filters?: BlogFilters): Observable<ApiResponse<PaginatedResponse<Blog>>> {
    let params: HttpParams | undefined;
    if (filters) {
      params = this.createParams(filters);
    }
    return this.get<PaginatedResponse<Blog>>('blogs', params);
  }
  
  /**
   * Get a specific blog by ID
   */
  getBlog(id: number): Observable<ApiResponse<Blog>> {
    return this.get<Blog>(`blogs/${id}`);
  }
  
  /**
   * Get featured blogs
   */
  getFeaturedBlogs(): Observable<ApiResponse<PaginatedResponse<Blog>>> {
    return this.getBlogs({ featured: true, per_page: 6 });
  }
  
  /**
   * Get latest blogs
   */
  getLatestBlogs(limit: number = 5): Observable<ApiResponse<PaginatedResponse<Blog>>> {
    return this.getBlogs({ per_page: limit });
  }
  
  /**
   * Get user's blogs
   */
  getMyBlogs(filters?: BlogFilters): Observable<ApiResponse<PaginatedResponse<Blog>>> {
    let params: HttpParams | undefined;
    if (filters) {
      params = this.createParams(filters);
    }
    return this.get<PaginatedResponse<Blog>>('my-blogs', params);
  }
  
  /**
   * Create a new blog
   */
  createBlog(blogData: CreateBlogRequest): Observable<ApiResponse<Blog>> {
    const headers = this.createHeaders();
    return this.post<Blog>('blogs', blogData, headers);
  }
  
  /**
   * Update an existing blog
   */
  updateBlog(id: number, blogData: Partial<Blog>): Observable<ApiResponse<Blog>> {
    const headers = this.createHeaders();
    return this.put<Blog>(`blogs/${id}`, blogData, headers);
  }
  
  /**
   * Delete a blog
   */
  deleteBlog(id: number): Observable<ApiResponse<void>> {
    const headers = this.createHeaders();
    return this.delete<void>(`blogs/${id}`, headers);
  }

  // ===== IMAGE UPLOAD METHODS =====
  
  /**
   * Upload an image
   */
  uploadImage(image: File, type: string = 'blog'): Observable<ApiResponse<{ url: string; full_url: string }>> {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('type', type);
    
    let headers = this.createHeaders();
    // Remove Content-Type header for FormData
    headers = headers.delete('Content-Type');
    
    const url = this.environmentService.getApiEndpoint('upload-image');
    this.loggingService.debug(`API POST: ${url}`, { type, imageName: image.name });
    
    return this.http.post<ApiResponse<{ url: string; full_url: string }>>(url, formData, { headers })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }
  
  /**
   * Test image upload endpoint
   */
  testImageUploadEndpoint(): Observable<any> {
    const testFormData = new FormData();
    testFormData.append('test', 'test');
    
    let headers = this.createHeaders();
    headers = headers.delete('Content-Type');
    
    const url = this.environmentService.getApiEndpoint('upload-image');
    this.loggingService.debug(`API POST: ${url}`, { test: true });
    
    return this.http.post(url, testFormData, { headers })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  // ===== HEALTH CHECK METHODS =====
  
  /**
   * Test API connectivity
   */
  testApiConnection(): Observable<any> {
    return this.get<any>('health');
  }
}