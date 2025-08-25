import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, Blog } from './api.service';

export interface SitemapUrl {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SitemapService {
  private router = inject(Router);
  private apiService = inject(ApiService);

  private readonly baseUrl = 'https://techtrendstalks.com';

  /**
   * Generate sitemap XML content
   */
  async generateSitemap(): Promise<string> {
    const urls = await this.getAllUrls();
    
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    urls.forEach(urlData => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${urlData.url}</loc>\n`;
      if (urlData.lastmod) {
        sitemap += `    <lastmod>${urlData.lastmod}</lastmod>\n`;
      }
      if (urlData.changefreq) {
        sitemap += `    <changefreq>${urlData.changefreq}</changefreq>\n`;
      }
      if (urlData.priority) {
        sitemap += `    <priority>${urlData.priority}</priority>\n`;
      }
      sitemap += '  </url>\n';
    });
    
    sitemap += '</urlset>';
    
    return sitemap;
  }

  /**
   * Get all URLs for the sitemap
   */
  private async getAllUrls(): Promise<SitemapUrl[]> {
    const urls: SitemapUrl[] = [];

    // Home page - highest priority
    urls.push({
      url: `${this.baseUrl}/`,
      changefreq: 'daily',
      priority: 1.0
    });

    // Calculator pages - high priority
    urls.push({
      url: `${this.baseUrl}/calculator/emi-calculator`,
      changefreq: 'weekly',
      priority: 0.9
    });

    urls.push({
      url: `${this.baseUrl}/calculator/sip-calculator`,
      changefreq: 'weekly',
      priority: 0.9
    });

    urls.push({
      url: `${this.baseUrl}/calculator/loan-eligibility-calculator/checker`,
      changefreq: 'weekly',
      priority: 0.8
    });

    // Blog pages
    urls.push({
      url: `${this.baseUrl}/blogs/home`,
      changefreq: 'daily',
      priority: 0.8
    });

    // Blog categories
    urls.push({
      url: `${this.baseUrl}/blogs/categories`,
      changefreq: 'weekly',
      priority: 0.7
    });

    // Dynamic blog posts
    try {
      const blogs = await this.getBlogs();
      blogs.forEach(blog => {
        urls.push({
          url: `${this.baseUrl}/blogs/${blog.id}`,
          lastmod: blog.updated_at || blog.published_at,
          changefreq: 'monthly',
          priority: 0.6
        });
      });
    } catch (error) {
      console.warn('Could not fetch blogs for sitemap:', error);
    }

    // Add more static pages if they exist
    urls.push({
      url: `${this.baseUrl}/about`,
      changefreq: 'monthly',
      priority: 0.5
    });

    urls.push({
      url: `${this.baseUrl}/contact`,
      changefreq: 'monthly',
      priority: 0.5
    });

    urls.push({
      url: `${this.baseUrl}/privacy-policy`,
      changefreq: 'yearly',
      priority: 0.3
    });

    urls.push({
      url: `${this.baseUrl}/terms-of-service`,
      changefreq: 'yearly',
      priority: 0.3
    });

    return urls;
  }

  /**
   * Get all blogs for sitemap
   */
  private async getBlogs(): Promise<Blog[]> {
    try {
      const response = await this.apiService.getBlogs().toPromise();
      if (response?.success && response.data?.data) {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching blogs:', error);
      return [];
    }
  }

  /**
   * Generate sitemap index for multiple sitemaps
   */
  generateSitemapIndex(): string {
    const currentDate = new Date().toISOString().split('T')[0];
    
    let sitemapIndex = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemapIndex += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    sitemapIndex += '  <sitemap>\n';
    sitemapIndex += `    <loc>${this.baseUrl}/sitemap.xml</loc>\n`;
    sitemapIndex += `    <lastmod>${currentDate}</lastmod>\n`;
    sitemapIndex += '  </sitemap>\n';
    
    sitemapIndex += '</sitemapindex>';
    
    return sitemapIndex;
  }

  /**
   * Download sitemap as file
   */
  downloadSitemap(): void {
    this.generateSitemap().then(sitemap => {
      const blob = new Blob([sitemap], { type: 'application/xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap.xml';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    });
  }

  /**
   * Get sitemap URL for robots.txt
   */
  getSitemapUrl(): string {
    return `${this.baseUrl}/sitemap.xml`;
  }
}
