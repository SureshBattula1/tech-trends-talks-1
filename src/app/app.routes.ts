import { Routes } from '@angular/router';
import { PageNotFoundComponent } from './core/page-not-found/page-not-found.component';
import { LoginComponent } from './core/login/login.component';
import { RegisterComponent } from './core/register/register.component';
import { UnauthorizedComponent } from './core/unauthorized/unauthorized.component';
import { ForgotPasswordComponent } from './core/forgot-password/forgot-password.component';
import { AuthGuard } from './core/auth/auth.guard';
import { RoleGuard } from './core/auth/role.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'unauthorized', component: UnauthorizedComponent },
    { 
        path: 'blogs', 
        loadChildren: ()=> import('./module/blog/blog.module').then(m => m.BlogModule),
        canActivate: [AuthGuard]
    },
    { 
        path: 'blogs-admin', 
        loadChildren: ()=> import('./module/blog-admin/blog-admin.module').then(m => m.BlogAdminModule),
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['admin', 'user'] }
    },
    { 
        path: 'calculator', 
        loadChildren: ()=> import('./module/calculator/calculator.module').then(m => m.CalculatorModule) 
    },
    { 
        path: 'loan-eligibility-calculator', 
        loadChildren: () => import('./module/eligibility-checker/eligibility-checker.module').then(m => m.EligibilityCheckerModule) 
    },
    { 
        path: 'grade-calculator', 
        loadChildren: () => import('./module/grade-calculator/grade-calculator.module').then(m => m.GradeCalculatorModule) 
    },
    { path: '', redirectTo:'calculator', pathMatch: 'full' },
    { path: '**', component: PageNotFoundComponent}
];
