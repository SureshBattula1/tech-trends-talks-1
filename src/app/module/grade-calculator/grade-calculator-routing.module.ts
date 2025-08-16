import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GradeCalculatorComponent } from './grade-calculator/grade-calculator.component';

const routes: Routes = [
  { path: '', component: GradeCalculatorComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GradeCalculatorRoutingModule { }
