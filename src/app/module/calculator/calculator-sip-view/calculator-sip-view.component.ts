import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SharedModule } from '../../shared/shared.module';
import { PriceProgressBarComponent } from '../price-progress-bar/price-progress-bar.component';
import { MetaTagsService, CalculatorType } from '../../../services/meta-tags.service';
import { StructuredDataService } from '../../../services/structured-data.service';
import { Router } from '@angular/router';
import { LoaderService } from '../../../services/loading-bar/loader.service';

// Import shared utilities
import { CALCULATOR_CONSTANTS, CHART_COLORS, VALIDATION_MESSAGES } from '../shared/calculator.constants';
import { 
  CalculatorMode, 
  ProgressBarMode, 
  SIPCalculationResult,
  StructuredData,
  ValidationErrors,
  LoadingStates
} from '../shared/calculator.interfaces';
import { 
  NumberFormatter, 
  ValidationUtils, 
  CalculationUtils, 
  ExportUtils 
} from '../shared/calculator.utils';

@Component({
  selector: 'app-calculator-sip-view',
  standalone: true,
  imports: [SharedModule, PriceProgressBarComponent],
   changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calculator-sip-view.component.html',
  styleUrl: './calculator-sip-view.component.scss'
})
export class CalculatorSipViewComponent implements OnInit{

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  // Injected services
  public loader = inject(LoaderService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private metaTagsService = inject(MetaTagsService);
  private structuredDataService = inject(StructuredDataService);
  private router = inject(Router);
  
  // Calculator mode toggle
  calculatorMode: CalculatorMode = 'SIP';
  
  // SIP Calculator properties
  monthlyInvestment: number = CALCULATOR_CONSTANTS.AMOUNTS.SIP_MIN;
  annualInterestRate: number = CALCULATOR_CONSTANTS.INTEREST_RATES.DEFAULT;
  investmentPeriod: number = CALCULATOR_CONSTANTS.TENURE.DEFAULT_SIP;

  // Lumpsum Calculator properties
  lumpsumAmount: number = CALCULATOR_CONSTANTS.AMOUNTS.LUMPSUM_MIN;
  lumpsumAnnualInterestRate: number = CALCULATOR_CONSTANTS.INTEREST_RATES.DEFAULT;
  lumpsumInvestmentPeriod: number = CALCULATOR_CONSTANTS.TENURE.DEFAULT_SIP;

  // Results
  INVESTED_AMOUNT: number = 0;
  EST_RETURNS: number = 0;
  TOTAL_VALUE: number = 0;

  // Loading states
  loadingStates: LoadingStates = {
    isCalculating: false,
    isExporting: false,
    isLoading: false
  };

  // Validation errors
  validationErrors: ValidationErrors = {
    monthlyInvestment: '',
    annualInterestRate: '',
    investmentPeriod: '',
    lumpsumAmount: '',
    lumpsumAnnualInterestRate: '',
    lumpsumInvestmentPeriod: ''
  };

  // Form controls - using string type to support comma formatting
  monthlyInvestmentForm = new FormControl<string>(this.formatInputValue(this.monthlyInvestment));
  annualInterestRateForm = new FormControl<number>(this.annualInterestRate);
  investmentPeriodForm = new FormControl<number>(this.investmentPeriod);
  
  lumpsumAmountForm = new FormControl<string>(this.formatInputValue(this.lumpsumAmount));
  lumpsumAnnualInterestRateForm = new FormControl<number>(this.lumpsumAnnualInterestRate);
  lumpsumInvestmentPeriodForm = new FormControl<number>(this.lumpsumInvestmentPeriod);

   // Chart properties
   chartType: ChartType = 'doughnut';
   chartData: ChartConfiguration['data'] = {
     labels: ['Invested', 'Est. Returns'],
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
    
    // Update meta tags for SIP calculator
    this.updateMetaTags();
  }

  private updateMetaTags(): void {
    const currentUrl = `${window.location.origin}${this.router.url}`;
    const calculatorType: CalculatorType = 'sip-calculator';
    const metaTags = this.metaTagsService.generateCalculatorMetaTags(calculatorType, currentUrl);
    this.metaTagsService.updateMetaTags(metaTags);
    
    // Add main structured data
    const structuredData = this.structuredDataService.generateCalculatorStructuredData(calculatorType, currentUrl);
    this.structuredDataService.addStructuredData(structuredData);
    
    // Add SIP-specific FAQ structured data
    const faqData = this.structuredDataService.generateFAQStructuredData(calculatorType);
    this.addAdditionalStructuredData('sip-faq-structured-data', faqData);
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

  // Toggle between SIP and Lumpsum modes
  toggleCalculatorMode(mode: CalculatorMode): void {
    this.calculatorMode = mode;
    this.calculate();
    this.changeDetectorRef.markForCheck();
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
      case 'monthlyInvestment':
        const monthlyValue = this.parseNumberFromCommas(this.monthlyInvestmentForm.value || '');
        this.monthlyInvestmentForm.setValue(this.formatInputValue(monthlyValue));
        this.monthlyInvestment = monthlyValue;
        this.validateMonthlyInvestment();
        break;
      case 'lumpsumAmount':
        const lumpsumValue = this.parseNumberFromCommas(this.lumpsumAmountForm.value || '');
        this.lumpsumAmountForm.setValue(this.formatInputValue(lumpsumValue));
        this.lumpsumAmount = lumpsumValue;
        this.validateLumpsumAmount();
        break;
      case 'annualInterestRate':
        const annualRate = parseFloat(this.annualInterestRateForm.value?.toString() || '0');
        this.annualInterestRate = annualRate;
        this.validateAnnualInterestRate();
        break;
      case 'investmentPeriod':
        const period = parseFloat(this.investmentPeriodForm.value?.toString() || '0');
        this.investmentPeriod = period;
        this.validateInvestmentPeriod();
        break;
      case 'lumpsumAnnualInterestRate':
        const lumpsumRate = parseFloat(this.lumpsumAnnualInterestRateForm.value?.toString() || '0');
        this.lumpsumAnnualInterestRate = lumpsumRate;
        this.validateLumpsumAnnualInterestRate();
        break;
      case 'lumpsumInvestmentPeriod':
        const lumpsumPeriod = parseFloat(this.lumpsumInvestmentPeriodForm.value?.toString() || '0');
        this.lumpsumInvestmentPeriod = lumpsumPeriod;
        this.validateLumpsumInvestmentPeriod();
        break;
    }
    this.changeDetectorRef.markForCheck();
  }

  // Handle input focus events to remove commas for editing
  onInputFocus(inputType: string): void {
    switch(inputType) {
      case 'monthlyInvestment':
        const monthlyValue = this.parseNumberFromCommas(this.monthlyInvestmentForm.value || '');
        this.monthlyInvestmentForm.setValue(monthlyValue.toString());
        break;
      case 'lumpsumAmount':
        const lumpsumValue = this.parseNumberFromCommas(this.lumpsumAmountForm.value || '');
        this.lumpsumAmountForm.setValue(lumpsumValue.toString());
        break;
      case 'annualInterestRate':
        const annualRate = this.annualInterestRateForm.value;
        this.annualInterestRateForm.setValue(annualRate || 0);
        break;
      case 'investmentPeriod':
        const period = this.investmentPeriodForm.value;
        this.investmentPeriodForm.setValue(period || 0);
        break;
      case 'lumpsumAnnualInterestRate':
        const lumpsumRate = this.lumpsumAnnualInterestRateForm.value;
        this.lumpsumAnnualInterestRateForm.setValue(lumpsumRate || 0);
        break;
      case 'lumpsumInvestmentPeriod':
        const lumpsumPeriod = this.lumpsumInvestmentPeriodForm.value;
        this.lumpsumInvestmentPeriodForm.setValue(lumpsumPeriod || 0);
        break;
    }
  }

  initForm(){
    // SIP form subscriptions
    this.monthlyInvestmentForm.valueChanges.subscribe((value: string | null) => {
       this.monthlyInvestment = this.parseNumberFromCommas(value || '');
       this.changeDetectorRef.markForCheck();
    });

    this.annualInterestRateForm.valueChanges.subscribe((value: number | null) => {
      this.annualInterestRate = value || 0;
      this.changeDetectorRef.markForCheck();
    });

    this.investmentPeriodForm.valueChanges.subscribe((value: number | null) => {
      this.investmentPeriod = value || 0;
      this.changeDetectorRef.markForCheck();
    });

    // Lumpsum form subscriptions
    this.lumpsumAmountForm.valueChanges.subscribe((value: string | null) => {
      this.lumpsumAmount = this.parseNumberFromCommas(value || '');
      this.changeDetectorRef.markForCheck();
    });

    this.lumpsumAnnualInterestRateForm.valueChanges.subscribe((value: number | null) => {
      this.lumpsumAnnualInterestRate = value || 0;
      this.changeDetectorRef.markForCheck();
    });

    this.lumpsumInvestmentPeriodForm.valueChanges.subscribe((value: number | null) => {
      this.lumpsumInvestmentPeriod = value || 0;
      this.changeDetectorRef.markForCheck();
    });
  }

  // SIP Validation methods
  validateMonthlyInvestment(): void {
    try {
      const min = CALCULATOR_CONSTANTS.AMOUNTS.SIP_MIN;
      const max = CALCULATOR_CONSTANTS.AMOUNTS.SIP_MAX;
      
      this.validationErrors['monthlyInvestment'] = '';

      const sanitized = ValidationUtils.sanitizeValue(this.monthlyInvestment, min, max, min);
      if (sanitized !== this.monthlyInvestment) {
        this.monthlyInvestment = sanitized;
        this.validationErrors['monthlyInvestment'] = 
          this.monthlyInvestment === min ? VALIDATION_MESSAGES.AMOUNT.MIN(min) : VALIDATION_MESSAGES.AMOUNT.MAX(max);
      }

      this.monthlyInvestmentForm.setValue(this.formatInputValue(this.monthlyInvestment));
      this.monthlyInvestmentForm.updateValueAndValidity();
      this.changeDetectorRef.markForCheck();
      this.calculate();
    } catch (error) {
      console.error('Error validating monthly investment:', error);
      this.monthlyInvestment = CALCULATOR_CONSTANTS.AMOUNTS.SIP_MIN;
    }
  }

  validateInvestmentPeriod(): void {
    try {
      const min = CALCULATOR_CONSTANTS.TENURE.MIN;
      const max = CALCULATOR_CONSTANTS.TENURE.MAX;
      
      this.validationErrors['investmentPeriod'] = '';
      
      const sanitized = ValidationUtils.sanitizeValue(this.investmentPeriod, min, max, min);
      if (sanitized !== this.investmentPeriod) {
        this.investmentPeriod = sanitized;
        this.validationErrors['investmentPeriod'] = 
          this.investmentPeriod === min ? VALIDATION_MESSAGES.TENURE.MIN(min) : VALIDATION_MESSAGES.TENURE.MAX(max);
      }

      this.investmentPeriodForm.setValue(this.investmentPeriod);
      this.investmentPeriodForm.updateValueAndValidity();
      this.changeDetectorRef.markForCheck();
      this.calculate();
    } catch (error) {
      console.error('Error validating investment period:', error);
      this.investmentPeriod = CALCULATOR_CONSTANTS.TENURE.MIN;
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

  // Lumpsum Validation methods
  validateLumpsumAmount(): void {
    try {
      const min = CALCULATOR_CONSTANTS.AMOUNTS.LUMPSUM_MIN;
      const max = CALCULATOR_CONSTANTS.AMOUNTS.LUMPSUM_MAX;
      
      this.validationErrors['lumpsumAmount'] = '';
      
      const sanitized = ValidationUtils.sanitizeValue(this.lumpsumAmount, min, max, min);
      if (sanitized !== this.lumpsumAmount) {
        this.lumpsumAmount = sanitized;
        this.validationErrors['lumpsumAmount'] = 
          this.lumpsumAmount === min ? VALIDATION_MESSAGES.AMOUNT.MIN(min) : VALIDATION_MESSAGES.AMOUNT.MAX(max);
      }

      this.lumpsumAmountForm.setValue(this.formatInputValue(this.lumpsumAmount));
      this.lumpsumAmountForm.updateValueAndValidity();
      this.changeDetectorRef.markForCheck();
      this.calculate();
    } catch (error) {
      console.error('Error validating lumpsum amount:', error);
      this.lumpsumAmount = CALCULATOR_CONSTANTS.AMOUNTS.LUMPSUM_MIN;
    }
  }

  validateLumpsumInvestmentPeriod(): void {
    try {
      const min = CALCULATOR_CONSTANTS.TENURE.MIN;
      const max = CALCULATOR_CONSTANTS.TENURE.MAX;
      
      this.validationErrors['lumpsumInvestmentPeriod'] = '';
      
      const sanitized = ValidationUtils.sanitizeValue(this.lumpsumInvestmentPeriod, min, max, min);
      if (sanitized !== this.lumpsumInvestmentPeriod) {
        this.lumpsumInvestmentPeriod = sanitized;
        this.validationErrors['lumpsumInvestmentPeriod'] = 
          this.lumpsumInvestmentPeriod === min ? VALIDATION_MESSAGES.TENURE.MIN(min) : VALIDATION_MESSAGES.TENURE.MAX(max);
      }

      this.lumpsumInvestmentPeriodForm.setValue(this.lumpsumInvestmentPeriod);
      this.lumpsumInvestmentPeriodForm.updateValueAndValidity();
      this.changeDetectorRef.markForCheck();
      this.calculate();
    } catch (error) {
      console.error('Error validating lumpsum investment period:', error);
      this.lumpsumInvestmentPeriod = CALCULATOR_CONSTANTS.TENURE.MIN;
    }
  }

  validateLumpsumAnnualInterestRate(): void {
    try {
      const min = CALCULATOR_CONSTANTS.INTEREST_RATES.MIN;
      const max = CALCULATOR_CONSTANTS.INTEREST_RATES.MAX_SIP;
      const defaultValue = CALCULATOR_CONSTANTS.INTEREST_RATES.DEFAULT;
      
      this.validationErrors['lumpsumAnnualInterestRate'] = '';
      
      const sanitized = ValidationUtils.sanitizeValue(this.lumpsumAnnualInterestRate, min, max, defaultValue);
      if (sanitized !== this.lumpsumAnnualInterestRate) {
        this.lumpsumAnnualInterestRate = sanitized;
        this.validationErrors['lumpsumAnnualInterestRate'] = 
          this.lumpsumAnnualInterestRate === min ? VALIDATION_MESSAGES.INTEREST_RATE.MIN(min) : VALIDATION_MESSAGES.INTEREST_RATE.MAX(max);
      }

      this.lumpsumAnnualInterestRateForm.setValue(this.lumpsumAnnualInterestRate);
      this.lumpsumAnnualInterestRateForm.updateValueAndValidity();
      this.changeDetectorRef.markForCheck();
      this.calculate();
    } catch (error) {
      console.error('Error validating lumpsum interest rate:', error);
      this.lumpsumAnnualInterestRate = CALCULATOR_CONSTANTS.INTEREST_RATES.DEFAULT;
    }
  }

  // Handle price progress bar changes
  priceProgressChange(value: number, mode: string): void {
    switch (mode) {
      case 'PRICE':
        this.monthlyInvestment = value;
        this.monthlyInvestmentForm.setValue(this.formatInputValue(value));
        break;
      case 'PERCENTAGE':
        this.annualInterestRate = value;
        this.annualInterestRateForm.setValue(value);
        break;
      case 'TENURE':
        this.investmentPeriod = value;
        this.investmentPeriodForm.setValue(value);
        break;
      case 'LUMPSUM_PRICE':
        this.lumpsumAmount = value;
        this.lumpsumAmountForm.setValue(this.formatInputValue(value));
        break;
      case 'LUMPSUM_PERCENTAGE':
        this.lumpsumAnnualInterestRate = value;
        this.lumpsumAnnualInterestRateForm.setValue(value);
        break;
      case 'LUMPSUM_TENURE':
        this.lumpsumInvestmentPeriod = value;
        this.lumpsumInvestmentPeriodForm.setValue(value);
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
      doc.text('SIP Investment Report', pageWidth / 2, 20, { align: 'center' });
      
      // Add calculation details
      doc.setFontSize(12);
      doc.text(`Investment Mode: ${this.calculatorMode}`, 20, 40);
      doc.text(`Monthly Investment: ₹${this.formatCurrency(this.monthlyInvestment)}`, 20, 50);
      doc.text(`Annual Interest Rate: ${this.annualInterestRate}%`, 20, 60);
      doc.text(`Investment Period: ${this.investmentPeriod} years`, 20, 70);
      
      // Add results
      doc.setFontSize(14);
      doc.text('Investment Results:', 20, 90);
      doc.setFontSize(12);
      doc.text(`Total Invested: ₹${this.formatCurrency(this.INVESTED_AMOUNT)}`, 20, 100);
      doc.text(`Estimated Returns: ₹${this.formatCurrency(this.EST_RETURNS)}`, 20, 110);
      doc.text(`Total Value: ₹${this.formatCurrency(this.TOTAL_VALUE)}`, 20, 120);
      
      // Add footer
      doc.setFontSize(10);
      doc.text('Generated by Tech Trends Talks SIP Calculator', pageWidth / 2, 280, { align: 'center' });
      
      // Save the PDF
      const filename = ExportUtils.generateTimestampedFilename(
        CALCULATOR_CONSTANTS.EXPORT.FILE_NAMES.SIP_PDF, 
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
          'Investment Mode': this.calculatorMode,
          'Monthly Investment': this.monthlyInvestment,
          'Annual Interest Rate': this.annualInterestRate + '%',
          'Investment Period': this.investmentPeriod + ' years',
          'Total Invested': this.INVESTED_AMOUNT,
          'Estimated Returns': this.EST_RETURNS,
          'Total Value': this.TOTAL_VALUE
        }
      ]);
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'SIP Report');
      
      // Save the Excel file
      const filename = ExportUtils.generateTimestampedFilename(
        CALCULATOR_CONSTANTS.EXPORT.FILE_NAMES.SIP_EXCEL, 
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

  // Main calculation method that routes to appropriate calculator
  calculate(): void {
    if (this.calculatorMode === 'SIP') {
      this.calculateSIP();
    } else {
      this.calculateLumpsum();
    }
  }

  calculateTotalSIPReturns(){
    this.loader.show();
    this.calculate();
    setTimeout(() => {
      this.loader.hide();
      }, 100);
  }

  calculateSIP(): void {
    try {
      this.loadingStates.isCalculating = true;
      
      const result = CalculationUtils.calculateSIP(
        this.monthlyInvestment,
        this.annualInterestRate,
        this.investmentPeriod
      );

      this.INVESTED_AMOUNT = result.investedAmount;
      this.TOTAL_VALUE = result.totalValue;
      this.EST_RETURNS = result.estimatedReturns;

      // Update chart
      this.chartData.datasets[0].data = [this.INVESTED_AMOUNT, this.EST_RETURNS];
      this.chart?.update();
      
      this.changeDetectorRef.markForCheck();
    } catch (error) {
      console.error('Error calculating SIP:', error);
      this.INVESTED_AMOUNT = 0;
      this.TOTAL_VALUE = 0;
      this.EST_RETURNS = 0;
    } finally {
      this.loadingStates.isCalculating = false;
    }
  }

  calculateLumpsum(): void {
    try {
      this.loadingStates.isCalculating = true;
      
      const result = CalculationUtils.calculateLumpsum(
        this.lumpsumAmount,
        this.lumpsumAnnualInterestRate,
        this.lumpsumInvestmentPeriod
      );

      this.INVESTED_AMOUNT = result.investedAmount;
      this.TOTAL_VALUE = result.totalValue;
      this.EST_RETURNS = result.estimatedReturns;

      // Update chart
      this.chartData.datasets[0].data = [this.INVESTED_AMOUNT, this.EST_RETURNS];
      this.chart?.update();
      
      this.changeDetectorRef.markForCheck();
    } catch (error) {
      console.error('Error calculating Lumpsum:', error);
      this.INVESTED_AMOUNT = 0;
      this.TOTAL_VALUE = 0;
      this.EST_RETURNS = 0;
    } finally {
      this.loadingStates.isCalculating = false;
    }
  }
  
}
