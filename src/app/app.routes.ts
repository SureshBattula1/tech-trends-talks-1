import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: 'blogs', loadChildren: ()=> import('./module/blog/blog.module').then(m => m.BlogModule) },
    { path: '', redirectTo:'home', pathMatch: 'full' }
];
