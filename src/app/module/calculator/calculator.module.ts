import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { CalculatorRoutingModule } from './calculator.routing.module';
import { CalculatorViewComponent } from './calculator-view/calculator-view.component';
import { CalculatorStepupSipViewComponent } from './calculator-stepup-sip-view/calculator-stepup-sip-view.component';
import { PriceProgressBarComponent } from './price-progress-bar/price-progress-bar.component';
import { GradeCalculatorComponent } from './grade-calculator/grade-calculator.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CalculatorRoutingModule,
    SharedModule,
    // Import standalone components
    CalculatorViewComponent,
    CalculatorStepupSipViewComponent,
    PriceProgressBarComponent,
    GradeCalculatorComponent
  ]
})
export class CalculatorModule { }