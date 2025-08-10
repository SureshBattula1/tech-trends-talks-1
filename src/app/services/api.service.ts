import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = `https://api.techtrendstalks.com` + '/api/v1';

  constructor(private http: HttpClient) {}

  // Categories
  getCategories(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(`${this.baseUrl}/categories`);
  }

  getCategory(id: number): Observable<ApiResponse<Category>> {
    return this.http.get<ApiResponse<Category>>(`${this.baseUrl}/categories/${id}`);
  }

  getCategorySubcategories(categoryId: number): Observable<ApiResponse<Subcategory[]>> {
    return this.http.get<ApiResponse<Subcategory[]>>(`${this.baseUrl}/categories/${categoryId}/subcategories`);
  }

  getCategoryBlogs(categoryId: number): Observable<ApiResponse<Blog[]>> {
    return this.http.get<ApiResponse<Blog[]>>(`${this.baseUrl}/categories/${categoryId}/blogs`);
  }

  // Subcategories
  getSubcategories(categoryId?: number): Observable<ApiResponse<Subcategory[]>> {
    let params = new HttpParams();
    if (categoryId) {
      params = params.set('category_id', categoryId.toString());
    }
    return this.http.get<ApiResponse<Subcategory[]>>(`${this.baseUrl}/subcategories`, { params });
  }

  getSubcategory(id: number): Observable<ApiResponse<Subcategory>> {
    return this.http.get<ApiResponse<Subcategory>>(`${this.baseUrl}/subcategories/${id}`);
  }

  getSubcategoryBlogs(subcategoryId: number): Observable<ApiResponse<Blog[]>> {
    return this.http.get<ApiResponse<Blog[]>>(`${this.baseUrl}/subcategories/${subcategoryId}/blogs`);
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
}