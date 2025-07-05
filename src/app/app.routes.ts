import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: 'blogs', loadChildren: ()=> import('./module/blog/blog.module').then(m => m.BlogModule) },
    { path: 'calculator', loadChildren: ()=> import('./module/calculator/calculator.module').then(m => m.CalculatorModule) },
    { path: '', redirectTo:'calculator', pathMatch: 'full' }
];
