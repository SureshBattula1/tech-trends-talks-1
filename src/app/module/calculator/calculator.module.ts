import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { CalculatorRoutingModule } from './calculator.routing.module';
import { CalculatorViewComponent } from './calculator-view/calculator-view.component';



@NgModule({
  declarations: [
    
  ],
  imports: [
    CommonModule,
    CalculatorRoutingModule,
    // SharedModule
  ]
})
export class CalculatorModule { }
