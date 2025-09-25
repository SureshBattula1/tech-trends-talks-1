import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf, NgOptimizedImage, NgFor } from '@angular/common';
import { ApiService, Blog } from '../../../services/api.service';
import { MatChipsModule } from '@angular/material/chips';
import { MetaTagsService } from '../../../services/meta-tags.service';
import { StructuredDataService } from '../../../services/structured-data.service';
import { EnvironmentService } from '../../../services/environment.service';

@Component({
  selector: 'app-blog-details',
  standalone: true,
  imports: [NgIf, NgOptimizedImage, NgFor, MatChipsModule],
  templateUrl: './blog-details.component.html',
  styleUrls: ['./blog-details.component.scss']
})
export class BlogDetailsComponent implements OnInit {
  blog = signal<Blog | null>(null);
  isLoading = signal(true);

  private metaTagsService = inject(MetaTagsService);
  private structuredDataService = inject(StructuredDataService);
  private router = inject(Router);

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBlog(id);
    } else {
      this.isLoading.set(false);
    }
  }

  private loadBlog(id: string) {
    this.apiService.getBlogBySlug(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.blog.set(response.data);
          // Update meta tags for the blog post
          this.updateMetaTags(response.data);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  private updateMetaTags(blog: Blog): void {
    const currentUrl = `${window.location.origin}${this.router.url}`;
    const metaTags = this.metaTagsService.generateBlogMetaTags(blog, currentUrl);
    this.metaTagsService.updateMetaTags(metaTags);
    
    // Add structured data
    const structuredData = this.structuredDataService.generateBlogStructuredData(blog, currentUrl);
    this.structuredDataService.addStructuredData(structuredData);
  }

  private environmentService = inject(EnvironmentService);
  getImageUrl(image?: string): string {
    if (!image) {
      return `https://picsum.photos/800/400?random=${Math.floor(Math.random() * 1000)}`;
    }
    if (image.startsWith('http')) return image;
    if (image.startsWith('/storage')) return `${this.environmentService.apiBaseUrl}${image}`;
    return `${this.environmentService.apiBaseUrl}/storage/images/blog/${image}`;
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = `https://picsum.photos/800/400?random=${Math.floor(Math.random() * 1000)}`;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
