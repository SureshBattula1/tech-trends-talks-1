import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EligibilityCheckerComponent } from './eligibility-checker.component';

const routes: Routes = [
  { path: '', component: EligibilityCheckerComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EligibilityCheckerRoutingModule { }
