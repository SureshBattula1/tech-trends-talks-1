import { Injectable } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { filter, map, Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  constructor(private router: Router) {}

  getBreadcrumbs(route: ActivatedRoute): Observable<Array<{ label: string, url: string }>> {
    return this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.buildBreadcrumbs(route.root))
    );
  }

  public buildBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: any[] = []): any[] {
    const children = route.children;
    if (!children.length) return breadcrumbs;

    for (const child of children) {
      const routeURL = child.snapshot.url.map(segment => segment.path).join('/');
      if (routeURL) url += `/${routeURL}`;
      const label = child.snapshot.data['breadcrumb'];
      if (label) breadcrumbs.push({ label, url });

      return this.buildBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }

  public shouldHideBreadcrumbs(route: ActivatedRoute): boolean {
    // Check route data by traversing the entire route tree
    const checkRouteData = (routeToCheck: ActivatedRoute): boolean => {
      // Check current route data
      if (routeToCheck.snapshot.data['hideBreadcrumb']) {
        return true;
      }
      
      // Check all children
      for (const child of routeToCheck.children) {
        if (checkRouteData(child)) {
          return true;
        }
      }
      return false;
    };

    // Start checking from root
    return checkRouteData(route.root);
  }
}