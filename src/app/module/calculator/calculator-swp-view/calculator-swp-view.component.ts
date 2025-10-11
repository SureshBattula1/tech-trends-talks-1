import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { SharedModule } from '../../shared/shared.module';
import { PriceProgressBarComponent } from '../price-progress-bar/price-progress-bar.component';
import { MetaTagsService, CalculatorType } from '../../../services/meta-tags.service';
import { StructuredDataService } from '../../../services/structured-data.service';
import { Router } from '@angular/router';
import { LoaderService } from '../../../services/loading-bar/loader.service';

// Import shared utilities
import { CALCULATOR_CONSTANTS, CHART_COLORS, VALIDATION_MESSAGES } from '../shared/calculator.constants';
import { 
  LoadingStates,
  ValidationErrors,
  StructuredData,
  SWPCalculationResult
} from '../shared/calculator.interfaces';
import { 
  NumberFormatter, 
  ValidationUtils, 
  CalculationUtils, 
  ExportUtils 
} from '../shared/calculator.utils';

@Component({
  selector: 'app-calculator-swp-view',
  standalone: true,
  imports: [SharedModule, PriceProgressBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calculator-swp-view.component.html',
  styleUrl: './calculator-swp-view.component.scss'
})
export class CalculatorSwpViewComponent implements OnInit {

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  // Injected services
  public loader = inject(LoaderService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private metaTagsService = inject(MetaTagsService);
  private structuredDataService = inject(StructuredDataService);
  private router = inject(Router);
  
  // SWP Calculator properties
  initialInvestment: number = 1000000; // 10 Lakhs default
  monthlyWithdrawal: number = 10000;
  annualInterestRate: number = CALCULATOR_CONSTANTS.INTEREST_RATES.DEFAULT;
  withdrawalPeriod: number = 20; // 20 years default

  // Results
  INITIAL_INVESTMENT: number = 0;
  TOTAL_WITHDRAWN: number = 0;
  REMAINING_VALUE: number = 0;
  TOTAL_RETURNS: number = 0;
  withdrawalStatus: 'sufficient' | 'exhausted' | 'warning' = 'sufficient';

  // Loading states
  loadingStates: LoadingStates = {
    isCalculating: false,
    isExporting: false,
    isLoading: false
  };

  // Validation errors
  validationErrors: ValidationErrors = {
    initialInvestment: '',
    monthlyWithdrawal: '',
    annualInterestRate: '',
    withdrawalPeriod: ''
  };

  // Form controls - using string type to support comma formatting
  initialInvestmentForm = new FormControl<string>(this.formatInputValue(this.initialInvestment));
  monthlyWithdrawalForm = new FormControl<string>(this.formatInputValue(this.monthlyWithdrawal));
  annualInterestRateForm = new FormControl<number>(this.annualInterestRate);
  withdrawalPeriodForm = new FormControl<number>(this.withdrawalPeriod);

  // Chart properties
  chartType: ChartType = 'doughnut';
  chartData: ChartConfiguration['data'] = {
    labels: ['Total Withdrawn', 'Remaining Value'],
    datasets: [{
      data: [0, 0],
      backgroundColor: [CHART_COLORS.INVESTED, CHART_COLORS.RETURNS],
    }]
  };

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      }
    }
  };

  ngOnInit(): void {
    this.initForm();
    this.calculate();
    
    // Update meta tags for SWP calculator
    this.updateMetaTags();
  }

  private updateMetaTags(): void {
    const currentUrl = `${window.location.origin}${this.router.url}`;
    const calculatorType: CalculatorType = 'swp-calculator';
    const metaTags = this.metaTagsService.generateCalculatorMetaTags(calculatorType, currentUrl);
    this.metaTagsService.updateMetaTags(metaTags);
    
    // Add main structured data
    const structuredData = this.structuredDataService.generateCalculatorStructuredData(calculatorType, currentUrl);
    this.structuredDataService.addStructuredData(structuredData);
    
    // Add SWP-specific FAQ structured data
    const faqData = this.structuredDataService.generateFAQStructuredData(calculatorType);
    this.addAdditionalStructuredData('swp-faq-structured-data', faqData);
  }

  // Helper method to add additional structured data without conflicts
  private addAdditionalStructuredData(id: string, data: StructuredData): void {
    // Remove existing script with same ID
    const existingScript = document.getElementById(id);
    if (existingScript) {
      existingScript.remove();
    }

    // Create new script element
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  // Format input value for display using shared utility
  formatInputValue(value: number): string {
    return NumberFormatter.formatInputValue(value);
  }

  // Parse number from comma-formatted string using shared utility
  parseNumberFromCommas(value: string): number {
    return NumberFormatter.parseInputValue(value);
  }

  // Handle input blur events to format numbers
  onInputBlur(inputType: string): void {
    switch(inputType) {
      case 'initialInvestment':
        const initialValue = this.parseNumberFromCommas(this.initialInvestmentForm.value || '');
        this.initialInvestmentForm.setValue(this.formatInputValue(initialValue));
        this.initialInvestment = initialValue;
        this.validateInitialInvestment();
        break;
      case 'monthlyWithdrawal':
        const withdrawalValue = this.parseNumberFromCommas(this.monthlyWithdrawalForm.value || '');
        this.monthlyWithdrawalForm.setValue(this.formatInputValue(withdrawalValue));
        this.monthlyWithdrawal = withdrawalValue;
        this.validateMonthlyWithdrawal();
        break;
      case 'annualInterestRate':
        const annualRate = parseFloat(this.annualInterestRateForm.value?.toString() || '0');
        this.annualInterestRate = annualRate;
        this.validateAnnualInterestRate();
        break;
      case 'withdrawalPeriod':
        const period = parseFloat(this.withdrawalPeriodForm.value?.toString() || '0');
        this.withdrawalPeriod = period;
        this.validateWithdrawalPeriod();
        break;
    }
    this.changeDetectorRef.markForCheck();
  }

  // Handle input focus events to remove commas for editing
  onInputFocus(inputType: string): void {
    switch(inputType) {
      case 'initialInvestment':
        const initialValue = this.parseNumberFromCommas(this.initialInvestmentForm.value || '');
        this.initialInvestmentForm.setValue(initialValue.toString());
        break;
      case 'monthlyWithdrawal':
        const withdrawalValue = this.parseNumberFromCommas(this.monthlyWithdrawalForm.value || '');
        this.monthlyWithdrawalForm.setValue(withdrawalValue.toString());
        break;
      case 'annualInterestRate':
        const annualRate = this.annualInterestRateForm.value;
        this.annualInterestRateForm.setValue(annualRate || 0);
        break;
      case 'withdrawalPeriod':
        const period = this.withdrawalPeriodForm.value;
        this.withdrawalPeriodForm.setValue(period || 0);
        break;
    }
  }

  initForm(): void {
    // Form subscriptions
    this.initialInvestmentForm.valueChanges.subscribe((value: string | null) => {
      this.initialInvestment = this.parseNumberFromCommas(value || '');
      this.changeDetectorRef.markForCheck();
    });

    this.monthlyWithdrawalForm.valueChanges.subscribe((value: string | null) => {
      this.monthlyWithdrawal = this.parseNumberFromCommas(value || '');
      this.changeDetectorRef.markForCheck();
    });

    this.annualInterestRateForm.valueChanges.subscribe((value: number | null) => {
      this.annualInterestRate = value || 0;
      this.changeDetectorRef.markForCheck();
    });

    this.withdrawalPeriodForm.valueChanges.subscribe((value: number | null) => {
      this.withdrawalPeriod = value || 0;
      this.changeDetectorRef.markForCheck();
    });
  }

  // Validation methods
  validateInitialInvestment(): void {
    try {
      const min = CALCULATOR_CONSTANTS.AMOUNTS.SWP_INITIAL_MIN;
      const max = CALCULATOR_CONSTANTS.AMOUNTS.SWP_INITIAL_MAX;
      
      this.validationErrors['initialInvestment'] = '';

      const sanitized = ValidationUtils.sanitizeValue(this.initialInvestment, min, max, min);
      if (sanitized !== this.initialInvestment) {
        this.initialInvestment = sanitized;
        this.validationErrors['initialInvestment'] = 
          this.initialInvestment === min ? VALIDATION_MESSAGES.AMOUNT.MIN(min) : VALIDATION_MESSAGES.AMOUNT.MAX(max);
      }

      this.initialInvestmentForm.setValue(this.formatInputValue(this.initialInvestment));
      this.initialInvestmentForm.updateValueAndValidity();
      this.changeDetectorRef.markForCheck();
      this.calculate();
    } catch (error) {
      console.error('Error validating initial investment:', error);
      this.initialInvestment = CALCULATOR_CONSTANTS.AMOUNTS.SWP_INITIAL_MIN;
    }
  }

  validateMonthlyWithdrawal(): void {
    try {
      const min = CALCULATOR_CONSTANTS.AMOUNTS.SWP_WITHDRAWAL_MIN;
      const max = CALCULATOR_CONSTANTS.AMOUNTS.SWP_WITHDRAWAL_MAX;
      
      this.validationErrors['monthlyWithdrawal'] = '';
      
      const sanitized = ValidationUtils.sanitizeValue(this.monthlyWithdrawal, min, max, min);
      if (sanitized !== this.monthlyWithdrawal) {
        this.monthlyWithdrawal = sanitized;
        this.validationErrors['monthlyWithdrawal'] = 
          this.monthlyWithdrawal === min ? VALIDATION_MESSAGES.AMOUNT.MIN(min) : VALIDATION_MESSAGES.AMOUNT.MAX(max);
      }

      this.monthlyWithdrawalForm.setValue(this.formatInputValue(this.monthlyWithdrawal));
      this.monthlyWithdrawalForm.updateValueAndValidity();
      this.changeDetectorRef.markForCheck();
      this.calculate();
    } catch (error) {
      console.error('Error validating monthly withdrawal:', error);
      this.monthlyWithdrawal = CALCULATOR_CONSTANTS.AMOUNTS.SWP_WITHDRAWAL_MIN;
    }
  }

  validateWithdrawalPeriod(): void {
    try {
      const min = CALCULATOR_CONSTANTS.TENURE.MIN;
      const max = CALCULATOR_CONSTANTS.TENURE.MAX;
      
      this.validationErrors['withdrawalPeriod'] = '';
      
      const sanitized = ValidationUtils.sanitizeValue(this.withdrawalPeriod, min, max, min);
      if (sanitized !== this.withdrawalPeriod) {
        this.withdrawalPeriod = sanitized;
        this.validationErrors['withdrawalPeriod'] = 
          this.withdrawalPeriod === min ? VALIDATION_MESSAGES.TENURE.MIN(min) : VALIDATION_MESSAGES.TENURE.MAX(max);
      }

      this.withdrawalPeriodForm.setValue(this.withdrawalPeriod);
      this.withdrawalPeriodForm.updateValueAndValidity();
      this.changeDetectorRef.markForCheck();
      this.calculate();
    } catch (error) {
      console.error('Error validating withdrawal period:', error);
      this.withdrawalPeriod = CALCULATOR_CONSTANTS.TENURE.MIN;
    }
  }

  validateAnnualInterestRate(): void {
    try {
      const min = CALCULATOR_CONSTANTS.INTEREST_RATES.MIN;
      const max = CALCULATOR_CONSTANTS.INTEREST_RATES.MAX_SIP;
      const defaultValue = CALCULATOR_CONSTANTS.INTEREST_RATES.DEFAULT;
      
      this.validationErrors['annualInterestRate'] = '';
      
      const sanitized = ValidationUtils.sanitizeValue(this.annualInterestRate, min, max, defaultValue);
      if (sanitized !== this.annualInterestRate) {
        this.annualInterestRate = sanitized;
        this.validationErrors['annualInterestRate'] = 
          this.annualInterestRate === min ? VALIDATION_MESSAGES.INTEREST_RATE.MIN(min) : VALIDATION_MESSAGES.INTEREST_RATE.MAX(max);
      }

      this.annualInterestRateForm.setValue(this.annualInterestRate);
      this.annualInterestRateForm.updateValueAndValidity();
      this.changeDetectorRef.markForCheck();
      this.calculate();
    } catch (error) {
      console.error('Error validating interest rate:', error);
      this.annualInterestRate = CALCULATOR_CONSTANTS.INTEREST_RATES.DEFAULT;
    }
  }

  // Handle price progress bar changes
  priceProgressChange(value: number, mode: string): void {
    switch (mode) {
      case 'INITIAL_INVESTMENT':
        this.initialInvestment = value;
        this.initialInvestmentForm.setValue(this.formatInputValue(value));
        break;
      case 'MONTHLY_WITHDRAWAL':
        this.monthlyWithdrawal = value;
        this.monthlyWithdrawalForm.setValue(this.formatInputValue(value));
        break;
      case 'PERCENTAGE':
        this.annualInterestRate = value;
        this.annualInterestRateForm.setValue(value);
        break;
      case 'TENURE':
        this.withdrawalPeriod = value;
        this.withdrawalPeriodForm.setValue(value);
        break;
    }
    this.calculate();
  }

  // Format currency for display using shared utility
  formatCurrency(value: number): string {
    return NumberFormatter.formatCurrencyAbbreviated(value);
  }

  // Download PDF report with error handling
  downloadPDF(): void {
    try {
      this.loadingStates.isExporting = true;
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Add title
      doc.setFontSize(20);
      doc.text('SWP Investment Report', pageWidth / 2, 20, { align: 'center' });
      
      // Add calculation details
      doc.setFontSize(12);
      doc.text(`Initial Investment: ₹${this.formatCurrency(this.initialInvestment)}`, 20, 40);
      doc.text(`Monthly Withdrawal: ₹${this.formatCurrency(this.monthlyWithdrawal)}`, 20, 50);
      doc.text(`Annual Interest Rate: ${this.annualInterestRate}%`, 20, 60);
      doc.text(`Withdrawal Period: ${this.withdrawalPeriod} years`, 20, 70);
      
      // Add results
      doc.setFontSize(14);
      doc.text('Withdrawal Results:', 20, 90);
      doc.setFontSize(12);
      doc.text(`Initial Investment: ₹${this.formatCurrency(this.INITIAL_INVESTMENT)}`, 20, 100);
      doc.text(`Total Withdrawn: ₹${this.formatCurrency(this.TOTAL_WITHDRAWN)}`, 20, 110);
      doc.text(`Remaining Value: ₹${this.formatCurrency(this.REMAINING_VALUE)}`, 20, 120);
      doc.text(`Total Returns: ₹${this.formatCurrency(this.TOTAL_RETURNS)}`, 20, 130);
      doc.text(`Status: ${this.withdrawalStatus.toUpperCase()}`, 20, 140);
      
      // Add footer
      doc.setFontSize(10);
      doc.text('Generated by Tech Trends Talks SWP Calculator', pageWidth / 2, 280, { align: 'center' });
      
      // Save the PDF
      const filename = ExportUtils.generateTimestampedFilename(
        CALCULATOR_CONSTANTS.EXPORT.FILE_NAMES.SWP_PDF, 
        'pdf'
      );
      doc.save(filename);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      ExportUtils.showError('Failed to export to PDF. Please try again.');
    } finally {
      this.loadingStates.isExporting = false;
      this.changeDetectorRef.markForCheck();
    }
  }

  // Download Excel report with error handling
  downloadExcel(): void {
    try {
      this.loadingStates.isExporting = true;
      
      const worksheet = XLSX.utils.json_to_sheet([
        {
          'Initial Investment': this.initialInvestment,
          'Monthly Withdrawal': this.monthlyWithdrawal,
          'Annual Interest Rate': this.annualInterestRate + '%',
          'Withdrawal Period': this.withdrawalPeriod + ' years',
          'Total Withdrawn': this.TOTAL_WITHDRAWN,
          'Remaining Value': this.REMAINING_VALUE,
          'Total Returns': this.TOTAL_RETURNS,
          'Status': this.withdrawalStatus
        }
      ]);
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'SWP Report');
      
      // Save the Excel file
      const filename = ExportUtils.generateTimestampedFilename(
        CALCULATOR_CONSTANTS.EXPORT.FILE_NAMES.SWP_EXCEL, 
        'xlsx'
      );
      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      ExportUtils.showError('Failed to export to Excel. Please try again.');
    } finally {
      this.loadingStates.isExporting = false;
      this.changeDetectorRef.markForCheck();
    }
  }

  // Calculate button handler
  calculateTotalSWPReturns(): void {
    this.loader.show();
    this.calculate();
    setTimeout(() => {
      this.loader.hide();
    }, 100);
  }

  // Main calculation method
  calculate(): void {
    try {
      this.loadingStates.isCalculating = true;
      
      const result: SWPCalculationResult = CalculationUtils.calculateSWP(
        this.initialInvestment,
        this.monthlyWithdrawal,
        this.annualInterestRate,
        this.withdrawalPeriod
      );

      this.INITIAL_INVESTMENT = result.initialInvestment;
      this.TOTAL_WITHDRAWN = result.totalWithdrawn;
      this.REMAINING_VALUE = result.remainingValue;
      this.TOTAL_RETURNS = result.totalReturns;
      this.withdrawalStatus = result.status;

      // Update chart
      this.chartData.datasets[0].data = [this.TOTAL_WITHDRAWN, this.REMAINING_VALUE];
      this.chart?.update();
      
      this.changeDetectorRef.markForCheck();
    } catch (error) {
      console.error('Error calculating SWP:', error);
      this.INITIAL_INVESTMENT = 0;
      this.TOTAL_WITHDRAWN = 0;
      this.REMAINING_VALUE = 0;
      this.TOTAL_RETURNS = 0;
      this.withdrawalStatus = 'exhausted';
    } finally {
      this.loadingStates.isCalculating = false;
    }
  }
  
  // Get status message
  getStatusMessage(): string {
    switch (this.withdrawalStatus) {
      case 'sufficient':
        return 'Your corpus will last for the full withdrawal period!';
      case 'warning':
        return 'Warning: Your corpus may exhaust soon. Consider reducing withdrawals.';
      case 'exhausted':
        return 'Alert: Your corpus will be exhausted before the withdrawal period ends.';
      default:
        return '';
    }
  }

  // Get status color
  getStatusColor(): string {
    switch (this.withdrawalStatus) {
      case 'sufficient':
        return '#10b981'; // Green
      case 'warning':
        return '#f59e0b'; // Orange
      case 'exhausted':
        return '#ef4444'; // Red
      default:
        return '#6b7280'; // Gray
    }
  }
}

