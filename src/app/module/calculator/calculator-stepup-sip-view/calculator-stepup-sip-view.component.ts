import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SharedModule } from '../../shared/shared.module';
import { PriceProgressBarComponent } from '../price-progress-bar/price-progress-bar.component';
import { MetaTagsService, CalculatorType } from '../../../services/meta-tags.service';
import { StructuredDataService } from '../../../services/structured-data.service';
import { Router } from '@angular/router';
import { LoaderService } from '../../../services/loading-bar/loader.service';

// Import shared utilities
import { CALCULATOR_CONSTANTS, CHART_COLORS, VALIDATION_MESSAGES } from '../shared/calculator.constants';
import { 
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
  selector: 'app-calculator-stepup-sip-view',
  standalone: true,
  imports: [SharedModule, PriceProgressBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calculator-stepup-sip-view.component.html',
  styleUrl: './calculator-stepup-sip-view.component.scss'
})
export class CalculatorStepupSipViewComponent implements OnInit {

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  // Injected services
  public loader = inject(LoaderService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private metaTagsService = inject(MetaTagsService);
  private structuredDataService = inject(StructuredDataService);
  private router = inject(Router);
  
  // Step Up SIP Calculator properties
  initialMonthlyInvestment: number = CALCULATOR_CONSTANTS.AMOUNTS.SIP_MIN;
  annualInterestRate: number = CALCULATOR_CONSTANTS.INTEREST_RATES.DEFAULT;
  investmentPeriod: number = CALCULATOR_CONSTANTS.TENURE.DEFAULT_SIP;
  stepUpPercentage: number = CALCULATOR_CONSTANTS.STEP_UP_SIP.DEFAULT_STEP_UP_PERCENTAGE;
  stepUpFrequency: 'YEARLY' | 'HALF_YEARLY' = 'YEARLY';

  // Results
  INVESTED_AMOUNT: number = 0;
  EST_RETURNS: number = 0;
  TOTAL_VALUE: number = 0;
  yearlyBreakdown: any[] = [];

  // Loading states
  loadingStates: LoadingStates = {
    isCalculating: false,
    isExporting: false,
    isLoading: false
  };

  // Validation errors
  validationErrors: ValidationErrors = {
    initialMonthlyInvestment: '',
    annualInterestRate: '',
    investmentPeriod: '',
    stepUpPercentage: ''
  };

  // Form controls
  initialMonthlyInvestmentForm = new FormControl<string>(this.formatInputValue(this.initialMonthlyInvestment));
  annualInterestRateForm = new FormControl<number>(this.annualInterestRate);
  investmentPeriodForm = new FormControl<number>(this.investmentPeriod);
  stepUpPercentageForm = new FormControl<number>(this.stepUpPercentage);

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
    this.updateMetaTags();
  }

  private updateMetaTags(): void {
    const currentUrl = `${window.location.origin}${this.router.url}`;
    
    // Update meta tags
    this.metaTagsService.updateMetaTags({
      title: 'Step Up SIP Calculator - Plan Growing Investments | Tech Trends Talks',
      description: 'Free Step Up SIP Calculator to calculate returns on systematic investment plans with annual increments. Plan your wealth creation with increasing SIP amounts.',
      keywords: 'step up sip calculator, sip with step up, increasing sip calculator, sip growth calculator, systematic investment plan calculator, mutual fund calculator, step up sip returns',
      ogTitle: 'Step Up SIP Calculator - Calculate Returns on Growing Investments',
      ogDescription: 'Calculate returns on Step Up SIP with our free online calculator. Plan your investments with annual increments and maximize your wealth creation.',
      ogUrl: currentUrl,
      ogImage: `${window.location.origin}/assets/images/calculator.png`,
      twitterCard: 'summary_large_image',
      twitterTitle: 'Step Up SIP Calculator - Plan Growing Investments',
      twitterDescription: 'Free Step Up SIP Calculator with detailed breakdown. Calculate returns on systematic investments with annual step-up feature.',
      twitterImage: `${window.location.origin}/assets/images/calculator.png`,
      canonicalUrl: currentUrl
    });
    
    // Add structured data
    const structuredData: StructuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      'name': 'Step Up SIP Calculator',
      'description': 'Calculate returns on Step Up SIP investments with annual increments',
      'url': currentUrl,
      'applicationCategory': 'FinanceApplication',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'INR'
      },
      'featureList': [
        'Step Up SIP Calculation',
        'Annual Increment Support',
        'Yearly Breakdown',
        'Excel and PDF Export',
        'Interactive Charts'
      ]
    };
    
    this.addAdditionalStructuredData('stepup-sip-calculator-structured-data', structuredData);
    
    // Add FAQ structured data
    const faqData = this.generateFAQStructuredData();
    this.addAdditionalStructuredData('stepup-sip-faq-structured-data', faqData);
  }

  private generateFAQStructuredData(): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'What is Step Up SIP?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Step Up SIP is a systematic investment plan where you increase your monthly investment amount at regular intervals (yearly or half-yearly). This helps you invest more as your income grows.'
          }
        },
        {
          '@type': 'Question',
          'name': 'How does Step Up SIP work?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'In Step Up SIP, you start with an initial monthly investment and increase it by a fixed percentage every year or half-year. For example, if you start with ₹5,000 and step up by 10% annually, your investment becomes ₹5,500 in year 2, ₹6,050 in year 3, and so on.'
          }
        },
        {
          '@type': 'Question',
          'name': 'What are the benefits of Step Up SIP?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Benefits include: Higher corpus accumulation, Aligns with salary increments, Better inflation hedging, Disciplined investing, Wealth maximization over long term.'
          }
        },
        {
          '@type': 'Question',
          'name': 'What is the minimum step-up percentage?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'You can choose any step-up percentage from 0% to 50%. A typical range is 5-15% annually, which aligns with average salary increments.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Can I change my Step Up SIP amount?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Yes, most mutual funds allow you to modify your Step Up SIP amount, frequency, or percentage with prior notice to the fund house.'
          }
        }
      ]
    };
  }

  private addAdditionalStructuredData(id: string, data: StructuredData): void {
    const existingScript = document.getElementById(id);
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  // Format input value for display
  formatInputValue(value: number): string {
    return NumberFormatter.formatInputValue(value);
  }

  // Parse number from comma-formatted string
  parseNumberFromCommas(value: string): number {
    return NumberFormatter.parseInputValue(value);
  }

  // Handle input blur events
  onInputBlur(inputType: string, event?: any): void {
    switch(inputType) {
      case 'initialMonthlyInvestment':
        const monthlyValue = this.parseNumberFromCommas(this.initialMonthlyInvestmentForm.value || '');
        this.initialMonthlyInvestmentForm.setValue(this.formatInputValue(monthlyValue));
        this.initialMonthlyInvestment = monthlyValue;
        this.validateInitialMonthlyInvestment();
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
      case 'stepUpPercentage':
        const stepUp = parseFloat(this.stepUpPercentageForm.value?.toString() || '0');
        this.stepUpPercentage = stepUp;
        this.validateStepUpPercentage();
        break;
    }
    this.changeDetectorRef.markForCheck();
  }

  // Handle input focus events
  onInputFocus(inputType: string, event?: any): void {
    switch(inputType) {
      case 'initialMonthlyInvestment':
        const monthlyValue = this.parseNumberFromCommas(this.initialMonthlyInvestmentForm.value || '');
        this.initialMonthlyInvestmentForm.setValue(monthlyValue.toString());
        break;
    }
  }

  initForm(): void {
    this.initialMonthlyInvestmentForm.valueChanges.subscribe((value: string | null) => {
      this.initialMonthlyInvestment = this.parseNumberFromCommas(value || '');
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

    this.stepUpPercentageForm.valueChanges.subscribe((value: number | null) => {
      this.stepUpPercentage = value || 0;
      this.changeDetectorRef.markForCheck();
    });
  }

  // Validation methods
  validateInitialMonthlyInvestment(): void {
    try {
      const min = CALCULATOR_CONSTANTS.AMOUNTS.SIP_MIN;
      const max = CALCULATOR_CONSTANTS.AMOUNTS.SIP_MAX;
      
      this.validationErrors['initialMonthlyInvestment'] = '';

      const sanitized = ValidationUtils.sanitizeValue(this.initialMonthlyInvestment, min, max, min);
      if (sanitized !== this.initialMonthlyInvestment) {
        this.initialMonthlyInvestment = sanitized;
        this.validationErrors['initialMonthlyInvestment'] = 
          this.initialMonthlyInvestment === min ? VALIDATION_MESSAGES.AMOUNT.MIN(min) : VALIDATION_MESSAGES.AMOUNT.MAX(max);
      }

      this.initialMonthlyInvestmentForm.setValue(this.formatInputValue(this.initialMonthlyInvestment));
      this.initialMonthlyInvestmentForm.updateValueAndValidity();
      this.changeDetectorRef.markForCheck();
      this.calculate();
    } catch (error) {
      console.error('Error validating initial monthly investment:', error);
      this.initialMonthlyInvestment = CALCULATOR_CONSTANTS.AMOUNTS.SIP_MIN;
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

  validateStepUpPercentage(): void {
    try {
      const min = CALCULATOR_CONSTANTS.STEP_UP_SIP.MIN_STEP_UP_PERCENTAGE;
      const max = CALCULATOR_CONSTANTS.STEP_UP_SIP.MAX_STEP_UP_PERCENTAGE;
      const defaultValue = CALCULATOR_CONSTANTS.STEP_UP_SIP.DEFAULT_STEP_UP_PERCENTAGE;
      
      this.validationErrors['stepUpPercentage'] = '';
      
      const sanitized = ValidationUtils.sanitizeValue(this.stepUpPercentage, min, max, defaultValue);
      if (sanitized !== this.stepUpPercentage) {
        this.stepUpPercentage = sanitized;
        this.validationErrors['stepUpPercentage'] = 
          this.stepUpPercentage === min ? `Minimum step-up is ${min}%` : `Maximum step-up is ${max}%`;
      }

      this.stepUpPercentageForm.setValue(this.stepUpPercentage);
      this.stepUpPercentageForm.updateValueAndValidity();
      this.changeDetectorRef.markForCheck();
      this.calculate();
    } catch (error) {
      console.error('Error validating step-up percentage:', error);
      this.stepUpPercentage = CALCULATOR_CONSTANTS.STEP_UP_SIP.DEFAULT_STEP_UP_PERCENTAGE;
    }
  }

  // Handle price progress bar changes
  priceProgressChange(value: number, mode: string): void {
    switch (mode) {
      case 'PRICE':
        this.initialMonthlyInvestment = value;
        this.initialMonthlyInvestmentForm.setValue(this.formatInputValue(value));
        break;
      case 'PERCENTAGE':
        this.annualInterestRate = value;
        this.annualInterestRateForm.setValue(value);
        break;
      case 'TENURE':
        this.investmentPeriod = value;
        this.investmentPeriodForm.setValue(value);
        break;
      case 'STEP_UP':
        this.stepUpPercentage = value;
        this.stepUpPercentageForm.setValue(value);
        break;
    }
    this.calculate();
  }

  // Format currency for display
  formatCurrency(value: number): string {
    return NumberFormatter.formatCurrencyAbbreviated(value);
  }

  // Main calculation method
  calculate(): void {
    this.calculateStepUpSIP();
  }

  calculateTotalStepUpSIPReturns(): void {
    this.loader.show();
    this.calculate();
    setTimeout(() => {
      this.loader.hide();
    }, 100);
  }

  calculateStepUpSIP(): void {
    try {
      this.loadingStates.isCalculating = true;
      
      const result = CalculationUtils.calculateStepUpSIP(
        this.initialMonthlyInvestment,
        this.annualInterestRate,
        this.investmentPeriod,
        this.stepUpPercentage,
        this.stepUpFrequency
      );

      this.INVESTED_AMOUNT = result.investedAmount;
      this.TOTAL_VALUE = result.totalValue;
      this.EST_RETURNS = result.estimatedReturns;
      this.yearlyBreakdown = result.yearlyBreakdown;

      // Update chart
      this.chartData.datasets[0].data = [this.INVESTED_AMOUNT, this.EST_RETURNS];
      this.chart?.update();
      
      this.changeDetectorRef.markForCheck();
    } catch (error) {
      console.error('Error calculating Step Up SIP:', error);
      this.INVESTED_AMOUNT = 0;
      this.TOTAL_VALUE = 0;
      this.EST_RETURNS = 0;
      this.yearlyBreakdown = [];
    } finally {
      this.loadingStates.isCalculating = false;
    }
  }

  // Toggle step-up frequency
  toggleFrequency(frequency: 'YEARLY' | 'HALF_YEARLY'): void {
    this.stepUpFrequency = frequency;
    this.calculate();
    this.changeDetectorRef.markForCheck();
  }

  // Download PDF report
  downloadPDF(): void {
    try {
      this.loadingStates.isExporting = true;
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Add title
      doc.setFontSize(20);
      doc.text('Step Up SIP Investment Report', pageWidth / 2, 20, { align: 'center' });
      
      // Add calculation details
      doc.setFontSize(12);
      doc.text(`Initial Monthly Investment: ₹${this.formatCurrency(this.initialMonthlyInvestment)}`, 20, 40);
      doc.text(`Annual Interest Rate: ${this.annualInterestRate}%`, 20, 50);
      doc.text(`Investment Period: ${this.investmentPeriod} years`, 20, 60);
      doc.text(`Step Up Percentage: ${this.stepUpPercentage}% ${this.stepUpFrequency}`, 20, 70);
      
      // Add results
      doc.setFontSize(14);
      doc.text('Investment Results:', 20, 90);
      doc.setFontSize(12);
      doc.text(`Total Invested: ₹${this.formatCurrency(this.INVESTED_AMOUNT)}`, 20, 100);
      doc.text(`Estimated Returns: ₹${this.formatCurrency(this.EST_RETURNS)}`, 20, 110);
      doc.text(`Total Value: ₹${this.formatCurrency(this.TOTAL_VALUE)}`, 20, 120);
      
      // Add yearly breakdown table
      if (this.yearlyBreakdown.length > 0) {
        const tableData = this.yearlyBreakdown.map(item => [
          `Year ${item.year}`,
          `₹${this.formatCurrency(item.monthlyInvestment)}`,
          `₹${this.formatCurrency(item.cumulativeInvestment)}`,
          `₹${this.formatCurrency(item.cumulativeValue)}`
        ]);

        (autoTable as any)(doc, {
          startY: 140,
          head: [['Year', 'Monthly SIP', 'Total Invested', 'Total Value']],
          body: tableData,
        });
      }
      
      // Add footer
      doc.setFontSize(10);
      doc.text('Generated by Tech Trends Talks Step Up SIP Calculator', pageWidth / 2, 280, { align: 'center' });
      
      // Save the PDF
      const filename = ExportUtils.generateTimestampedFilename(
        CALCULATOR_CONSTANTS.EXPORT.FILE_NAMES.STEP_UP_SIP_PDF, 
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

  // Download Excel report
  downloadExcel(): void {
    try {
      this.loadingStates.isExporting = true;
      
      const summaryData = [{
        'Initial Monthly Investment': this.initialMonthlyInvestment,
        'Annual Interest Rate': this.annualInterestRate + '%',
        'Investment Period': this.investmentPeriod + ' years',
        'Step Up Percentage': this.stepUpPercentage + '% ' + this.stepUpFrequency,
        'Total Invested': this.INVESTED_AMOUNT,
        'Estimated Returns': this.EST_RETURNS,
        'Total Value': this.TOTAL_VALUE
      }];

      const yearlyData = this.yearlyBreakdown.map(item => ({
        'Year': item.year,
        'Monthly SIP Amount': item.monthlyInvestment,
        'Yearly Investment': item.yearlyInvestment,
        'Cumulative Investment': item.cumulativeInvestment,
        'Cumulative Value': item.cumulativeValue
      }));
      
      const workbook = XLSX.utils.book_new();
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      const yearlySheet = XLSX.utils.json_to_sheet(yearlyData);
      
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
      XLSX.utils.book_append_sheet(workbook, yearlySheet, 'Yearly Breakdown');
      
      // Save the Excel file
      const filename = ExportUtils.generateTimestampedFilename(
        CALCULATOR_CONSTANTS.EXPORT.FILE_NAMES.STEP_UP_SIP_EXCEL, 
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
}

