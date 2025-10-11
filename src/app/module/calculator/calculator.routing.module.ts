import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComponentSidenavComponent } from '../../core/component-sidenav/component-sidenav.component';
import { CalculatorViewComponent } from './calculator-view/calculator-view.component';
import { CalculatorSipViewComponent } from './calculator-sip-view/calculator-sip-view.component';
import { CalculatorStepupSipViewComponent } from './calculator-stepup-sip-view/calculator-stepup-sip-view.component';
import { GradeCalculatorComponent } from './grade-calculator/grade-calculator.component';

const routes: Routes = [
  { 
    path: '', component: ComponentSidenavComponent, children: [
      { path: 'emi-calculator', component: CalculatorViewComponent, data: { breadcrumb: 'EMI Calculator' } },
      { path: 'sip-calculator', component: CalculatorSipViewComponent, data: { breadcrumb: 'SIP Calculator' } },
      { path: 'step-up-sip-calculator', component: CalculatorStepupSipViewComponent, data: { breadcrumb: 'Step Up SIP Calculator' } },
      { path: 'grade-calculator', component: GradeCalculatorComponent, data: { breadcrumb: 'Grade Calculator' } },
      { path: '', redirectTo: 'emi-calculator', pathMatch: 'full', data: { breadcrumb: 'EMI Calculator' } },
    ], data: { breadcrumb: 'Calculator' }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CalculatorRoutingModule { }