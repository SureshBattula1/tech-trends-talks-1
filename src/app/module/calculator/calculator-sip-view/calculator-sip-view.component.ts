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
  
  monthlyInvestment: number = 10000;
  annualInterestRate: number = 12;
  investmentPeriod: number = 10;

  INVESTED_AMOUNT: number = 0;
  EST_RETURNS: number = 0;
  TOTAL_VALUE: number = 0;


  monthlyInvestmentForm = new FormControl(this.monthlyInvestment);
  annualInterestRateForm = new FormControl(this.annualInterestRate);
  investmentPeriodForm = new FormControl(this.investmentPeriod);

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
    this.calculateSIP();
  }

  initForm(){

    this.monthlyInvestmentForm.valueChanges.subscribe((value: any) => {
       this.monthlyInvestment = value;
       this.cd.markForCheck();
    });

    this.annualInterestRateForm.valueChanges.subscribe((value: any) => {
      this.annualInterestRate = value;
      this.cd.markForCheck();
    });

    this.investmentPeriodForm.valueChanges.subscribe((value: any) => {
      this.investmentPeriod = value;
      this.cd.markForCheck();
    });
  }

  validateMonthlyInvestment() {
    const min = 10000;
    const max = 1000000000;
    if (!this.monthlyInvestment || this.monthlyInvestment < min || this.monthlyInvestment > max) {
      this.monthlyInvestmentForm.setValue(min, { emitEvent: false });
      this.monthlyInvestmentForm.updateValueAndValidity();
      this.monthlyInvestment = min;
      this.cd.markForCheck();
    }
    this.calculateSIP();
  }

  validateInvestmentPeriod() {
    const min = 10;
    const max = 50;
    if (!this.investmentPeriod || this.investmentPeriod < min || this.investmentPeriod > max) {
      this.investmentPeriodForm.setValue(min, { emitEvent: false });
      this.investmentPeriodForm.updateValueAndValidity();
      this.investmentPeriod = min;
      this.cd.markForCheck();
    }
    this.calculateSIP();
  }

  validateAnnualInterestRate() {
    const min = 1;
    const max = 30;
    if (!this.annualInterestRate || this.annualInterestRate < min || this.annualInterestRate > max) {
      this.annualInterestRateForm.setValue(12 , { emitEvent: false });
      this.annualInterestRateForm.updateValueAndValidity();
      this.annualInterestRate = 12;
      this.cd.markForCheck();
    }
    this.calculateSIP();
  }

  priceProgressChange($event: any , modeType: string = ''){
    switch(modeType){
      case 'PRICE':
        this.monthlyInvestment = $event;
        this.monthlyInvestmentForm.setValue(this.monthlyInvestment, { emitEvent: false });
        this.cd.detectChanges();
        break;
      case 'PERCENTAGE':
          this.annualInterestRate = $event;
          this.annualInterestRateForm.setValue(this.annualInterestRate, { emitEvent: false });
          this.cd.detectChanges();
          break;
      case 'TENURE':
          this.investmentPeriod = $event;
          this.investmentPeriodForm.setValue(this.investmentPeriod, { emitEvent: false });
          this.cd.detectChanges();
          break;
      default:
    }

    this.calculateSIP();
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
  
}
