import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingComponent, LoadingConfig } from '../../core/loading/loading.component';

@Component({
  selector: 'app-utility-demo',
  standalone: true,
  imports: [CommonModule, LoadingComponent],
  template: `
    <div class="container">
      <div class="demo-header">
        <h1 class="text-4xl font-bold text-primary mb-2">Utility Classes Demo</h1>
        <p class="text-lg text-secondary">Showcasing our new SCSS utility classes and components</p>
      </div>

      <!-- Spacing Utilities -->
      <section class="demo-section">
        <h2 class="section-title">Spacing Utilities</h2>
        <div class="demo-grid">
          <div class="demo-item">
            <h3 class="demo-subtitle">Margin Utilities</h3>
            <div class="demo-examples">
              <div class="m-1 p-3 bg-primary text-white rounded">m-1</div>
              <div class="m-2 p-3 bg-primary text-white rounded">m-2</div>
              <div class="m-3 p-3 bg-primary text-white rounded">m-3</div>
              <div class="m-4 p-3 bg-primary text-white rounded">m-4</div>
            </div>
          </div>
          
          <div class="demo-item">
            <h3 class="demo-subtitle">Padding Utilities</h3>
            <div class="demo-examples">
              <div class="m-2 p-1 bg-secondary text-primary rounded">p-1</div>
              <div class="m-2 p-2 bg-secondary text-primary rounded">p-2</div>
              <div class="m-2 p-3 bg-secondary text-primary rounded">p-3</div>
              <div class="m-2 p-4 bg-secondary text-primary rounded">p-4</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Display Utilities -->
      <section class="demo-section">
        <h2 class="section-title">Display Utilities</h2>
        <div class="demo-grid">
          <div class="demo-item">
            <h3 class="demo-subtitle">Flexbox Utilities</h3>
            <div class="demo-examples">
              <div class="d-flex gap-2 mb-2">
                <div class="p-2 bg-primary text-white rounded">Flex Item 1</div>
                <div class="p-2 bg-primary text-white rounded">Flex Item 2</div>
                <div class="p-2 bg-primary text-white rounded">Flex Item 3</div>
              </div>
              <div class="d-flex flex-column gap-2">
                <div class="p-2 bg-secondary text-primary rounded">Column Item 1</div>
                <div class="p-2 bg-secondary text-primary rounded">Column Item 2</div>
                <div class="p-2 bg-secondary text-primary rounded">Column Item 3</div>
              </div>
            </div>
          </div>
          
          <div class="demo-item">
            <h3 class="demo-subtitle">Grid Utilities</h3>
            <div class="demo-examples">
              <div class="grid grid-cols-3 gap-2">
                <div class="p-2 bg-success text-white rounded text-center">Grid 1</div>
                <div class="p-2 bg-success text-white rounded text-center">Grid 2</div>
                <div class="p-2 bg-success text-white rounded text-center">Grid 3</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Typography Utilities -->
      <section class="demo-section">
        <h2 class="section-title">Typography Utilities</h2>
        <div class="demo-grid">
          <div class="demo-item">
            <h3 class="demo-subtitle">Font Sizes</h3>
            <div class="demo-examples">
              <div class="text-xs mb-1">text-xs - Extra Small</div>
              <div class="text-sm mb-1">text-sm - Small</div>
              <div class="text-base mb-1">text-base - Base</div>
              <div class="text-lg mb-1">text-lg - Large</div>
              <div class="text-xl mb-1">text-xl - Extra Large</div>
              <div class="text-2xl mb-1">text-2xl - 2X Large</div>
            </div>
          </div>
          
          <div class="demo-item">
            <h3 class="demo-subtitle">Font Weights</h3>
            <div class="demo-examples">
              <div class="font-light mb-1">font-light - Light</div>
              <div class="font-normal mb-1">font-normal - Normal</div>
              <div class="font-medium mb-1">font-medium - Medium</div>
              <div class="font-semibold mb-1">font-semibold - Semi Bold</div>
              <div class="font-bold mb-1">font-bold - Bold</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Color Utilities -->
      <section class="demo-section">
        <h2 class="section-title">Color Utilities</h2>
        <div class="demo-grid">
          <div class="demo-item">
            <h3 class="demo-subtitle">Text Colors</h3>
            <div class="demo-examples">
              <div class="text-primary mb-1">text-primary</div>
              <div class="text-secondary mb-1">text-secondary</div>
              <div class="text-success mb-1">text-success</div>
              <div class="text-warning mb-1">text-warning</div>
              <div class="text-error mb-1">text-error</div>
            </div>
          </div>
          
          <div class="demo-item">
            <h3 class="demo-subtitle">Background Colors</h3>
            <div class="demo-examples">
              <div class="p-3 mb-2 bg-primary text-white rounded">bg-primary</div>
              <div class="p-3 mb-2 bg-secondary text-white rounded">bg-secondary</div>
              <div class="p-3 mb-2 bg-success text-white rounded">bg-success</div>
              <div class="p-3 mb-2 bg-warning text-white rounded">bg-warning</div>
              <div class="p-3 mb-2 bg-error text-white rounded">bg-error</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Button Components -->
      <section class="demo-section">
        <h2 class="section-title">Button Components</h2>
        <div class="demo-grid">
          <div class="demo-item">
            <h3 class="demo-subtitle">Button Variants</h3>
            <div class="demo-examples">
              <button class="btn btn-primary mb-2">Primary Button</button>
              <button class="btn btn-secondary mb-2">Secondary Button</button>
              <button class="btn btn-success mb-2">Success Button</button>
              <button class="btn btn-warning mb-2">Warning Button</button>
              <button class="btn btn-error mb-2">Error Button</button>
            </div>
          </div>
          
          <div class="demo-item">
            <h3 class="demo-subtitle">Button Sizes</h3>
            <div class="demo-examples">
              <button class="btn btn-primary btn-sm mb-2">Small Button</button>
              <button class="btn btn-primary btn-md mb-2">Medium Button</button>
              <button class="btn btn-primary btn-lg mb-2">Large Button</button>
            </div>
          </div>
        </div>
      </section>

      <!-- Card Components -->
      <section class="demo-section">
        <h2 class="section-title">Card Components</h2>
        <div class="demo-grid">
          <div class="demo-item">
            <h3 class="demo-subtitle">Basic Cards</h3>
            <div class="demo-examples">
              <div class="card card-sm">
                <div class="card-header">
                  <h4 class="card-title">Small Card</h4>
                </div>
                <div class="card-body">
                  <p class="card-content">This is a small card with some content.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="demo-item">
            <h3 class="demo-subtitle">Elevated Cards</h3>
            <div class="demo-examples">
              <div class="card card-elevated">
                <div class="card-header">
                  <h4 class="card-title">Elevated Card</h4>
                </div>
                <div class="card-body">
                  <p class="card-content">This card has elevation and hover effects.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Form Components -->
      <section class="demo-section">
        <h2 class="section-title">Form Components</h2>
        <div class="demo-grid">
          <div class="demo-item">
            <h3 class="demo-subtitle">Form Inputs</h3>
            <div class="demo-examples">
              <div class="form-group">
                <label class="form-label">Text Input</label>
                <input type="text" class="form-input" placeholder="Enter text here">
              </div>
              <div class="form-group">
                <label class="form-label">Select Input</label>
                <select class="form-select">
                  <option>Option 1</option>
                  <option>Option 2</option>
                  <option>Option 3</option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="demo-item">
            <h3 class="demo-subtitle">Form Actions</h3>
            <div class="demo-examples">
              <div class="form-actions">
                <button class="btn btn-primary">Submit</button>
                <button class="btn btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Loading Components -->
      <section class="demo-section">
        <h2 class="section-title">Loading Components</h2>
        <div class="demo-grid">
          <div class="demo-item">
            <h3 class="demo-subtitle">Loading Types</h3>
            <div class="demo-examples">
              <app-loading [config]="spinnerConfig"></app-loading>
              <app-loading [config]="skeletonConfig"></app-loading>
              <app-loading [config]="dotsConfig"></app-loading>
            </div>
          </div>
          
          <div class="demo-item">
            <h3 class="demo-subtitle">Loading Sizes</h3>
            <div class="demo-examples">
              <app-loading [config]="smallConfig"></app-loading>
              <app-loading [config]="largeConfig"></app-loading>
            </div>
          </div>
        </div>
      </section>

      <!-- Responsive Utilities -->
      <section class="demo-section">
        <h2 class="section-title">Responsive Utilities</h2>
        <div class="demo-grid">
          <div class="demo-item">
            <h3 class="demo-subtitle">Responsive Display</h3>
            <div class="demo-examples">
              <div class="d-none md:d-block p-3 bg-primary text-white rounded">
                Hidden on mobile, visible on medium screens and up
              </div>
              <div class="d-block md:d-none p-3 bg-secondary text-primary rounded">
                Visible on mobile, hidden on medium screens and up
              </div>
            </div>
          </div>
          
          <div class="demo-item">
            <h3 class="demo-subtitle">Responsive Text</h3>
            <div class="demo-examples">
              <div class="text-center md:text-left p-3 bg-success text-white rounded">
                Centered on mobile, left-aligned on medium screens and up
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Grid Layout -->
      <section class="demo-section">
        <h2 class="section-title">Grid Layout</h2>
        <div class="demo-grid">
          <div class="demo-item">
            <h3 class="demo-subtitle">CSS Grid</h3>
            <div class="demo-examples">
              <div class="grid grid-cols-3 gap-3">
                <div class="p-3 bg-primary text-white rounded text-center">Column 1</div>
                <div class="p-3 bg-primary text-white rounded text-center">Column 2</div>
                <div class="p-3 bg-primary text-white rounded text-center">Column 3</div>
              </div>
            </div>
          </div>
          
          <div class="demo-item">
            <h3 class="demo-subtitle">Responsive Grid</h3>
            <div class="demo-examples">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div class="p-3 bg-secondary text-primary rounded text-center">Responsive 1</div>
                <div class="p-3 bg-secondary text-primary rounded text-center">Responsive 2</div>
                <div class="p-3 bg-secondary text-primary rounded text-center">Responsive 3</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Theme Demo -->
      <section class="demo-section">
        <h2 class="section-title">Theme System</h2>
        <div class="demo-grid">
          <div class="demo-item">
            <h3 class="demo-subtitle">Theme Toggle</h3>
            <div class="demo-examples">
              <button class="theme-toggle" (click)="toggleTheme()">
                <span class="theme-icon light-icon">☀️</span>
                <span class="theme-icon dark-icon">🌙</span>
              </button>
              <p class="mt-2 text-sm text-secondary">Click to toggle between light and dark themes</p>
            </div>
          </div>
          
          <div class="demo-item">
            <h3 class="demo-subtitle">Theme-aware Components</h3>
            <div class="demo-examples">
              <div class="card theme-aware">
                <div class="card-header">
                  <h4 class="card-title">Theme-aware Card</h4>
                </div>
                <div class="card-body">
                  <p class="card-content">This card automatically adapts to the current theme.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .demo-header {
      text-align: center;
      margin-bottom: var(--spacing-3xl);
      padding: var(--spacing-xl) 0;
      background: linear-gradient(135deg, var(--primary-50), var(--secondary-50));
      border-radius: var(--radius-xl);
    }

    .demo-section {
      margin-bottom: var(--spacing-3xl);
      padding: var(--spacing-xl);
      background-color: var(--bg-primary);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-light);
    }

    .section-title {
      @include heading-style(var(--font-size-2xl), var(--font-weight-bold);
      color: var(--primary-color);
      margin-bottom: var(--spacing-xl);
      padding-bottom: var(--spacing-md);
      border-bottom: 2px solid var(--primary-color);
      display: inline-block;
    }

    .demo-grid {
      @include grid(2, var(--spacing-xl));

      @include respond-below(var(--breakpoint-md)) {
        @include grid-cols(1);
        gap: var(--spacing-lg);
      }
    }

    .demo-item {
      .demo-subtitle {
        @include heading-style(var(--font-size-lg), var(--font-weight-semibold);
        color: var(--text-primary);
        margin-bottom: var(--spacing-lg);
      }

      .demo-examples {
        @include flex-center;
        @include flex-column;
        gap: var(--spacing-md);
        align-items: stretch;
      }
    }

    /* Responsive adjustments */
    @include respond-below(var(--breakpoint-md)) {
      .demo-section {
        padding: var(--spacing-lg);
        margin-bottom: var(--spacing-2xl);
      }

      .demo-header {
        padding: var(--spacing-lg) 0;
        margin-bottom: var(--spacing-2xl);
      }
    }

    @include respond-below(var(--breakpoint-sm)) {
      .demo-section {
        padding: var(--spacing-md);
      }

      .demo-header {
        padding: var(--spacing-md) 0;
      }
    }
  `]
})
export class UtilityDemoComponent {
  // Loading configurations
  spinnerConfig: LoadingConfig = {
    type: 'spinner',
    size: 'md',
    color: 'primary',
    text: 'Loading...'
  };

  skeletonConfig: LoadingConfig = {
    type: 'skeleton',
    size: 'md',
    color: 'primary'
  };

  dotsConfig: LoadingConfig = {
    type: 'dots',
    size: 'md',
    color: 'primary'
  };

  smallConfig: LoadingConfig = {
    type: 'spinner',
    size: 'sm',
    color: 'secondary'
  };

  largeConfig: LoadingConfig = {
    type: 'spinner',
    size: 'lg',
    color: 'success'
  };

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
  }
}
