import { Component, OnInit, signal, inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf, NgOptimizedImage, NgFor, isPlatformBrowser } from '@angular/common';
import { ApiService, Blog } from '../../../services/api.service';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MetaTagsService } from '../../../services/meta-tags.service';
import { StructuredDataService } from '../../../services/structured-data.service';
import { EnvironmentService } from '../../../services/environment.service';
import { SocialSharingService } from '../../../services/seo/social-sharing.service';
import { DomSanitizer, SafeHtml, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-blog-details',
  standalone: true,
  imports: [NgIf, NgOptimizedImage, NgFor, MatChipsModule, MatIconModule],
  templateUrl: './blog-details.component.html',
  styleUrls: ['./blog-details.component.scss']
})
export class BlogDetailsComponent implements OnInit {
  blog = signal<Blog | null>(null);
  isLoading = signal(true);
  isCopied = signal(false);

  private metaTagsService = inject(MetaTagsService);
  private structuredDataService = inject(StructuredDataService);
  private socialSharingService = inject(SocialSharingService);
  private router = inject(Router);
  private meta = inject(Meta);
  private platformId = inject(PLATFORM_ID);

  blogContent: SafeHtml = '';

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private sanitizer: DomSanitizer
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
          this.blogContent = this.sanitizer.bypassSecurityTrustHtml(response.data.content);
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
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const currentUrl = `${window.location.origin}${this.router.url}`;
    const imageUrl = this.getImageUrl(blog.featured_image);
    
    // Enhanced meta tags for blog
    const metaTags = this.metaTagsService.generateBlogMetaTags(blog, currentUrl);
    this.metaTagsService.updateMetaTags(metaTags);
    
    // Additional SEO meta tags
    this.meta.updateTag({ name: 'article:published_time', content: blog.published_at });
    if (blog.updated_at) {
      this.meta.updateTag({ name: 'article:modified_time', content: blog.updated_at });
    }
    if (blog.author) {
      this.meta.updateTag({ name: 'article:author', content: blog.author });
    }
    if (blog.category) {
      this.meta.updateTag({ name: 'article:section', content: blog.category.name });
    }
    if (blog.tags && blog.tags.length > 0) {
      blog.tags.forEach((tag: string) => {
        this.meta.addTag({ name: 'article:tag', content: tag });
      });
    }
    
    // Enhanced structured data with Article schema
    const articleStructuredData = this.generateEnhancedBlogStructuredData(blog, currentUrl, imageUrl);
    this.structuredDataService.addStructuredData(articleStructuredData);
    
    // Social sharing optimization
    this.socialSharingService.updateSocialTags({
      title: blog.title,
      description: blog.excerpt || blog.content?.substring(0, 160) || '',
      image: imageUrl,
      url: currentUrl,
      type: 'article'
    });
    
    // Add breadcrumb structured data
    const breadcrumbs = [
      { name: 'Home', url: `${window.location.origin}` },
      { name: 'Blog', url: `${window.location.origin}/blogs/home` },
      { name: blog.title, url: currentUrl }
    ];
    const breadcrumbData = this.structuredDataService.generateBreadcrumbStructuredData(breadcrumbs);
    this.addAdditionalStructuredData('blog-breadcrumb-data', breadcrumbData);
  }

  /**
   * Generate enhanced Article structured data
   */
  private generateEnhancedBlogStructuredData(blog: Blog, currentUrl: string, imageUrl: string): any {
    const wordCount = blog.content ? blog.content.split(/\s+/).length : 0;
    
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': currentUrl,
      'headline': blog.title,
      'description': blog.excerpt || blog.content?.substring(0, 160) || '',
      'image': {
        '@type': 'ImageObject',
        'url': imageUrl,
        'width': 1200,
        'height': 630
      },
      'url': currentUrl,
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': currentUrl
      },
      'author': {
        '@type': 'Person',
        'name': blog.author || 'Tech Trends Talks',
        'url': 'https://techtrendstalks.com/about'
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'Tech Trends Talks',
        'url': 'https://techtrendstalks.com',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://techtrendstalks.com/assets/images/techtrendstalks-logo.jpeg',
          'width': 250,
          'height': 60
        }
      },
      'datePublished': blog.published_at,
      'dateModified': blog.updated_at || blog.published_at,
      'articleSection': blog.category?.name || 'Finance',
      'keywords': blog.tags?.join(', ') || 'financial planning, calculators',
      'wordCount': wordCount,
      'inLanguage': 'en-IN',
      'isAccessibleForFree': true,
      'copyrightYear': new Date(blog.published_at).getFullYear(),
      'copyrightHolder': {
        '@type': 'Organization',
        'name': 'Tech Trends Talks'
      }
    };
  }

  /**
   * Add additional structured data without conflicts
   */
  private addAdditionalStructuredData(id: string, data: any): void {
    const existingScript = document.getElementById(id);
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  /**
   * Share on social media
   */
  shareOnSocial(platform: string): void {
    if (!this.blog()) return;

    const config = {
      title: this.blog()!.title,
      description: this.blog()!.excerpt || '',
      image: this.getImageUrl(this.blog()!.featured_image),
      url: window.location.href
    };

    this.socialSharingService.share(platform, config);
  }

  /**
   * Copy link to clipboard
   */
  async copyLink(): Promise<void> {
    const success = await this.socialSharingService.copyToClipboard(window.location.href);
    if (success) {
      this.isCopied.set(true);
      
      // Reset after 2 seconds
      setTimeout(() => {
        this.isCopied.set(false);
      }, 2000);
    }
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
