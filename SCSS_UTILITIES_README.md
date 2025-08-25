# SCSS Utilities & Components Documentation

## Overview

This document describes the comprehensive SCSS utility system we've implemented for the Tech Trends Talks application. The system provides:

- **CSS Custom Properties (Variables)** for consistent theming
- **Utility Classes** for rapid development
- **Component Styles** for reusable UI elements
- **Responsive Design** utilities
- **Theme System** with light/dark mode support
- **Loading States** and animations

## File Structure

```
src/assets/scss/
├── abstracts/
│   ├── _variables.scss      # CSS Custom Properties
│   └── _mixins.scss         # SCSS Mixins
├── base/
│   └── _utilities.scss      # Utility Classes
├── components/
│   ├── _calculator.scss     # Calculator Component Styles
│   ├── _forms.scss          # Form Component Styles
│   ├── _buttons.scss        # Button Component Styles
│   └── _cards.scss          # Card Component Styles
├── layouts/
│   ├── _grid.scss           # Grid Layout System
│   ├── _header.scss         # Header Layout Styles
│   └── _footer.scss         # Footer Layout Styles
└── themes/
    └── _default.scss        # Theme System
```

## CSS Custom Properties (Variables)

### Colors

```scss
:root {
  // Primary Colors
  --primary-color: #1976d2;
  --primary-light: #42a5f5;
  --primary-dark: #1565c0;
  
  // Secondary Colors
  --secondary-color: #ff9800;
  --secondary-light: #ffb74d;
  --secondary-dark: #f57c00;
  
  // Semantic Colors
  --success-color: #4caf50;
  --warning-color: #ff9800;
  --error-color: #f44336;
  
  // Neutral Colors
  --white: #ffffff;
  --black: #000000;
  --gray-50: #fafafa;
  --gray-100: #f5f5f5;
  // ... more gray shades
}
```

### Spacing

```scss
:root {
  --spacing-xs: 0.25rem;    // 4px
  --spacing-sm: 0.5rem;     // 8px
  --spacing-md: 1rem;       // 16px
  --spacing-lg: 1.5rem;     // 24px
  --spacing-xl: 2rem;       // 32px
  --spacing-2xl: 3rem;      // 48px
  --spacing-3xl: 4rem;      // 64px
  --spacing-4xl: 6rem;      // 96px
}
```

### Typography

```scss
:root {
  --font-size-xs: 0.75rem;    // 12px
  --font-size-sm: 0.875rem;   // 14px
  --font-size-base: 1rem;     // 16px
  --font-size-lg: 1.125rem;   // 18px
  --font-size-xl: 1.25rem;    // 20px
  --font-size-2xl: 1.5rem;    // 24px
  --font-size-3xl: 1.875rem;  // 30px
  --font-size-4xl: 2.25rem;   // 36px
  --font-size-5xl: 3rem;      // 48px
}
```

### Breakpoints

```scss
:root {
  --breakpoint-xs: 0;
  --breakpoint-sm: 576px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 992px;
  --breakpoint-xl: 1200px;
  --breakpoint-2xl: 1400px;
}
```

## Utility Classes

### Spacing Utilities

#### Margin
```html
<!-- All sides -->
<div class="m-0">No margin</div>
<div class="m-1">Small margin</div>
<div class="m-2">Medium margin</div>
<div class="m-3">Large margin</div>

<!-- Specific sides -->
<div class="mt-3">Top margin</div>
<div class="mb-3">Bottom margin</div>
<div class="ml-3">Left margin</div>
<div class="mr-3">Right margin</div>

<!-- X and Y axes -->
<div class="mx-3">Horizontal margin</div>
<div class="my-3">Vertical margin</div>

<!-- Auto margins -->
<div class="mx-auto">Center horizontally</div>
```

#### Padding
```html
<!-- All sides -->
<div class="p-0">No padding</div>
<div class="p-1">Small padding</div>
<div class="p-2">Medium padding</div>
<div class="p-3">Large padding</div>

<!-- Specific sides -->
<div class="pt-3">Top padding</div>
<div class="pb-3">Bottom padding</div>
<div class="pl-3">Left padding</div>
<div class="pr-3">Right padding</div>

<!-- X and Y axes -->
<div class="px-3">Horizontal padding</div>
<div class="py-3">Vertical padding</div>
```

### Display Utilities

```html
<div class="d-none">Hidden</div>
<div class="d-block">Block</div>
<div class="d-flex">Flexbox</div>
<div class="d-grid">CSS Grid</div>
<div class="d-inline">Inline</div>
<div class="d-inline-block">Inline Block</div>
```

### Flexbox Utilities

```html
<!-- Direction -->
<div class="d-flex flex-row">Row direction</div>
<div class="d-flex flex-column">Column direction</div>

<!-- Justify Content -->
<div class="d-flex justify-start">Start</div>
<div class="d-flex justify-center">Center</div>
<div class="d-flex justify-end">End</div>
<div class="d-flex justify-between">Space between</div>
<div class="d-flex justify-around">Space around</div>

<!-- Align Items -->
<div class="d-flex items-start">Start</div>
<div class="d-flex items-center">Center</div>
<div class="d-flex items-end">End</div>
<div class="d-flex items-stretch">Stretch</div>

<!-- Flex Properties -->
<div class="d-flex flex-1">Grow and shrink</div>
<div class="d-flex flex-auto">Auto flex</div>
<div class="d-flex flex-none">No flex</div>
```

### Grid Utilities

```html
<!-- Grid Container -->
<div class="grid">Grid container</div>
<div class="grid grid-cols-3">3 columns</div>
<div class="grid grid-cols-4">4 columns</div>

<!-- Grid Gaps -->
<div class="grid gap-0">No gap</div>
<div class="grid gap-1">Small gap</div>
<div class="grid gap-3">Medium gap</div>
<div class="grid gap-5">Large gap</div>

<!-- Responsive Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  Responsive grid
</div>
```

### Typography Utilities

#### Font Sizes
```html
<div class="text-xs">Extra Small</div>
<div class="text-sm">Small</div>
<div class="text-base">Base</div>
<div class="text-lg">Large</div>
<div class="text-xl">Extra Large</div>
<div class="text-2xl">2X Large</div>
<div class="text-3xl">3X Large</div>
<div class="text-4xl">4X Large</div>
<div class="text-5xl">5X Large</div>
```

#### Font Weights
```html
<div class="font-light">Light</div>
<div class="font-normal">Normal</div>
<div class="font-medium">Medium</div>
<div class="font-semibold">Semi Bold</div>
<div class="font-bold">Bold</div>
<div class="font-extrabold">Extra Bold</div>
```

#### Text Colors
```html
<div class="text-primary">Primary text</div>
<div class="text-secondary">Secondary text</div>
<div class="text-success">Success text</div>
<div class="text-warning">Warning text</div>
<div class="text-error">Error text</div>
```

#### Text Alignment
```html
<div class="text-left">Left aligned</div>
<div class="text-center">Center aligned</div>
<div class="text-right">Right aligned</div>
<div class="text-justify">Justified</div>
```

### Background Utilities

```html
<div class="bg-primary">Primary background</div>
<div class="bg-secondary">Secondary background</div>
<div class="bg-success">Success background</div>
<div class="bg-warning">Warning background</div>
<div class="bg-error">Error background</div>
<div class="bg-white">White background</div>
<div class="bg-dark">Dark background</div>
```

### Border Utilities

```html
<!-- Border presence -->
<div class="border">With border</div>
<div class="border-0">No border</div>

<!-- Border sides -->
<div class="border-t">Top border</div>
<div class="border-r">Right border</div>
<div class="border-b">Bottom border</div>
<div class="border-l">Left border</div>

<!-- Border radius -->
<div class="rounded-none">No radius</div>
<div class="rounded-sm">Small radius</div>
<div class="rounded-md">Medium radius</div>
<div class="rounded-lg">Large radius</div>
<div class="rounded-xl">Extra large radius</div>
<div class="rounded-2xl">2X large radius</div>
<div class="rounded-full">Full radius</div>
```

### Shadow Utilities

```html
<div class="shadow-none">No shadow</div>
<div class="shadow-sm">Small shadow</div>
<div class="shadow-md">Medium shadow</div>
<div class="shadow-lg">Large shadow</div>
<div class="shadow-xl">Extra large shadow</div>
<div class="shadow-2xl">2X large shadow</div>
```

### Responsive Utilities

```html
<!-- Responsive display -->
<div class="d-none md:d-block">
  Hidden on mobile, visible on medium screens and up
</div>

<div class="d-block md:d-none">
  Visible on mobile, hidden on medium screens and up
</div>

<!-- Responsive text alignment -->
<div class="text-center md:text-left">
  Centered on mobile, left-aligned on medium screens and up
</div>

<!-- Responsive grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  Responsive grid columns
</div>
```

## Component Styles

### Button Components

```html
<!-- Button variants -->
<button class="btn btn-primary">Primary Button</button>
<button class="btn btn-secondary">Secondary Button</button>
<button class="btn btn-success">Success Button</button>
<button class="btn btn-warning">Warning Button</button>
<button class="btn btn-error">Error Button</button>

<!-- Button outlines -->
<button class="btn btn-outline">Outline Button</button>
<button class="btn btn-outline btn-outline-secondary">Secondary Outline</button>

<!-- Button sizes -->
<button class="btn btn-primary btn-sm">Small Button</button>
<button class="btn btn-primary btn-md">Medium Button</button>
<button class="btn btn-primary btn-lg">Large Button</button>
<button class="btn btn-primary btn-xl">Extra Large Button</button>

<!-- Button states -->
<button class="btn btn-primary btn-loading">Loading Button</button>
<button class="btn btn-primary" disabled>Disabled Button</button>
```

### Card Components

```html
<!-- Basic card -->
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
  </div>
  <div class="card-body">
    <p class="card-content">Card content goes here.</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">Action</button>
  </div>
</div>

<!-- Card variants -->
<div class="card card-elevated">Elevated card</div>
<div class="card card-outlined">Outlined card</div>
<div class="card card-flat">Flat card</div>

<!-- Card sizes -->
<div class="card card-sm">Small card</div>
<div class="card card-md">Medium card</div>
<div class="card card-lg">Large card</div>

<!-- Card themes -->
<div class="card card-theme-primary">Primary theme</div>
<div class="card card-theme-success">Success theme</div>
<div class="card card-theme-warning">Warning theme</div>
<div class="card card-theme-error">Error theme</div>
```

### Form Components

```html
<!-- Form container -->
<div class="form-container">
  <div class="form-header">
    <h2>Form Title</h2>
    <p>Form description</p>
  </div>
  
  <div class="form-group">
    <label class="form-label">Input Label</label>
    <input type="text" class="form-input" placeholder="Enter text">
    <div class="help-text">Help text goes here</div>
  </div>
  
  <div class="form-group">
    <label class="form-label">Select Label</label>
    <select class="form-select">
      <option>Option 1</option>
      <option>Option 2</option>
    </select>
  </div>
  
  <div class="form-actions">
    <button class="btn btn-primary">Submit</button>
    <button class="btn btn-secondary">Cancel</button>
  </div>
</div>

<!-- Form inputs -->
<input type="text" class="form-input input-sm">Small input
<input type="text" class="form-input input-lg">Large input
<input type="text" class="form-input input-full">Full width input
<input type="text" class="form-input input-half">Half width input

<!-- Form validation states -->
<div class="form-group has-error">
  <input type="text" class="form-input">
  <div class="error-message">Error message</div>
</div>

<div class="form-group is-valid">
  <input type="text" class="form-input">
</div>
```

### Loading Components

```html
<!-- Basic loading -->
<app-loading [config]="{ type: 'spinner', size: 'md' }"></app-loading>

<!-- Loading with text -->
<app-loading [config]="{ type: 'spinner', size: 'md', text: 'Loading...' }"></app-loading>

<!-- Different loading types -->
<app-loading [config]="{ type: 'spinner', size: 'md' }"></app-loading>
<app-loading [config]="{ type: 'skeleton', size: 'md' }"></app-loading>
<app-loading [config]="{ type: 'dots', size: 'md' }"></app-loading>
<app-loading [config]="{ type: 'bars', size: 'md' }"></app-loading>
<app-loading [config]="{ type: 'pulse', size: 'md' }"></app-loading>

<!-- Different sizes -->
<app-loading [config]="{ type: 'spinner', size: 'sm' }"></app-loading>
<app-loading [config]="{ type: 'spinner', size: 'lg' }"></app-loading>
<app-loading [config]="{ type: 'spinner', size: 'xl' }"></app-loading>

<!-- Different colors -->
<app-loading [config]="{ type: 'spinner', size: 'md', color: 'primary' }"></app-loading>
<app-loading [config]="{ type: 'spinner', size: 'md', color: 'success' }"></app-loading>
<app-loading [config]="{ type: 'spinner', size: 'md', color: 'warning' }"></app-loading>
<app-loading [config]="{ type: 'spinner', size: 'md', color: 'error' }"></app-loading>

<!-- Overlay loading -->
<app-loading [config]="{ type: 'spinner', size: 'md', overlay: true }"></app-loading>
```

## Layout System

### Container System

```html
<div class="container container-sm">Small container</div>
<div class="container container-md">Medium container</div>
<div class="container container-lg">Large container</div>
<div class="container container-xl">Extra large container</div>
<div class="container container-2xl">2X large container</div>
<div class="container container-fluid">Full width container</div>
```

### Grid Layout

```html
<!-- Basic grid -->
<div class="grid">
  <div>Grid item 1</div>
  <div>Grid item 2</div>
  <div>Grid item 3</div>
</div>

<!-- Grid with specific columns -->
<div class="grid grid-cols-3">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>

<!-- Responsive grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <div>Responsive item 1</div>
  <div>Responsive item 2</div>
  <div>Responsive item 3</div>
</div>

<!-- Grid with gaps -->
<div class="grid grid-cols-3 gap-3">
  <div>Item with gap</div>
  <div>Item with gap</div>
  <div>Item with gap</div>
</div>
```

### Layout Templates

```html
<!-- Sidebar layout -->
<div class="grid grid-layout-sidebar">
  <aside class="sidebar">Sidebar content</aside>
  <main class="main">Main content</main>
</div>

<!-- Header layout -->
<div class="grid grid-layout-header">
  <header class="header">Header content</header>
  <main class="main">Main content</main>
  <footer class="footer">Footer content</footer>
</div>

<!-- Dashboard layout -->
<div class="grid grid-layout-dashboard">
  <aside class="sidebar">Sidebar</aside>
  <header class="header">Header</header>
  <main class="main">Main content</main>
</div>
```

## Theme System

### Theme Toggle

```html
<button class="theme-toggle" (click)="toggleTheme()">
  <span class="theme-icon light-icon">☀️</span>
  <span class="theme-icon dark-icon">🌙</span>
</button>
```

### Theme-aware Components

```html
<!-- Theme-aware card -->
<div class="card theme-aware">
  <div class="card-header">
    <h4 class="card-title">Theme-aware Card</h4>
  </div>
  <div class="card-body">
    <p class="card-content">Content that adapts to theme</p>
  </div>
</div>

<!-- Theme-aware form -->
<div class="form-container theme-aware">
  <input type="text" class="form-input" placeholder="Theme-aware input">
</div>

<!-- Theme-aware button -->
<button class="btn btn-ghost theme-aware">Theme-aware Button</button>
```

### JavaScript Theme Control

```typescript
// Set theme
document.documentElement.setAttribute('data-theme', 'dark');

// Get current theme
const currentTheme = document.documentElement.getAttribute('data-theme');

// Toggle theme
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
}
```

## SCSS Mixins

### Responsive Mixins

```scss
// Basic responsive mixin
@include respond-to(md) {
  .element {
    // Styles for medium screens and up
  }
}

// Custom breakpoint
@include respond-above(800px) {
  .element {
    // Styles above 800px
  }
}

@include respond-below(800px) {
  .element {
    // Styles below 800px
  }
}
```

### Component Mixins

```scss
// Button mixins
@include button-base;
@include button-variant($bg-color, $text-color);
@include button-size($padding-y, $padding-x, $font-size);

// Form mixins
@include form-input-base;
@include form-label;

// Card mixins
@include card-base;
@include card-elevated;

// Typography mixins
@include heading-style($size, $weight);
@include body-text($size, $weight);
```

## Performance Benefits

### CSS Custom Properties
- **Runtime Updates**: Theme changes without recompiling CSS
- **Cascading**: Inherit values through component hierarchy
- **Browser Optimization**: Modern browsers optimize CSS custom properties

### Utility Classes
- **Reduced CSS**: Eliminate duplicate styles
- **Faster Development**: Rapid prototyping with utility classes
- **Consistent Spacing**: Standardized spacing scale
- **Responsive Design**: Built-in responsive utilities

### Component Styles
- **Reusable**: Consistent component appearance
- **Maintainable**: Centralized styling logic
- **Scalable**: Easy to extend and modify

## Best Practices

### 1. Use Utility Classes for Layout
```html
<!-- Good -->
<div class="d-flex justify-between items-center p-3">
  <h1>Title</h1>
  <button class="btn btn-primary">Action</button>
</div>

<!-- Avoid -->
<div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem;">
  <h1>Title</h1>
  <button style="background: blue; color: white;">Action</button>
</div>
```

### 2. Combine Utilities with Components
```html
<!-- Good -->
<div class="card card-elevated m-3">
  <div class="card-header">
    <h3 class="card-title text-primary">Card Title</h3>
  </div>
</div>

<!-- Avoid -->
<div class="card" style="margin: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
  <div class="card-header">
    <h3 style="color: #1976d2;">Card Title</h3>
  </div>
</div>
```

### 3. Use Responsive Utilities
```html
<!-- Good -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <!-- Responsive grid -->
</div>

<!-- Avoid -->
<div class="grid" style="grid-template-columns: repeat(1, 1fr);">
  <!-- Fixed grid -->
</div>
```

### 4. Leverage Theme System
```html
<!-- Good -->
<div class="card theme-aware">
  <!-- Automatically adapts to theme -->
</div>

<!-- Avoid -->
<div class="card" style="background: white; color: black;">
  <!-- Hard-coded colors -->
</div>
```

## Browser Support

- **CSS Custom Properties**: IE11+ (with polyfill), Modern browsers
- **CSS Grid**: IE11+ (with polyfill), Modern browsers
- **Flexbox**: IE10+ (with polyfill), Modern browsers
- **CSS Variables**: IE11+ (with polyfill), Modern browsers

## Migration Guide

### From Old Styles
1. Replace hard-coded values with CSS custom properties
2. Convert inline styles to utility classes
3. Update component styles to use new mixins
4. Implement theme system for dynamic theming

### Example Migration
```scss
// Old
.calculator-container {
  margin: 1rem;
  padding: 1.5rem;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

// New
.calculator-container {
  @include card-elevated;
  margin: var(--spacing-md);
  padding: var(--spacing-lg);
}
```

## Conclusion

This SCSS utility system provides a robust foundation for building consistent, maintainable, and performant user interfaces. By leveraging CSS custom properties, utility classes, and component styles, developers can create beautiful applications faster while maintaining high code quality and consistency.

For questions or contributions, please refer to the project documentation or contact the development team.
