import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from './auth.service';

export interface RoleGuardData {
  roles: string[];
  redirectTo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate, CanActivateChild {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: any): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const requiredRoles = route.data?.['roles'] as string[];
    return this.checkRole(requiredRoles, route.data?.['redirectTo']);
  }

  canActivateChild(childRoute: any): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const requiredRoles = childRoute.data?.['roles'] as string[];
    return this.checkRole(requiredRoles, childRoute.data?.['redirectTo']);
  }

  private checkRole(requiredRoles: string[], redirectTo?: string): Observable<boolean | UrlTree> {
    return this.authService.authState$.pipe(
      take(1),
      map(authState => {
        if (!authState.isAuthenticated) {
          // Not authenticated, redirect to login
          return this.router.createUrlTree(['/login']);
        }

        if (!requiredRoles || requiredRoles.length === 0) {
          // No roles required, allow access
          return true;
        }

        // Check if user has any of the required roles
        const hasRequiredRole = requiredRoles.some(role => 
          this.authService.hasRole(role)
        );

        if (hasRequiredRole) {
          return true;
        } else {
          // User doesn't have required role
          if (redirectTo) {
            return this.router.createUrlTree([redirectTo]);
          } else {
            // Default redirect to unauthorized page
            return this.router.createUrlTree(['/unauthorized']);
          }
        }
      })
    );
  }
}
