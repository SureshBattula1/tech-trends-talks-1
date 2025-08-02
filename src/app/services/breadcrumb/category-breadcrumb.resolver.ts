import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class CategoryBreadcrumbResolver implements Resolve<string> {
    resolve(route: ActivatedRouteSnapshot): string {
        return this.fromKebabToTitle(route.paramMap.get('categoryName') || 'List');
    }

    fromKebabToTitle(name: string): string {
        return name
        .split('-') 
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) 
        .join(' '); 
    }
}