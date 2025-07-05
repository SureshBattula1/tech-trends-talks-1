import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SharedModule } from '../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule } from '@angular/forms';
import { PriceProgressBarComponent } from '../price-progress-bar/price-progress-bar.component';
import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-calculator-view',
  standalone: true,
  imports: [ SharedModule, PriceProgressBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calculator-view.component.html',
  styleUrl: './calculator-view.component.scss'
})
export class CalculatorViewComponent implements OnInit{

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  
  readonly panelOpenState = signal(false);


  amount = 10000;
  interestRate = 8;
  years = 2;
  emi = 0;
  totalInterest = 0;
  totalPayment = 0;
  pricipalAmount = 0;
  schedule: any[] = [];
  scheduleYears:any[] = [];

  // Chart properties
  chartType: ChartType = 'doughnut';
  chartData: ChartConfiguration['data'] = {
    labels: ['Principal', 'Interest'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#42A5F5', '#FF6384'],
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

  amountForm = new FormControl(this.amount);
  interestForm = new FormControl(this.interestRate);
  yearsForm = new FormControl(this.years);

  public cd = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.initForm();
    this.calculateEMI();
  }

  initForm(){
    this.amountForm.valueChanges.subscribe(
      (value: any) =>  {
        this.amount = value;
        this.cd.markForCheck();
      }
    );

    this.interestForm.valueChanges.subscribe(
      (value: any) =>  {
        this.interestRate = value;
        this.cd.markForCheck();
      }
    );

    this.yearsForm.valueChanges.subscribe(
      (value: any) =>  {
        this.years = value;
        this.cd.markForCheck();
      }
    );
  }

  validateAmount() {
    const min = 10000;
    const max = 1000000000;
    if (!this.amount || this.amount < min || this.amount > max) {
      this.amountForm.setValue(min, { emitEvent: false });
      this.amountForm.updateValueAndValidity();
      this.amount = min;
      this.cd.markForCheck();
    }
    this.calculateEMI();
  }

  validateTenure() {
    const min = 1;
    const max = 50;
    if (!this.years || this.years < min || this.years > max) {
      this.yearsForm.setValue(min, { emitEvent: false });
      this.yearsForm.updateValueAndValidity();
      this.years = min;
      this.cd.markForCheck();
    }
    this.calculateEMI();
  }

  validateInterestRate() {
    const min = 1;
    const max = 30;
    if (!this.interestRate || this.interestRate < min || this.interestRate > max) {
      this.interestForm.setValue(8 , { emitEvent: false });
      this.interestForm.updateValueAndValidity();
      this.interestRate = 8;
      this.cd.markForCheck();
    }
    this.calculateEMI();
  }

  priceProgressChange($event: any , modeType: string = ''){
    switch(modeType){
      case 'PRICE':
        this.amount = $event;
        this.amountForm.setValue(this.amount, { emitEvent: false });
        this.cd.detectChanges();
        break;
      case 'PERCENTAGE':
          this.interestRate = $event;
          this.interestForm.setValue(this.interestRate, { emitEvent: false });
          this.cd.detectChanges();
          break;
      case 'TENURE':
          this.years = $event;
          this.yearsForm.setValue(this.years, { emitEvent: false });
          this.cd.detectChanges();
          break;
      default:
    }

    this.calculateEMI();
  }

  calculateEMI() {

    const principal = this.amount;
    const monthlyInterest = this.interestRate / 1200;
    const totalMonths = this.years * 12;

    this.emi = (principal * monthlyInterest * Math.pow(1 + monthlyInterest, totalMonths)) / 
               (Math.pow(1 + monthlyInterest, totalMonths) - 1);

    this.totalPayment = this.emi * totalMonths;
    this.totalInterest = this.totalPayment - principal;

    this.pricipalAmount = principal;

    // Update chart
    this.chartData.datasets[0].data = [principal, this.totalInterest];
    this.chart?.update();

    this.calculateYearlyEMI(principal, totalMonths, monthlyInterest);

    this.calculateMonthlyEMI(principal, totalMonths, monthlyInterest);
    
  }

  calculateYearlyEMI(principal: number, totalMonths: number, monthlyInterest: number) {
    this.scheduleYears = [];
    let balance = principal;
  
    const today = new Date();
    const startYear = today.getFullYear();
    const startMonth = today.getMonth() + 1;  // JS months 0-based, +1 to make 1-based
  
    // Calculate how many years we need to cover totalMonths starting from current month
    // For example, if totalMonths=30, startMonth=7 (July), we need 3 years (2025,26,27)
    const totalYears = Math.ceil((totalMonths + startMonth - 1) / 12);
  
    let monthsProcessed = 0;  // how many months counted so far
  
    for (let yearIndex = 0; yearIndex < totalYears; yearIndex++) {
      const year = startYear + yearIndex;
      let yearlyPrincipal = 0;
      let yearlyInterest = 0;
      let monthsInYear = 0;
  
      // For the first year start from current month, else from January
      const monthStart = (yearIndex === 0) ? startMonth : 1;
      const monthEnd = 12;
  
      for (let month = monthStart; month <= monthEnd; month++) {
        monthsProcessed++;
        if (monthsProcessed > totalMonths) break;
  
        // Calculate monthly interest & principal
        const interest = balance * monthlyInterest;
        const principalPaid = this.emi - interest;
        balance -= principalPaid;
  
        yearlyInterest += interest;
        yearlyPrincipal += principalPaid;
        monthsInYear++;
      }
  
      const yearlyEmi = this.emi * monthsInYear;
  
      this.scheduleYears.push({
        year: year,
        emi: yearlyEmi.toFixed(2),
        principal: yearlyPrincipal.toFixed(2),
        interest: yearlyInterest.toFixed(2),
        balance: balance > 0 ? balance.toFixed(2) : '0.00'
      });
    }
  }
  
  calculateMonthlyEMI(principal: number, totalMonths: number, monthlyInterest: number) {
    this.schedule = [];
    let balance = principal;
  
    const startDate = new Date(); // today
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
    for (let i = 0; i < totalMonths; i++) {
      const interest = balance * monthlyInterest;
      const principalPaid = this.emi - interest;
      balance -= principalPaid;
  
      // Calculate date label (month and year)
      const date = new Date(startDate.getFullYear(), startDate.getMonth() + i);
      const monthLabel = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  
      this.schedule.push({
        id: i + 1,
        month: i + 1,
        monthLabel: monthLabel,               // e.g. "Jul 2025"
        emi: this.emi.toFixed(2),             // Monthly EMI
        principal: principalPaid.toFixed(2),
        interest: interest.toFixed(2),
        balance: balance > 0 ? balance.toFixed(2) : '0.00'
      });
    }
  }
  

  exportToExcel() {
    const worksheet = XLSX.utils.json_to_sheet(this.schedule);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Schedule');
    XLSX.writeFile(workbook, 'LoanSchedule.xlsx');
  }

  exportToPDF() {
    const data = document.getElementById('loan-content');
    if (!data) return;
    html2canvas(data).then(canvas => {
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      pdf.addImage(img, 'PNG', 10, 10, 190, 0);
      pdf.save('LoanSchedule.pdf');
    });
  }


}
