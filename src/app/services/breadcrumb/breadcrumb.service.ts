import { Injectable } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { filter, map, Observable } from "rxjs";

// breadcrumb.service.ts
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
}