import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, RouterModule],
  template: `
    <div class="forgot-password-container">
      <mat-card class="forgot-password-card">
        <h2>Forgot Password</h2>
        <p>This feature is coming soon. Please contact your administrator for password reset.</p>
        <div class="actions">
          <button mat-raised-button color="primary" routerLink="/login">Back to Login</button>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .forgot-password-container {
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #e7e9f1;
    }
    
    .forgot-password-card {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 100%;
      max-width: 400px;
      padding: 2rem;
      text-align: center;
    }
    
    h2 {
      color: #333;
      margin-bottom: 1rem;
    }
    
    p {
      color: #666;
      margin-bottom: 2rem;
      line-height: 1.5;
    }
    
    .actions {
      margin-top: 1rem;
    }
  `]
})
export class ForgotPasswordComponent {}
