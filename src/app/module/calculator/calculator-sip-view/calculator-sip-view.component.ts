import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SharedModule } from '../../shared/shared.module';
import { PriceProgressBarComponent } from '../price-progress-bar/price-progress-bar.component';

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

  private cd = inject(ChangeDetectorRef);
  
  // Calculator mode toggle
  calculatorMode: 'SIP' | 'LUMPSUM' = 'SIP';
  
  // SIP Calculator properties
  monthlyInvestment: number = 10000;
  annualInterestRate: number = 12;
  investmentPeriod: number = 10;

  // Lumpsum Calculator properties
  lumpsumAmount: number = 100000;
  lumpsumAnnualInterestRate: number = 12;
  lumpsumInvestmentPeriod: number = 10;

  // Results
  INVESTED_AMOUNT: number = 0;
  EST_RETURNS: number = 0;
  TOTAL_VALUE: number = 0;

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
       backgroundColor: ['#42A5F5','#5367ff'],
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
  }

  // Toggle between SIP and Lumpsum modes
  toggleCalculatorMode(mode: 'SIP' | 'LUMPSUM'): void {
    this.calculatorMode = mode;
    this.calculate();
    this.cd.markForCheck();
  }

  // Helper methods for comma formatting - Indian numbering system
  formatNumberWithCommas(value: number): string {
    const numStr = value.toString();
    const lastThree = numStr.substring(numStr.length - 3);
    const otherNumbers = numStr.substring(0, numStr.length - 3);
    
    if (otherNumbers !== '') {
      return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
    }
    return lastThree;
  }

  parseNumberFromCommas(value: string): number {
    return parseFloat(value.replace(/,/g, '')) || 0;
  }

  // Format input value for display
  formatInputValue(value: number): string {
    return this.formatNumberWithCommas(value);
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
    this.cd.markForCheck();
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
       this.cd.markForCheck();
    });

    this.annualInterestRateForm.valueChanges.subscribe((value: number | null) => {
      this.annualInterestRate = value || 0;
      this.cd.markForCheck();
    });

    this.investmentPeriodForm.valueChanges.subscribe((value: number | null) => {
      this.investmentPeriod = value || 0;
      this.cd.markForCheck();
    });

    // Lumpsum form subscriptions
    this.lumpsumAmountForm.valueChanges.subscribe((value: string | null) => {
      this.lumpsumAmount = this.parseNumberFromCommas(value || '');
      this.cd.markForCheck();
    });

    this.lumpsumAnnualInterestRateForm.valueChanges.subscribe((value: number | null) => {
      this.lumpsumAnnualInterestRate = value || 0;
      this.cd.markForCheck();
    });

    this.lumpsumInvestmentPeriodForm.valueChanges.subscribe((value: number | null) => {
      this.lumpsumInvestmentPeriod = value || 0;
      this.cd.markForCheck();
    });
  }

  // SIP Validation methods
  validateMonthlyInvestment() {
    const min = 100;
    const max = 1000000000;
    if (!this.monthlyInvestment || this.monthlyInvestment < min || this.monthlyInvestment > max) {
      this.monthlyInvestment = min;
      this.monthlyInvestmentForm.setValue(this.formatInputValue(min));
      this.monthlyInvestmentForm.updateValueAndValidity();
      this.cd.markForCheck();
    }
    this.calculate();
  }

  validateInvestmentPeriod() {
    const min = 1;
    const max = 50;
    if (!this.investmentPeriod || this.investmentPeriod < min || this.investmentPeriod > max) {
      this.investmentPeriod = min;
      this.investmentPeriodForm.setValue(min);
      this.investmentPeriodForm.updateValueAndValidity();
      this.cd.markForCheck();
    }
    this.calculate();
  }

  validateAnnualInterestRate() {
    const min = 1;
    const max = 30;
    if (!this.annualInterestRate || this.annualInterestRate < min || this.annualInterestRate > max) {
      this.annualInterestRate = 12;
      this.annualInterestRateForm.setValue(12);
      this.annualInterestRateForm.updateValueAndValidity();
      this.cd.markForCheck();
    }
    this.calculate();
  }

  // Lumpsum Validation methods
  validateLumpsumAmount() {
    const min = 1000;
    const max = 1000000000;
    if (!this.lumpsumAmount || this.lumpsumAmount < min || this.lumpsumAmount > max) {
      this.lumpsumAmount = min;
      this.lumpsumAmountForm.setValue(this.formatInputValue(min));
      this.lumpsumAmountForm.updateValueAndValidity();
      this.cd.markForCheck();
    }
    this.calculate();
  }

  validateLumpsumInvestmentPeriod() {
    const min = 1;
    const max = 50;
    if (!this.lumpsumInvestmentPeriod || this.lumpsumInvestmentPeriod < min || this.lumpsumInvestmentPeriod > max) {
      this.lumpsumInvestmentPeriod = min;
      this.lumpsumInvestmentPeriodForm.setValue(min);
      this.lumpsumInvestmentPeriodForm.updateValueAndValidity();
      this.cd.markForCheck();
    }
    this.calculate();
  }

  validateLumpsumAnnualInterestRate() {
    const min = 1;
    const max = 30;
    if (!this.lumpsumAnnualInterestRate || this.lumpsumAnnualInterestRate < min || this.lumpsumAnnualInterestRate > max) {
      this.lumpsumAnnualInterestRate = 12;
      this.lumpsumAnnualInterestRateForm.setValue(12);
      this.lumpsumAnnualInterestRateForm.updateValueAndValidity();
      this.cd.markForCheck();
    }
    this.calculate();
  }

  priceProgressChange($event: any , modeType: string = ''){
    switch(modeType){
      case 'PRICE':
        if (this.calculatorMode === 'SIP') {
          this.monthlyInvestment = $event;
          this.monthlyInvestmentForm.setValue(this.formatInputValue(this.monthlyInvestment));
        } else {
          this.lumpsumAmount = $event;
          this.lumpsumAmountForm.setValue(this.formatInputValue(this.lumpsumAmount));
        }
        this.cd.detectChanges();
        break;
      case 'PERCENTAGE':
        if (this.calculatorMode === 'SIP') {
          this.annualInterestRate = $event;
          this.annualInterestRateForm.setValue(this.annualInterestRate);
        } else {
          this.lumpsumAnnualInterestRate = $event;
          this.lumpsumAnnualInterestRateForm.setValue(this.lumpsumAnnualInterestRate);
        }
        this.cd.detectChanges();
        break;
      case 'TENURE':
        if (this.calculatorMode === 'SIP') {
          this.investmentPeriod = $event;
          this.investmentPeriodForm.setValue(this.investmentPeriod);
        } else {
          this.lumpsumInvestmentPeriod = $event;
          this.lumpsumInvestmentPeriodForm.setValue(this.lumpsumInvestmentPeriod);
        }
        this.cd.detectChanges();
        break;
      default:
    }

    this.calculate();
  }

  // Main calculation method that routes to appropriate calculator
  calculate(): void {
    if (this.calculatorMode === 'SIP') {
      this.calculateSIP();
    } else {
      this.calculateLumpsum();
    }
  }

  calculateSIP(): void {
    const P = this.monthlyInvestment;
    const r = this.annualInterestRate / 12 / 100;
    const n = this.investmentPeriod * 12;
  
    // Calculate Total Value (Future Value)
    const totalValue = P * (((Math.pow(1 + r, n) - 1) * (1 + r)) / r);
  
    // Calculate Invested Amount and Estimated Returns
    const investedAmount = P * n;
    const estReturns = totalValue - investedAmount;
  
    // Assign to class properties, rounded to 2 decimals
    this.INVESTED_AMOUNT = parseFloat(investedAmount.toFixed(2));
    this.TOTAL_VALUE = parseFloat(totalValue.toFixed(2));
    this.EST_RETURNS = parseFloat(estReturns.toFixed(2));

    // Update chart
    this.chartData.datasets[0].data = [this.INVESTED_AMOUNT, this.EST_RETURNS];
    this.chart?.update();
  }

  calculateLumpsum(): void {
    const P = this.lumpsumAmount;
    const r = this.lumpsumAnnualInterestRate / 100;
    const n = this.lumpsumInvestmentPeriod;
  
    // Calculate Total Value (Future Value) - Simple compound interest
    const totalValue = P * Math.pow(1 + r, n);
  
    // Calculate Invested Amount and Estimated Returns
    const investedAmount = P;
    const estReturns = totalValue - investedAmount;
  
    // Assign to class properties, rounded to 2 decimals
    this.INVESTED_AMOUNT = parseFloat(investedAmount.toFixed(2));
    this.TOTAL_VALUE = parseFloat(totalValue.toFixed(2));
    this.EST_RETURNS = parseFloat(estReturns.toFixed(2));

    // Update chart
    this.chartData.datasets[0].data = [this.INVESTED_AMOUNT, this.EST_RETURNS];
    this.chart?.update();
  }
  
}
