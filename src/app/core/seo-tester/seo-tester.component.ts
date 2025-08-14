import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MetaTagsService } from '../../services/meta-tags.service';
import { StructuredDataService } from '../../services/structured-data.service';
import { SitemapService } from '../../services/sitemap.service';

interface SEOTestResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

@Component({
  selector: 'app-seo-tester',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatChipsModule,
    MatExpansionModule,
    MatListModule
  ],
  template: `
    <div class="seo-tester-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>search</mat-icon>
            SEO Tester & Validator
          </mat-card-title>
          <mat-card-subtitle>
            Test and validate your SEO implementation
          </mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="seo-actions">
            <button 
              mat-raised-button 
              color="primary" 
              (click)="runAllTests()"
              [disabled]="isRunning">
              <mat-icon>play_arrow</mat-icon>
              {{ isRunning ? 'Running Tests...' : 'Run All Tests' }}
            </button>
            
            <button 
              mat-stroked-button 
              (click)="clearResults()">
              <mat-icon>clear</mat-icon>
              Clear Results
            </button>
          </div>
          
          <div class="test-results" *ngIf="testResults().length > 0">
            <h3>Test Results</h3>
            
            <div class="summary-stats">
              <mat-chip color="primary">
                Total: {{ testResults().length }}
              </mat-chip>
              <mat-chip color="accent">
                Passed: {{ getPassedCount() }}
              </mat-chip>
              <mat-chip color="warn">
                Failed: {{ getFailedCount() }}
              </mat-chip>
              <mat-chip>
                Warnings: {{ getWarningCount() }}
              </mat-chip>
            </div>
            
            <mat-accordion>
              <mat-expansion-panel 
                *ngFor="let result of testResults(); trackBy: trackByTest"
                [expanded]="result.status === 'fail'">
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <mat-icon 
                      [class]="'status-icon ' + result.status"
                      [class.mat-icon]="true">
                      {{ getStatusIcon(result.status) }}
                    </mat-icon>
                    {{ result.test }}
                  </mat-panel-title>
                  <mat-panel-description>
                    <mat-chip 
                      [color]="getStatusColor(result.status)"
                      class="status-chip">
                      {{ result.status.toUpperCase() }}
                    </mat-chip>
                  </mat-panel-description>
                </mat-expansion-panel-header>
                
                <div class="test-details">
                  <p><strong>Message:</strong> {{ result.message }}</p>
                  <p *ngIf="result.details"><strong>Details:</strong> {{ result.details }}</p>
                </div>
              </mat-expansion-panel>
            </mat-accordion>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .seo-tester-container {
      padding: 20px;
      max-width: 1000px;
      margin: 0 auto;
    }
    
    .seo-actions {
      margin: 20px 0;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    
    .test-results {
      margin-top: 30px;
    }
    
    .summary-stats {
      display: flex;
      gap: 10px;
      margin: 20px 0;
      flex-wrap: wrap;
    }
    
    .status-icon {
      margin-right: 8px;
    }
    
    .status-icon.pass {
      color: #4caf50;
    }
    
    .status-icon.fail {
      color: #f44336;
    }
    
    .status-icon.warning {
      color: #ff9800;
    }
    
    .status-chip {
      font-size: 12px;
      font-weight: bold;
    }
    
    .test-details {
      padding: 10px 0;
    }
    
    .test-details p {
      margin: 5px 0;
    }
    
    mat-expansion-panel {
      margin-bottom: 10px;
    }
    
    mat-expansion-panel-header {
      padding: 16px;
    }
    
    .mat-expansion-panel-header-title {
      display: flex;
      align-items: center;
    }
  `]
})
export class SEOTesterComponent implements OnInit {
  private metaTagsService = inject(MetaTagsService);
  private structuredDataService = inject(StructuredDataService);
  private sitemapService = inject(SitemapService);
  
  testResults = signal<SEOTestResult[]>([]);
  isRunning = false;

  ngOnInit(): void {
    // Auto-run basic tests on component load
    this.runBasicTests();
  }

  async runAllTests(): Promise<void> {
    this.isRunning = true;
    this.clearResults();
    
    try {
      await this.runBasicTests();
      await this.runMetaTagTests();
      await this.runStructuredDataTests();
      await this.runSitemapTests();
      await this.runPerformanceTests();
    } finally {
      this.isRunning = false;
    }
  }

  private async runBasicTests(): Promise<void> {
    // Test 1: Check if page has title
    const title = document.title;
    if (title && title.length > 0) {
      this.addTestResult('Page Title', 'pass', 'Page has a title', `Title: "${title}"`);
    } else {
      this.addTestResult('Page Title', 'fail', 'Page is missing a title');
    }

    // Test 2: Check if page has meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && metaDescription.getAttribute('content')) {
      const content = metaDescription.getAttribute('content') || '';
      if (content.length >= 50 && content.length <= 160) {
        this.addTestResult('Meta Description', 'pass', 'Meta description is present and optimal length', 
          `Length: ${content.length} characters`);
      } else {
        this.addTestResult('Meta Description', 'warning', 'Meta description length is not optimal', 
          `Current length: ${content.length} characters (recommended: 50-160)`);
      }
    } else {
      this.addTestResult('Meta Description', 'fail', 'Meta description is missing');
    }

    // Test 3: Check if page has viewport meta tag
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      this.addTestResult('Viewport Meta Tag', 'pass', 'Viewport meta tag is present');
    } else {
      this.addTestResult('Viewport Meta Tag', 'fail', 'Viewport meta tag is missing');
    }

    // Test 4: Check if page has charset declaration
    const charset = document.querySelector('meta[charset]');
    if (charset) {
      this.addTestResult('Character Encoding', 'pass', 'Character encoding is declared');
    } else {
      this.addTestResult('Character Encoding', 'fail', 'Character encoding is not declared');
    }
  }

  private async runMetaTagTests(): Promise<void> {
    // Test 5: Check Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    
    if (ogTitle && ogDescription && ogImage) {
      this.addTestResult('Open Graph Tags', 'pass', 'All essential Open Graph tags are present');
    } else {
      this.addTestResult('Open Graph Tags', 'warning', 'Some Open Graph tags are missing', 
        `og:title: ${ogTitle ? '✓' : '✗'}, og:description: ${ogDescription ? '✓' : '✗'}, og:image: ${ogImage ? '✓' : '✗'}`);
    }

    // Test 6: Check Twitter Card tags
    const twitterCard = document.querySelector('meta[name="twitter:card"]');
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    
    if (twitterCard && twitterTitle) {
      this.addTestResult('Twitter Card Tags', 'pass', 'Twitter Card tags are present');
    } else {
      this.addTestResult('Twitter Card Tags', 'warning', 'Some Twitter Card tags are missing');
    }
  }

  private async runStructuredDataTests(): Promise<void> {
    // Test 7: Check for structured data
    const structuredDataScripts = document.querySelectorAll('script[type="application/ld+json"]');
    
    if (structuredDataScripts.length > 0) {
      this.addTestResult('Structured Data', 'pass', 'Structured data is present', 
        `Found ${structuredDataScripts.length} structured data script(s)`);
    } else {
      this.addTestResult('Structured Data', 'fail', 'No structured data found');
    }
  }

  private async runSitemapTests(): Promise<void> {
    // Test 8: Check robots.txt
    try {
      const robotsResponse = await fetch('/robots.txt');
      if (robotsResponse.ok) {
        this.addTestResult('Robots.txt', 'pass', 'Robots.txt file is accessible');
      } else {
        this.addTestResult('Robots.txt', 'fail', 'Robots.txt file is not accessible');
      }
    } catch (error) {
      this.addTestResult('Robots.txt', 'fail', 'Robots.txt file is not accessible', error.message);
    }

    // Test 9: Check sitemap reference
    const robotsContent = await fetch('/robots.txt').then(r => r.text()).catch(() => '');
    if (robotsContent.includes('Sitemap:')) {
      this.addTestResult('Sitemap Reference', 'pass', 'Sitemap is referenced in robots.txt');
    } else {
      this.addTestResult('Sitemap Reference', 'warning', 'Sitemap is not referenced in robots.txt');
    }
  }

  private async runPerformanceTests(): Promise<void> {
    // Test 10: Check for preload hints
    const preloadLinks = document.querySelectorAll('link[rel="preload"]');
    if (preloadLinks.length > 0) {
      this.addTestResult('Preload Hints', 'pass', 'Preload hints are present', 
        `Found ${preloadLinks.length} preload hint(s)`);
    } else {
      this.addTestResult('Preload Hints', 'warning', 'No preload hints found');
    }

    // Test 11: Check for DNS prefetch
    const dnsPrefetch = document.querySelectorAll('link[rel="dns-prefetch"]');
    if (dnsPrefetch.length > 0) {
      this.addTestResult('DNS Prefetch', 'pass', 'DNS prefetch is configured');
    } else {
      this.addTestResult('DNS Prefetch', 'warning', 'DNS prefetch is not configured');
    }
  }

  private addTestResult(test: string, status: 'pass' | 'fail' | 'warning', message: string, details?: string): void {
    this.testResults.update(results => [...results, { test, status, message, details }]);
  }

  private getPassedCount(): number {
    return this.testResults().filter(r => r.status === 'pass').length;
  }

  private getFailedCount(): number {
    return this.testResults().filter(r => r.status === 'fail').length;
  }

  private getWarningCount(): number {
    return this.testResults().filter(r => r.status === 'warning').length;
  }

  private getStatusIcon(status: string): string {
    switch (status) {
      case 'pass': return 'check_circle';
      case 'fail': return 'error';
      case 'warning': return 'warning';
      default: return 'help';
    }
  }

  private getStatusColor(status: string): string {
    switch (status) {
      case 'pass': return 'primary';
      case 'fail': return 'warn';
      case 'warning': return 'accent';
      default: return '';
    }
  }

  clearResults(): void {
    this.testResults.set([]);
  }

  trackByTest(index: number, result: SEOTestResult): string {
    return result.test;
  }
}
