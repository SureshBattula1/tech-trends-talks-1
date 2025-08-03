import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EligibilityCheckerComponent } from './eligibility-checker.component';
import { ComponentSidenavComponent } from '../../core/component-sidenav/component-sidenav.component';

const routes: Routes = [
  {
     path: '', component: ComponentSidenavComponent, children: [
        { path: 'checker', component: EligibilityCheckerComponent, data: { breadcrumb: 'Checker' } },
        { path: '',  redirectTo: 'checker', pathMatch: 'full', data: { breadcrumb: 'Checker' }}
    ], data: { breadcrumb: 'Eligibility Checker' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EligibilityCheckerRoutingModule { }
