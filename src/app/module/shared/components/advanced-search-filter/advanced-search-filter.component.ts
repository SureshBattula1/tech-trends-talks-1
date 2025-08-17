import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Subject, debounceTime, takeUntil } from 'rxjs';

export interface SearchFilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'boolean';
  placeholder?: string;
  options?: { value: any; label: string }[];
  defaultValue?: any;
}

export interface SearchFilterConfig {
  fields: SearchFilterField[];
  showAdvanced?: boolean;
  debounceTime?: number;
}

@Component({
  selector: 'app-advanced-search-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './advanced-search-filter.component.html',
  styleUrls: ['./advanced-search-filter.component.scss']
})
export class AdvancedSearchFilterComponent implements OnInit, OnDestroy {
  @Input() config!: SearchFilterConfig;
  @Input() loading = false;
  @Output() searchChange = new EventEmitter<any>();
  @Output() filterChange = new EventEmitter<any>();

  searchForm!: FormGroup;
  showAdvanced = false;
  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setupFormListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize the search form with configured fields
   */
  private initializeForm(): void {
    const formGroup: any = {};
    
    this.config.fields.forEach(field => {
      formGroup[field.key] = [field.defaultValue || ''];
    });

    this.searchForm = this.fb.group(formGroup);
    this.showAdvanced = this.config.showAdvanced || false;
  }

  /**
   * Setup form listeners for real-time search
   */
  private setupFormListeners(): void {
    const debounceDelay = this.config.debounceTime || 300;
    
    this.searchForm.valueChanges
      .pipe(
        debounceTime(debounceDelay),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.onSearchChange(value);
      });
  }

  /**
   * Handle search form changes
   */
  private onSearchChange(value: any): void {
    const filters = this.buildFilters(value);
    this.searchChange.emit(filters);
  }

  /**
   * Build filters object from form values
   */
  private buildFilters(formValue: any): any {
    const filters: any = {};
    
    Object.keys(formValue).forEach(key => {
      const value = formValue[key];
      if (value !== null && value !== undefined && value !== '') {
        filters[key] = value;
      }
    });

    return filters;
  }

  /**
   * Toggle advanced search visibility
   */
  toggleAdvanced(): void {
    this.showAdvanced = !this.showAdvanced;
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.searchForm.reset();
    this.searchChange.emit({});
  }

  /**
   * Apply filters manually
   */
  applyFilters(): void {
    const filters = this.buildFilters(this.searchForm.value);
    this.filterChange.emit(filters);
  }

  /**
   * Check if form has any values
   */
  hasFilters(): boolean {
    const formValue = this.searchForm.value;
    return Object.values(formValue).some(value => 
      value !== null && value !== undefined && value !== ''
    );
  }

  /**
   * Get field options for select fields
   */
  getFieldOptions(field: SearchFilterField): { value: any; label: string }[] {
    return field.options || [];
  }

  /**
   * Track field by key for ngFor optimization
   */
  trackByKey(index: number, field: SearchFilterField): string {
    return field.key;
  }

  /**
   * Remove a specific filter
   */
  removeFilter(fieldKey: string): void {
    this.searchForm.get(fieldKey)?.setValue('');
  }
}
