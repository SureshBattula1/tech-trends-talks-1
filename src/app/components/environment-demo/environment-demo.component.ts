import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { EnvironmentService } from '../../services/environment.service';
import { LoggingService } from '../../services/logging.service';
import { AppConfigService } from '../../config/app.config';

@Component({
  selector: 'app-environment-demo',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule
  ],
  template: `
    <mat-card class="environment-demo">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>settings</mat-icon>
          Environment Configuration Demo
        </mat-card-title>
        <mat-card-subtitle>
          Current Environment: {{ currentEnvironment }}
        </mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <div class="environment-info">
          <h3>Environment Details</h3>
          <div class="info-grid">
            <div class="info-item">
              <strong>App Name:</strong> {{ appName }}
            </div>
            <div class="info-item">
              <strong>Version:</strong> {{ appVersion }}
            </div>
            <div class="info-item">
              <strong>API URL:</strong> {{ apiUrl }}
            </div>
            <div class="info-item">
              <strong>Build Date:</strong> {{ buildDate | date:'medium' }}
            </div>
          </div>
          
          <h3>Feature Flags</h3>
          <div class="feature-flags">
            <mat-chip 
              [color]="enableDebug ? 'accent' : 'warn'"
              [selected]="enableDebug">
              Debug: {{ enableDebug ? 'ON' : 'OFF' }}
            </mat-chip>
            <mat-chip 
              [color]="enableLogging ? 'accent' : 'warn'"
              [selected]="enableLogging">
              Logging: {{ enableLogging ? 'ON' : 'OFF' }}
            </mat-chip>
            <mat-chip 
              [color]="enableAnalytics ? 'accent' : 'warn'"
              [selected]="enableAnalytics">
              Analytics: {{ enableAnalytics ? 'ON' : 'OFF' }}
            </mat-chip>
          </div>
          
          <h3>Configuration</h3>
          <div class="config-info">
            <div class="info-item">
              <strong>API Timeout:</strong> {{ apiTimeout }}ms
            </div>
            <div class="info-item">
              <strong>Max Retries:</strong> {{ maxRetries }}
            </div>
            <div class="info-item">
              <strong>Cache TTL:</strong> {{ cacheTTL }}ms
            </div>
            <div class="info-item">
              <strong>Theme:</strong> {{ theme }}
            </div>
          </div>
        </div>
      </mat-card-content>
      
      <mat-card-actions>
        <button mat-raised-button color="primary" (click)="testLogging()">
          Test Logging
        </button>
        <button mat-raised-button color="accent" (click)="testApiEndpoint()">
          Test API Endpoint
        </button>
        <button mat-raised-button color="warn" (click)="testError()">
          Test Error Logging
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .environment-demo {
      max-width: 800px;
      margin: 20px auto;
    }
    
    .environment-info {
      margin: 20px 0;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin: 15px 0;
    }
    
    .info-item {
      padding: 10px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    
    .feature-flags {
      display: flex;
      gap: 10px;
      margin: 15px 0;
      flex-wrap: wrap;
    }
    
    .config-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin: 15px 0;
    }
    
    mat-card-actions {
      display: flex;
      gap: 10px;
      justify-content: center;
    }
    
    h3 {
      color: #333;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 5px;
      margin: 20px 0 10px 0;
    }
  `]
})
export class EnvironmentDemoComponent implements OnInit {
  
  // Environment properties
  currentEnvironment: string = '';
  appName: string = '';
  appVersion: string = '';
  apiUrl: string = '';
  buildDate: string = '';
  
  // Feature flags
  enableDebug: boolean = false;
  enableLogging: boolean = false;
  enableAnalytics: boolean = false;
  
  // Configuration
  apiTimeout: number = 0;
  maxRetries: number = 0;
  cacheTTL: number = 0;
  theme: string = '';
  
  constructor(
    private environmentService: EnvironmentService,
    private loggingService: LoggingService,
    private appConfigService: AppConfigService
  ) {}
  
  ngOnInit(): void {
    this.loadEnvironmentInfo();
    this.loadConfiguration();
  }
  
  private loadEnvironmentInfo(): void {
    const env = this.environmentService.config;
    
    this.currentEnvironment = env.production ? 'Production' : 
                            env.staging ? 'Staging' : 'Development';
    this.appName = env.appName;
    this.appVersion = env.appVersion;
    this.apiUrl = env.apiUrl;
    this.buildDate = env.buildDate;
    
    this.enableDebug = env.enableDebug;
    this.enableLogging = env.enableLogging;
    this.enableAnalytics = env.enableAnalytics;
  }
  
  private loadConfiguration(): void {
    const config = this.appConfigService.getConfig();
    
    this.apiTimeout = config.apiTimeout;
    this.maxRetries = config.maxRetries;
    this.cacheTTL = config.cache.defaultTTL;
    this.theme = config.ui.theme;
  }
  
  testLogging(): void {
    this.loggingService.info('Info message from demo component');
    this.loggingService.debug('Debug message from demo component');
    this.loggingService.warn('Warning message from demo component');
    
    alert('Check the console for logging messages!');
  }
  
  testApiEndpoint(): void {
    const endpoint = this.environmentService.getApiEndpoint('users');
    this.loggingService.info(`API Endpoint: ${endpoint}`);
    
    alert(`API Endpoint: ${endpoint}`);
  }
  
  testError(): void {
    try {
      throw new Error('This is a test error for demonstration');
    } catch (error) {
      this.loggingService.error('Test error caught and logged', error);
    }
    
    alert('Check the console for error logging!');
  }
}
