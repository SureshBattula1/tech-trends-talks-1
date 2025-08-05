import { Component, inject, signal, ViewChild } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { FormControl, Validators } from '@angular/forms';
import { Observable, startWith, map } from 'rxjs';
import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { LoaderService } from '../../services/loading-bar/loader.service';

@Component({
  selector: 'app-eligibility-checker',
  templateUrl: './eligibility-checker.component.html',
  styleUrls: ['./eligibility-checker.component.scss'],
  animations: [
    trigger('fadeInAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms ease-in', style({ opacity: 1 }))
      ])
    ]) 
  ]
})
export class EligibilityCheckerComponent {
  loanTypes = [ 
    { value: 'home', viewValue: 'Home Loan', interest: 8.5 },
    { value: 'car', viewValue: 'Car Loan', interest: 9.2 },
    { value: 'personal', viewValue: 'Personal Loan', interest: 11.75 },
    { value: 'education', viewValue: 'Education Loan', interest: 7.8 },
    { value: 'gold', viewValue: 'Gold Loan', interest: 10.5 },
    { value: 'mortgage', viewValue: 'Mortgage Loan', interest: 9.8 },
    { value: 'twoWheeler', viewValue: 'Two-Wheeler Loan', interest: 10.2 },
    { value: 'agriculture', viewValue: 'Agriculture Loan', interest: 6.5 },
    { value: 'creditCard', viewValue: 'Credit Card Loan', interest: 15.5 },
    { value: 'overdraft', viewValue: 'Overdraft Loan', interest: 13.0 },
    { value: 'consumerDurable', viewValue: 'Consumer Durable Loan', interest: 9.9 },
    { value: 'travel', viewValue: 'Travel Loan', interest: 12.75 },
    { value: 'lap', viewValue: 'Loan Against Property', interest: 9.5 },
    { value: 'business', viewValue: 'Business Loan', interest: 12.0 }
  ];

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  public loader = inject(LoaderService);
  readonly panelOpenState = signal(false);
  
  loanTypeControl = new FormControl<string>('',{
    validators: [Validators.required], 
    nonNullable: true,
  });
  filteredLoanTypes: Observable<any[]>;

  selectedLoanType: any = null;
  monthlySalary: number | null = null;
  loanAmount: number | null = null;
  tenureMonths: number | null = null;
  expenses: number | null = 0;
  

  result: { eligible: boolean; emi: number; ratio: number } | null = null;
  explanation: string = '';


  chartType: ChartType = 'doughnut';
    chartData: ChartConfiguration['data'] = {
      labels: ['EMI', 'Remaining Salary'],
      datasets: [{
        label: 'Monthly Allocation',
        data: [0, 0],
        backgroundColor: ['#FF6384', '#36A2EB'],
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

  constructor() {
    this.filteredLoanTypes = this.loanTypeControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterLoanTypes(value || ''))
    );

    this.loanTypeControl.valueChanges.subscribe(value => {
      if (typeof value === 'string') {
        const found = this.loanTypes.find(loan => loan.viewValue.toLowerCase() === value.toLowerCase());
        this.selectedLoanType = found || null;
      } else if (value && (value as any).viewValue) {
        this.selectedLoanType = value;
      } else {
        this.selectedLoanType = null;
      }
    });
  }

  private _filterLoanTypes(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.loanTypes.filter(loanType => loanType.viewValue.toLowerCase().includes(filterValue));
  }

  onLoanTypeSelected(event: any) {
    this.selectedLoanType = this.loanTypes.find(loan => loan.viewValue === event.option.value);
  }

  onSubmit(form: any) {
    this.loanTypeControl.markAllAsTouched();

    if(this.loanTypeControl.invalid){
      return;
    }

    this.loader.show();

    if (!this.monthlySalary || !this.loanAmount || !this.tenureMonths || !this.selectedLoanType) {
      this.result = null;
      return;
    }

    const principal = this.loanAmount;
    const annualInterestRate = this.selectedLoanType.interest;
    const monthlyInterestRate = annualInterestRate / 1200;
    const n = this.tenureMonths;

    // EMI calculation formula
    const emi = (principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, n)) /
                (Math.pow(1 + monthlyInterestRate, n) - 1);

    // Adjust monthly salary by subtracting expenses
    const adjustedSalary = this.monthlySalary - (this.expenses || 0);

    const ratio = (emi / adjustedSalary) * 100;
    const eligible = ratio <= 50; // Assuming max 50% of salary can be EMI

    this.result = { eligible, emi, ratio };

    const remainingSalary = adjustedSalary - emi;

    // ✅ Update the chart data dynamically
    this.chartData.datasets[0].data = [parseFloat(emi.toFixed(2)), parseFloat(remainingSalary.toFixed(2))];

    // ✅ Trigger chart update
    setTimeout(() => {
      this.chart?.update();
    }, 0);
    setTimeout(() => {
      this.loader.hide();
      }, 100);
    if (eligible) {
      this.explanation = `Based on your monthly salary and the selected loan type (${this.selectedLoanType.viewValue}), your EMI of ₹${emi.toFixed(2)} is within the acceptable limit. You are eligible for this loan.`;
    } else {
      this.explanation = `Your EMI of ₹${emi.toFixed(2)} exceeds 50% of your adjusted monthly income after expenses. This means you are not eligible for the ${this.selectedLoanType.viewValue} loan at this time. Consider reducing your loan amount or increasing your income to improve eligibility.`;
    }
  }
}
