import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="unauthorized-container">
      <div class="unauthorized-content">
        <h1>403 - Access Denied</h1>
        <p>Sorry, you don't have permission to access this page.</p>
        <div class="actions">
          <button (click)="goBack()" class="btn btn-secondary">Go Back</button>
          <button (click)="goHome()" class="btn btn-primary">Go Home</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f5f5f5;
    }
    
    .unauthorized-content {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      max-width: 500px;
    }
    
    h1 {
      color: #d32f2f;
      margin-bottom: 1rem;
    }
    
    p {
      color: #666;
      margin-bottom: 2rem;
      font-size: 1.1rem;
    }
    
    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
    
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      transition: background-color 0.3s;
    }
    
    .btn-primary {
      background-color: #1976d2;
      color: white;
    }
    
    .btn-primary:hover {
      background-color: #1565c0;
    }
    
    .btn-secondary {
      background-color: #757575;
      color: white;
    }
    
    .btn-secondary:hover {
      background-color: #616161;
    }
  `]
})
export class UnauthorizedComponent {
  
  constructor(private router: Router) {}
  
  goBack(): void {
    window.history.back();
  }
  
  goHome(): void {
    this.router.navigate(['/']);
  }
}
