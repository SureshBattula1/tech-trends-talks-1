import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { BlogSitemapService } from '../../services/seo/blog-sitemap.service';

@Component({
  selector: 'app-sitemap-generator',
  standalone: true,
  imports: [
    CommonModule, 
    MatButtonModule, 
    MatCardModule, 
    MatProgressSpinnerModule,
    MatIconModule
  ],
  template: `
    <div class="sitemap-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>map</mat-icon>
            Blog Sitemap Generator
          </mat-card-title>
          <mat-card-subtitle>
            Generate XML sitemap for all blog posts
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <!-- Info Section -->
          <div class="info-box">
            <h3>📋 What This Does:</h3>
            <ul>
              <li>✅ Generates XML sitemap with all blog posts</li>
              <li>✅ Includes images and metadata</li>
              <li>✅ Ready for Google Search Console</li>
              <li>✅ Helps Google discover your blog posts</li>
            </ul>
          </div>

          <!-- Actions -->
          <div class="actions" *ngIf="!isGenerating()">
            <button 
              mat-raised-button 
              color="primary" 
              (click)="previewSitemap()">
              <mat-icon>visibility</mat-icon>
              Preview Sitemap
            </button>

            <button 
              mat-raised-button 
              color="accent" 
              (click)="downloadSitemap()">
              <mat-icon>download</mat-icon>
              Download Sitemap
            </button>

            <button 
              mat-raised-button 
              (click)="listBlogUrls()">
              <mat-icon>list</mat-icon>
              List All Blog URLs
            </button>
          </div>

          <!-- Loading -->
          <div *ngIf="isGenerating()" class="loading">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Generating sitemap...</p>
          </div>

          <!-- Preview -->
          <div *ngIf="sitemapPreview()" class="preview-section">
            <h3>Sitemap Preview:</h3>
            <div class="preview-box">
              <pre>{{ getSitemapPreview() }}</pre>
            </div>
            <p class="preview-note">
              {{ getTotalLines() }} lines total. 
              <span *ngIf="isTruncated()">Showing first 1000 characters.</span>
            </p>
          </div>

          <!-- Blog URLs List -->
          <div *ngIf="blogUrls().length > 0" class="urls-section">
            <h3>📝 Blog URLs ({{ blogUrls().length }} total):</h3>
            <div class="urls-list">
              <div *ngFor="let url of blogUrls(); let i = index" class="url-item">
                <span class="url-number">{{ i + 1 }}.</span>
                <a [href]="url" target="_blank">{{ url }}</a>
              </div>
            </div>
          </div>

          <!-- Instructions -->
          <div class="instructions-box">
            <h3>📤 Next Steps:</h3>
            <ol>
              <li>Click "Download Sitemap" to save <code>blog-sitemap.xml</code></li>
              <li>Upload the file to your server root directory</li>
              <li>Verify it's accessible at: 
                <code>https://techtrendstalks.com/blog-sitemap.xml</code>
              </li>
              <li>Submit to Google Search Console:
                <a href="https://search.google.com/search-console" target="_blank">
                  Open Search Console →
                </a>
              </li>
            </ol>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .sitemap-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    mat-card {
      margin: 20px 0;
    }

    mat-card-header {
      margin-bottom: 20px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 24px;
    }

    .info-box {
      background: #e3f2fd;
      padding: 16px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid #2196f3;
    }

    .info-box h3 {
      margin-top: 0;
      color: #1976d2;
    }

    .info-box ul {
      margin: 10px 0;
      padding-left: 20px;
    }

    .info-box li {
      margin: 8px 0;
    }

    .actions {
      display: flex;
      gap: 12px;
      margin: 24px 0;
      flex-wrap: wrap;
    }

    .actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
      gap: 16px;
    }

    .preview-section {
      margin-top: 24px;
    }

    .preview-section h3 {
      color: #1976d2;
      margin-bottom: 12px;
    }

    .preview-box {
      background: #263238;
      color: #aed581;
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      max-height: 400px;
      overflow-y: auto;
      font-family: 'Courier New', monospace;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
    }

    .preview-box pre {
      margin: 0;
      font-size: 12px;
      line-height: 1.5;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .preview-note {
      margin-top: 8px;
      font-size: 14px;
      color: #666;
      font-style: italic;
    }

    .urls-section {
      margin-top: 24px;
    }

    .urls-section h3 {
      color: #1976d2;
      margin-bottom: 12px;
    }

    .urls-list {
      background: #f9f9f9;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      max-height: 400px;
      overflow-y: auto;
    }

    .url-item {
      display: flex;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #e0e0e0;
      gap: 8px;
    }

    .url-item:last-child {
      border-bottom: none;
    }

    .url-number {
      color: #666;
      font-weight: bold;
      min-width: 30px;
    }

    .url-item a {
      color: #1976d2;
      text-decoration: none;
      word-break: break-all;
      flex: 1;
    }

    .url-item a:hover {
      text-decoration: underline;
    }

    .instructions-box {
      background: #fff3e0;
      padding: 16px;
      border-radius: 8px;
      margin: 24px 0;
      border-left: 4px solid #ff9800;
    }

    .instructions-box h3 {
      margin-top: 0;
      color: #f57c00;
    }

    .instructions-box ol {
      margin: 10px 0;
      padding-left: 20px;
    }

    .instructions-box li {
      margin: 12px 0;
      line-height: 1.6;
    }

    .instructions-box code {
      background: #424242;
      color: #aed581;
      padding: 2px 8px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
    }

    .instructions-box a {
      color: #f57c00;
      font-weight: 500;
      text-decoration: none;
    }

    .instructions-box a:hover {
      text-decoration: underline;
    }
  `]
})
export class SitemapGeneratorComponent {
  private blogSitemapService = inject(BlogSitemapService);

  // Signals for state management
  isGenerating = signal(false);
  sitemapPreview = signal('');
  blogUrls = signal<string[]>([]);

  /**
   * Generate and preview sitemap
   */
  previewSitemap(): void {
    this.isGenerating.set(true);
    this.sitemapPreview.set('');

    this.blogSitemapService.generateBlogSitemap().subscribe({
      next: (sitemap) => {
        this.sitemapPreview.set(sitemap);
        this.isGenerating.set(false);
        console.log('✅ Sitemap generated successfully!');
        console.log('Total size:', sitemap.length, 'characters');
      },
      error: (error) => {
        console.error('❌ Error generating sitemap:', error);
        this.isGenerating.set(false);
        alert('Error generating sitemap. Check console for details.');
      }
    });
  }

  /**
   * Download sitemap as file
   */
  downloadSitemap(): void {
    this.isGenerating.set(true);

    this.blogSitemapService.generateBlogSitemap().subscribe({
      next: (sitemap) => {
        this.saveSitemapFile(sitemap);
        this.isGenerating.set(false);
        alert('✅ Sitemap downloaded successfully!\n\nNext: Upload blog-sitemap.xml to your server.');
      },
      error: (error) => {
        console.error('❌ Error downloading sitemap:', error);
        this.isGenerating.set(false);
        alert('Error downloading sitemap. Check console for details.');
      }
    });
  }

  /**
   * Get list of all blog URLs
   */
  listBlogUrls(): void {
    this.isGenerating.set(true);
    this.blogUrls.set([]);

    this.blogSitemapService.getAllBlogUrls().subscribe({
      next: (urls) => {
        this.blogUrls.set(urls);
        this.isGenerating.set(false);
        console.log(`✅ Found ${urls.length} blog URLs:`, urls);
      },
      error: (error) => {
        console.error('❌ Error getting blog URLs:', error);
        this.isGenerating.set(false);
        alert('Error getting blog URLs. Check console for details.');
      }
    });
  }

  /**
   * Get truncated preview
   */
  getSitemapPreview(): string {
    const preview = this.sitemapPreview();
    if (preview.length > 1000) {
      return preview.substring(0, 1000) + '\n\n... (truncated)';
    }
    return preview;
  }

  /**
   * Check if preview is truncated
   */
  isTruncated(): boolean {
    return this.sitemapPreview().length > 1000;
  }

  /**
   * Get total number of lines
   */
  getTotalLines(): number {
    return this.sitemapPreview().split('\n').length;
  }

  /**
   * Save sitemap to file
   */
  private saveSitemapFile(sitemap: string): void {
    const blob = new Blob([sitemap], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = 'blog-sitemap.xml';
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
  }
}
