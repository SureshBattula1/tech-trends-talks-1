import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EligibilityCheckerComponent } from './eligibility-checker.component';
import { EligibilityCheckerRoutingModule } from './eligibility-checker-routing.module';

@NgModule({
  declarations: [
    EligibilityCheckerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    EligibilityCheckerRoutingModule
  ]
})
export class EligibilityCheckerModule { }
