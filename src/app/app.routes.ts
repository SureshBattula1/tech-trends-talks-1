import { Routes } from '@angular/router';
import { PageNotFoundComponent } from './core/page-not-found/page-not-found.component';

export const routes: Routes = [
    { path: 'blogs', loadChildren: ()=> import('./module/blog/blog.module').then(m => m.BlogModule) },
    { path: 'calculator', loadChildren: ()=> import('./module/calculator/calculator.module').then(m => m.CalculatorModule) },
    { path: '', redirectTo:'calculator', pathMatch: 'full' },
    { path: '**', component: PageNotFoundComponent}
];
