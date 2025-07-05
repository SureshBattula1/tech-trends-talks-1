import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComponentSidenavComponent } from '../../core/component-sidenav/component-sidenav.component';
import { CalculatorViewComponent } from './calculator-view/calculator-view.component';

const routes: Routes = [
  { 
    path: '', component: ComponentSidenavComponent, children: [
      { path: 'loan-emi-calculator', component: CalculatorViewComponent },
      { path: '', redirectTo: 'loan-emi-calculator', pathMatch: 'full' },
    ]
  },
 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CalculatorRoutingModule { }