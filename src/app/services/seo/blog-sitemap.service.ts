import { Injectable, inject } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable, map, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BlogSitemapService {
  private apiService = inject(ApiService);
  private readonly baseUrl = 'https://techtrendstalks.com';

  /**
   * Generate sitemap XML for all blog posts
   */
  generateBlogSitemap(): Observable<string> {
    return this.apiService.getBlogs({ per_page: 1000 }).pipe(
      map(response => {
        if (!response.success || !response.data?.data) {
          return this.getEmptySitemap();
        }

        const blogs = response.data.data;
        let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
        sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
        sitemap += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n';
        sitemap += '        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n';

        blogs.forEach((blog: any) => {
          const slug = blog.slug || blog.id;
          const url = `${this.baseUrl}/blogs/${slug}`;
          const lastmod = blog.updated_at || blog.published_at;
          const imageUrl = this.getFullImageUrl(blog.featured_image);

          sitemap += '  <url>\n';
          sitemap += `    <loc>${url}</loc>\n`;
          sitemap += `    <lastmod>${this.formatDate(lastmod)}</lastmod>\n`;
          sitemap += '    <changefreq>monthly</changefreq>\n';
          sitemap += '    <priority>0.7</priority>\n';
          
          // Add image information if available
          if (imageUrl) {
            sitemap += '    <image:image>\n';
            sitemap += `      <image:loc>${this.escapeXml(imageUrl)}</image:loc>\n`;
            sitemap += `      <image:title>${this.escapeXml(blog.title)}</image:title>\n`;
            if (blog.excerpt) {
              sitemap += `      <image:caption>${this.escapeXml(this.truncate(blog.excerpt, 100))}</image:caption>\n`;
            }
            sitemap += '    </image:image>\n';
          }
          
          // Add news article markup for recent posts (last 2 days)
          const publishDate = new Date(blog.published_at);
          const twoDaysAgo = new Date();
          twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
          
          if (publishDate > twoDaysAgo) {
            sitemap += '    <news:news>\n';
            sitemap += '      <news:publication>\n';
            sitemap += '        <news:name>Tech Trends Talks</news:name>\n';
            sitemap += '        <news:language>en</news:language>\n';
            sitemap += '      </news:publication>\n';
            sitemap += '      <news:publication_date>' + this.formatDate(blog.published_at) + '</news:publication_date>\n';
            sitemap += '      <news:title>' + this.escapeXml(blog.title) + '</news:title>\n';
            if (blog.tags && blog.tags.length > 0) {
              sitemap += '      <news:keywords>' + this.escapeXml(blog.tags.join(', ')) + '</news:keywords>\n';
            }
            sitemap += '    </news:news>\n';
          }
          
          sitemap += '  </url>\n';
        });

        sitemap += '</urlset>';
        return sitemap;
      }),
      catchError(error => {
        console.error('Error generating blog sitemap:', error);
        return of(this.getEmptySitemap());
      })
    );
  }

  /**
   * Generate sitemap index that includes both main and blog sitemaps
   */
  generateSitemapIndex(): string {
    const currentDate = this.formatDate(new Date().toISOString());
    
    let sitemapIndex = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemapIndex += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Main sitemap
    sitemapIndex += '  <sitemap>\n';
    sitemapIndex += `    <loc>${this.baseUrl}/sitemap.xml</loc>\n`;
    sitemapIndex += `    <lastmod>${currentDate}</lastmod>\n`;
    sitemapIndex += '  </sitemap>\n';
    
    // Blog sitemap
    sitemapIndex += '  <sitemap>\n';
    sitemapIndex += `    <loc>${this.baseUrl}/blog-sitemap.xml</loc>\n`;
    sitemapIndex += `    <lastmod>${currentDate}</lastmod>\n`;
    sitemapIndex += '  </sitemap>\n';
    
    sitemapIndex += '</sitemapindex>';
    
    return sitemapIndex;
  }

  /**
   * Get list of all blog URLs for indexing
   */
  getAllBlogUrls(): Observable<string[]> {
    return this.apiService.getBlogs({ per_page: 1000 }).pipe(
      map(response => {
        if (!response.success || !response.data?.data) {
          return [];
        }

        return response.data.data.map((blog: any) => {
          const slug = blog.slug || blog.id;
          return `${this.baseUrl}/blogs/${slug}`;
        });
      }),
      catchError(error => {
        console.error('Error getting blog URLs:', error);
        return of([]);
      })
    );
  }

  /**
   * Download blog sitemap as file
   */
  downloadBlogSitemap(): void {
    this.generateBlogSitemap().subscribe(sitemap => {
      const blob = new Blob([sitemap], { type: 'application/xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'blog-sitemap.xml';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    });
  }

  /**
   * Get full image URL
   */
  private getFullImageUrl(image: string | undefined): string {
    if (!image) return '';
    if (image.startsWith('http')) return image;
    if (image.startsWith('/storage')) return `${this.baseUrl}${image}`;
    return `${this.baseUrl}/storage/images/blog/${image}`;
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(unsafe: string): string {
    if (!unsafe) return '';
    return unsafe.replace(/[<>&'"]/g, (char) => {
      switch (char) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case "'": return '&apos;';
        case '"': return '&quot;';
        default: return char;
      }
    });
  }

  /**
   * Format date to ISO 8601 format
   */
  private formatDate(date: string): string {
    try {
      return new Date(date).toISOString();
    } catch (error) {
      return new Date().toISOString();
    }
  }

  /**
   * Truncate text to specified length
   */
  private truncate(text: string, length: number): string {
    if (!text || text.length <= length) return text;
    return text.substring(0, length).trim() + '...';
  }

  /**
   * Get empty sitemap template
   */
  private getEmptySitemap(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;
  }
}

