import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { User, LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, AuthState } from './auth.interfaces';
import { EnvironmentService } from '../../services/environment.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {  
  
  private readonly baseUrl:any = 'http://127.0.0.1:8000/api/v1';
  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'auth_user';

  private authStateSubject = new BehaviorSubject<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false
  });

  public authState$ = this.authStateSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private environmentService: EnvironmentService,
  ) {
    this.initializeAuth();
    this.baseUrl = `${this.environmentService.apiUrl}/${this.environmentService.apiVersion}`;
  }

  private initializeAuth(): void {
    const token = this.getStoredToken();
    const user = this.getStoredUser();
    
    if (token && user) {
      this.authStateSubject.next({
        user,
        token,
        isAuthenticated: true,
        isLoading: false
      });
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.setLoading(true);
    
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.success) {
          this.handleSuccessfulLogin(response);
        }
      }),
      catchError(error => {
        this.setLoading(false);
        return throwError(() => error);
      })
    );
  }

  register(userData: RegisterRequest): Observable<RegisterResponse> {
    this.setLoading(true);
    
    // Set default role to 'user' if not provided
    const registrationData = {
      ...userData,
      role: userData.role || 'user'
    };
    
    return this.http.post<RegisterResponse>(`${this.baseUrl}/register`, registrationData).pipe(
      tap(response => {
        this.setLoading(false);
        if (response.success && response.data) {
          // Auto-login after successful registration
          this.handleSuccessfulLogin(response as LoginResponse);
        }
      }),
      catchError(error => {
        this.setLoading(false);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    // Clear stored data
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    
    // Update state
    this.authStateSubject.next({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false
    });
    
    // Navigate to login
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<any> {
    return this.http.post(`${this.baseUrl}/refresh`, {}).pipe(
      tap(response => {
        // Handle token refresh logic here
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  hasRole(role: string): boolean {
    const user = this.authStateSubject.value.user;
    return user ? user.role === role : false;
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  getCurrentUser(): User | null {
    return this.authStateSubject.value.user;
  }

  getToken(): string | null {
    return this.authStateSubject.value.token;
  }

  private handleSuccessfulLogin(response: LoginResponse): void {
    const { user, access_token } = response.data;
    
    // Store data
    this.storeToken(access_token);
    this.storeUser(user);
    
    // Update state
    this.authStateSubject.next({
      user,
      token: access_token,
      isAuthenticated: true,
      isLoading: false
    });
  }

  private storeToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private storeUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private getStoredUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  private setLoading(isLoading: boolean): void {
    const currentState = this.authStateSubject.value;
    this.authStateSubject.next({
      ...currentState,
      isLoading
    });
  }
}
