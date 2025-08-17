import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxEditorModule } from 'ngx-editor';
import { PriceProgressBarComponent } from '../calculator/price-progress-bar/price-progress-bar.component';
import { NgChartsModule } from 'ng2-charts';
import { RouterModule } from '@angular/router';
import { AdvancedSearchFilterComponent } from './components/advanced-search-filter/advanced-search-filter.component';


@NgModule({
  declarations: [
    // AdvancedSearchFilterComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    NgxEditorModule,
    NgChartsModule,
    RouterModule
  ],
  exports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    NgxEditorModule,
    NgChartsModule,
    RouterModule,
    // AdvancedSearchFilterComponent
  ]
})
export class SharedModule { }
