import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, CanDeactivate, CanMatch, Router, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from './auth.service';

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanMatch {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAuth();
  }

  canActivateChild(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAuth();
  }

  canMatch(): Observable<boolean> | Promise<boolean> | boolean {
    return this.authService.isAuthenticated();
  }

  private checkAuth(): Observable<boolean | UrlTree> {
    return this.authService.authState$.pipe(
      take(1),
      map(authState => {
        if (authState.isAuthenticated) {
          return true;
        } else {
          // Redirect to login page
          return this.router.createUrlTree(['/login']);
        }
      })
    );
  }
}
