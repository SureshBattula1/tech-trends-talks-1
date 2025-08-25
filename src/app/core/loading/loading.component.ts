import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface LoadingConfig {
  type: 'spinner' | 'skeleton' | 'dots' | 'bars' | 'pulse';
  size: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  text?: string;
  overlay?: boolean;
}

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-container" 
         [class]="'loading-' + config.type + ' loading-' + config.size" 
         [class.loading-overlay]="config.overlay" 
         [class.loading-color-primary]="config.color === 'primary'"
         [class.loading-color-secondary]="config.color === 'secondary'"
         [class.loading-color-success]="config.color === 'success'"
         [class.loading-color-warning]="config.color === 'warning'"
         [class.loading-color-error]="config.color === 'error'">
      <div *ngIf="config.type === 'spinner'" class="loading-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-text" *ngIf="config.text">{{ config.text }}</div>
      </div>
      <div *ngIf="config.type === 'skeleton'" class="loading-skeleton">
        <div class="skeleton-item skeleton-header"></div>
        <div class="skeleton-item skeleton-line" *ngFor="let item of skeletonLines"></div>
      </div>
      <div *ngIf="config.type === 'dots'" class="loading-dots">
        <div class="dot" *ngFor="let dot of dots"></div>
        <div class="dots-text" *ngIf="config.text">{{ config.text }}</div>
      </div>
      <div *ngIf="config.type === 'bars'" class="loading-bars">
        <div class="bar" *ngFor="let bar of bars"></div>
        <div class="bars-text" *ngIf="config.text">{{ config.text }}</div>
      </div>
      <div *ngIf="config.type === 'pulse'" class="loading-pulse">
        <div class="pulse-circle"></div>
        <div class="pulse-text" *ngIf="config.text">{{ config.text }}</div>
      </div>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100px;
    }

    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.9);
      z-index: 1000;
      min-height: 100vh;
    }

    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .spinner-ring {
      width: 40px;
      height: 40px;
      border: 3px solid #e5e7eb;
      border-top: 3px solid #1976d2;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .spinner-text {
      margin-top: 12px;
      font-size: 14px;
      color: #6b7280;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-skeleton {
      width: 100%;
    }

    .skeleton-item {
      background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      margin-bottom: 8px;
    }

    .skeleton-header {
      height: 24px;
      width: 60%;
      border-radius: 6px;
    }

    .skeleton-line {
      height: 16px;
      border-radius: 4px;
    }

    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .loading-dots {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .dot {
      width: 8px;
      height: 8px;
      background-color: #1976d2;
      border-radius: 50%;
      margin: 0 4px;
      animation: dots-bounce 1.4s ease-in-out infinite both;
    }

    .dot:nth-child(1) { animation-delay: -0.32s; }
    .dot:nth-child(2) { animation-delay: -0.16s; }

    .dots-text {
      margin-top: 12px;
      font-size: 14px;
      color: #6b7280;
    }

    @keyframes dots-bounce {
      0%, 80%, 100% {
        transform: scale(0);
      }
      40% {
        transform: scale(1);
      }
    }

    .loading-bars {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .bar {
      width: 4px;
      height: 20px;
      background-color: #1976d2;
      margin: 0 2px;
      animation: bars-stretch 1.2s ease-in-out infinite;
    }

    .bar:nth-child(1) { animation-delay: -1.2s; }
    .bar:nth-child(2) { animation-delay: -1.1s; }
    .bar:nth-child(3) { animation-delay: -1.0s; }
    .bar:nth-child(4) { animation-delay: -0.9s; }

    .bars-text {
      margin-top: 12px;
      font-size: 14px;
      color: #6b7280;
    }

    @keyframes bars-stretch {
      0%, 40%, 100% {
        transform: scaleY(0.4);
      }
      20% {
        transform: scaleY(1);
      }
    }

    .loading-pulse {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .pulse-circle {
      width: 40px;
      height: 40px;
      background-color: #1976d2;
      border-radius: 50%;
      animation: pulse 1.5s ease-in-out infinite;
    }

    .pulse-text {
      margin-top: 12px;
      font-size: 14px;
      color: #6b7280;
    }

    @keyframes pulse {
      0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.7);
      }
      70% {
        transform: scale(1);
        box-shadow: 0 0 0 10px rgba(25, 118, 210, 0);
      }
      100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
      }
    }

    .loading-sm .spinner-ring,
    .loading-sm .pulse-circle {
      width: 24px;
      height: 24px;
    }

    .loading-sm .dot {
      width: 6px;
      height: 6px;
    }

    .loading-sm .bar {
      width: 3px;
      height: 16px;
    }

    .loading-sm .skeleton-header {
      height: 20px;
    }

    .loading-sm .skeleton-line {
      height: 14px;
    }

    .loading-md .spinner-ring,
    .loading-md .pulse-circle {
      width: 40px;
      height: 40px;
    }

    .loading-md .dot {
      width: 8px;
      height: 8px;
    }

    .loading-md .bar {
      width: 4px;
      height: 20px;
    }

    .loading-md .skeleton-header {
      height: 24px;
    }

    .loading-md .skeleton-line {
      height: 16px;
    }

    .loading-lg .spinner-ring,
    .loading-lg .pulse-circle {
      width: 60px;
      height: 60px;
    }

    .loading-lg .dot {
      width: 12px;
      height: 12px;
    }

    .loading-lg .bar {
      width: 6px;
      height: 30px;
    }

    .loading-lg .skeleton-header {
      height: 32px;
    }

    .loading-lg .skeleton-line {
      height: 20px;
    }

    .loading-xl .spinner-ring,
    .loading-xl .pulse-circle {
      width: 80px;
      height: 80px;
    }

    .loading-xl .dot {
      width: 16px;
      height: 16px;
    }

    .loading-xl .bar {
      width: 8px;
      height: 40px;
    }

    .loading-xl .skeleton-header {
      height: 40px;
    }

    .loading-xl .skeleton-line {
      height: 24px;
    }

    .loading-color-primary .spinner-ring { border-top-color: #1976d2; }
    .loading-color-primary .dot,
    .loading-color-primary .bar,
    .loading-color-primary .pulse-circle { background-color: #1976d2; }

    .loading-color-secondary .spinner-ring { border-top-color: #ff9800; }
    .loading-color-secondary .dot,
    .loading-color-secondary .bar,
    .loading-color-secondary .pulse-circle { background-color: #ff9800; }

    .loading-color-success .spinner-ring { border-top-color: #4caf50; }
    .loading-color-success .dot,
    .loading-color-success .bar,
    .loading-color-success .pulse-circle { background-color: #4caf50; }

    .loading-color-warning .spinner-ring { border-top-color: #ff9800; }
    .loading-color-warning .dot,
    .loading-color-warning .bar,
    .loading-color-warning .pulse-circle { background-color: #ff9800; }

    .loading-color-error .spinner-ring { border-top-color: #f44336; }
    .loading-color-error .dot,
    .loading-color-error .bar,
    .loading-color-error .pulse-circle { background-color: #f44336; }

    @media (max-width: 768px) {
      .loading-container {
        min-height: 80px;
      }

      .loading-xl .spinner-ring,
      .loading-xl .pulse-circle {
        width: 60px;
        height: 60px;
      }
    }
  `]
})
export class LoadingComponent implements OnInit {
  @Input() config: LoadingConfig = {
    type: 'spinner',
    size: 'md',
    color: 'primary'
  };

  skeletonLines: number[] = [];
  dots: number[] = [1, 2, 3];
  bars: number[] = [1, 2, 3, 4];

  ngOnInit() {
    // Generate skeleton lines based on size
    const lineCount = this.config.size === 'sm' ? 3 : 
                     this.config.size === 'md' ? 4 : 
                     this.config.size === 'lg' ? 5 : 6;
    
    this.skeletonLines = Array.from({ length: lineCount }, (_, i) => i);
  }
}
