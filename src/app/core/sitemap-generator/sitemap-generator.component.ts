import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SitemapService } from '../../services/sitemap.service';

@Component({
  selector: 'app-sitemap-generator',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule, MatProgressBarModule],
  template: `
    <div class="sitemap-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>map</mat-icon>
            Sitemap Generator
          </mat-card-title>
          <mat-card-subtitle>
            Generate and download XML sitemap for SEO optimization
          </mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <p>
            This tool generates a comprehensive XML sitemap including all calculator pages, 
            blog posts, and static pages. The sitemap helps search engines discover and index your content.
          </p>
          
          <div class="sitemap-info">
            <h4>What's included:</h4>
            <ul>
              <li>Home page and calculator pages</li>
              <li>All blog posts with last modified dates</li>
              <li>Blog categories and pages</li>
              <li>Proper priority and change frequency settings</li>
            </ul>
          </div>
          
          <div class="sitemap-actions">
            <button 
              mat-raised-button 
              color="primary" 
              (click)="generateSitemap()"
              [disabled]="isGenerating">
              <mat-icon>download</mat-icon>
              {{ isGenerating ? 'Generating...' : 'Generate & Download Sitemap' }}
            </button>
            
            <button 
              mat-stroked-button 
              (click)="previewSitemap()"
              [disabled]="isGenerating">
              <mat-icon>visibility</mat-icon>
              Preview Sitemap
            </button>
          </div>
          
          <mat-progress-bar 
            *ngIf="isGenerating" 
            mode="indeterminate">
          </mat-progress-bar>
          
          <div *ngIf="sitemapPreview" class="sitemap-preview">
            <h4>Sitemap Preview:</h4>
            <pre>{{ sitemapPreview }}</pre>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .sitemap-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .sitemap-info {
      margin: 20px 0;
      padding: 15px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    
    .sitemap-info h4 {
      margin-top: 0;
      color: #1976d2;
    }
    
    .sitemap-info ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    
    .sitemap-actions {
      margin: 20px 0;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    
    .sitemap-preview {
      margin-top: 20px;
      padding: 15px;
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
    }
    
    .sitemap-preview pre {
      background-color: #fff;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 12px;
      line-height: 1.4;
    }
    
    mat-card-header {
      margin-bottom: 20px;
    }
    
    mat-card-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  `]
})
export class SitemapGeneratorComponent {
  private sitemapService = inject(SitemapService);
  
  isGenerating = false;
  sitemapPreview: string | null = null;

  async generateSitemap(): Promise<void> {
    this.isGenerating = true;
    this.sitemapPreview = null;
    
    try {
      await this.sitemapService.generateSitemap();
      this.sitemapService.downloadSitemap();
    } catch (error) {
      console.error('Error generating sitemap:', error);
    } finally {
      this.isGenerating = false;
    }
  }

  async previewSitemap(): Promise<void> {
    this.isGenerating = true;
    
    try {
      const sitemap = await this.sitemapService.generateSitemap();
      this.sitemapPreview = sitemap;
    } catch (error) {
      console.error('Error previewing sitemap:', error);
    } finally {
      this.isGenerating = false;
    }
  }
}
