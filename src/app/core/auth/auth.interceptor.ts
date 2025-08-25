import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip token for login, register, and forgot-password endpoints
    if (this.shouldSkipToken(request.url)) {
      return next.handle(request);
    }

    // Add token to request
    const token = this.authService.getToken();
    if (token) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !this.isRefreshing) {
          // Token expired or invalid
          return this.handle401Error(request, next);
        }
        
        if (error.status === 403) {
          // Forbidden - user doesn't have permission
          this.router.navigate(['/unauthorized']);
        }
        
        return throwError(() => error);
      })
    );
  }

  private shouldSkipToken(url: string): boolean {
    const skipUrls = ['/login', '/register', '/refresh', '/forgot-password'];
    return skipUrls.some(skipUrl => url.includes(skipUrl));
  }

  private addToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (this.isRefreshing) {
      // If already refreshing, wait
      return next.handle(request);
    }

    this.isRefreshing = true;

    return this.authService.refreshToken().pipe(
      switchMap(() => {
        this.isRefreshing = false;
        const newToken = this.authService.getToken();
        if (newToken) {
          const newRequest = this.addToken(request, newToken);
          return next.handle(newRequest);
        } else {
          this.authService.logout();
          return throwError(() => new Error('Token refresh failed'));
        }
      }),
      catchError((error) => {
        this.isRefreshing = false;
        this.authService.logout();
        return throwError(() => error);
      })
    );
  }
}
