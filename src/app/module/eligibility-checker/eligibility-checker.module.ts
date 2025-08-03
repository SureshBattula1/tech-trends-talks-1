import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { EligibilityCheckerComponent } from './eligibility-checker.component';
import { EligibilityCheckerRoutingModule } from './eligibility-checker-routing.module';

@NgModule({
  declarations: [
    EligibilityCheckerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule,
    EligibilityCheckerRoutingModule
  ]
})
export class EligibilityCheckerModule { }
