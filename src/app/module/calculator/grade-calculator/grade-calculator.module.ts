import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ComponentSidenavComponent } from '../../../core/component-sidenav/component-sidenav.component';
import { GradeCalculatorComponent } from './grade-calculator.component';

const routes: Routes = [
  {
    path: '',
    component: ComponentSidenavComponent,
    children: [
      {
        path: '',
        component: GradeCalculatorComponent,
        data: { breadcrumb: 'Grade Calculator' }
      }
    ],
    data: { breadcrumb: 'Grade Calculator' }
  }
];

@NgModule({
  declarations: [
    GradeCalculatorComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    GradeCalculatorComponent
  ]
})
export class GradeCalculatorModule { }
