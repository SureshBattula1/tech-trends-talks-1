import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { GradeCalculatorRoutingModule } from './grade-calculator-routing.module';
import { GradeCalculatorComponent } from './grade-calculator/grade-calculator.component';
import { GradeSummaryComponent } from './grade-summary/grade-summary.component';

@NgModule({
  declarations: [
    GradeCalculatorComponent,
    GradeSummaryComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    GradeCalculatorRoutingModule
  ]
})
export class GradeCalculatorModule { }
