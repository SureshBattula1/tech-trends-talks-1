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
import {
  trigger, transition, query, style, stagger, animate
} from '@angular/animations';
import { LoaderService } from '../../../services/loading-bar/loader.service';
import autoTable from 'jspdf-autotable';


@Component({
  selector: 'app-calculator-view',
  standalone: true,
  imports: [ SharedModule, PriceProgressBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calculator-view.component.html',
  styleUrl: './calculator-view.component.scss',
  animations: [
    trigger('tabStagger', [
      transition('* => *', [
        query('.mat-mdc-tab', [
          style({ transform: 'translateX(-50px)', opacity: 0 }),
          stagger(100, [
            animate('400ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class CalculatorViewComponent implements OnInit{

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  
  
  public loader = inject(LoaderService);
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
  selectedOption: any;

  suggestedLoanAmounts = [1000000, 2000000, 2500000, 3000000, 4000000, 5000000, 7500000, 10000000, 20000000, 50000000];

  showAllRows = false;
  selectedLoanTypeIndex = 0;

  displayedColumns: string[] = ['id', 'month', 'principal', 'interest', 'emi', 'balance'];

  get filteredSchedule() {
    return this.showAllRows ? this.schedule : this.schedule.slice(0, 1);
  }

  toggleRows() {
    this.showAllRows = !this.showAllRows;
  }
  
  onLoanTypeChange(index: number) {
    this.loader.show();
    this.selectedLoanTypeIndex = index;
    const selected = this.loanTypes[index];
    if (selected?.interest) {
      this.interestRate = selected.interest;
      this.interestForm.setValue(this.interestRate, { emitEvent: false });  // updates the input field
      this.calculateEMI();
      this.cd.markForCheck();
      setTimeout(() => {
        this.loader.hide();
        }, 100);
    }
  }
  
  loanTypes = [ 
    { value: 'home', viewValue: 'Home Loan', interest: 8.5, icon: 'home' },
    { value: 'car', viewValue: 'Car Loan', interest: 9.2, icon: 'directions_car' },
    { value: 'personal', viewValue: 'Personal Loan', interest: 11.75, icon: 'person' },
    { value: 'education', viewValue: 'Education Loan', interest: 7.8, icon: 'school' },
    { value: 'gold', viewValue: 'Gold Loan', interest: 10.5, icon: 'emoji_events' },
    { value: 'mortgage', viewValue: 'Mortgage Loan', interest: 9.8, icon: 'apartment' },
    { value: 'twoWheeler', viewValue: 'Two-Wheeler Loan', interest: 10.2, icon: 'two_wheeler' },
    { value: 'agriculture', viewValue: 'Agriculture Loan', interest: 6.5, icon: 'agriculture' },
    { value: 'creditCard', viewValue: 'Credit Card Loan', interest: 15.5, icon: 'credit_card' },
    { value: 'overdraft', viewValue: 'Overdraft Loan', interest: 13.0, icon: 'swap_horiz' },
    { value: 'consumerDurable', viewValue: 'Consumer Durable Loan', interest: 9.9, icon: 'devices' },
    { value: 'travel', viewValue: 'Travel Loan', interest: 12.75, icon: 'flight_takeoff' },
    { value: 'lap', viewValue: 'Loan Against Property', interest: 9.5, icon: 'location_city' },
    { value: 'business', viewValue: 'Business Loan', interest: 12.0, icon: 'business_center' }
  ];


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

  
  loanTypeForm = new FormControl('');

  amountForm = new FormControl(this.amount);
  interestForm = new FormControl(this.interestRate);
  yearsForm = new FormControl(this.years);

  public cd = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.initForm();
    this.calculateEMI();
  }

  initForm(){

    this.loanTypeForm.valueChanges.subscribe(
      (value: any) =>{
        this.interestRate = value.interest;
        this.cd.markForCheck();
        this.calculateEMI();
        console.log(`interest reate`, this.interestRate);
      }
    )

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
    this.amount = min;
  } 
  
  this.amountForm.setValue(this.amount, { emitEvent: false });
  this.amountForm.updateValueAndValidity();
  this.cd.markForCheck();
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
    this.loader.show();
    // Step 1: Filter columns you want to export
    const filteredSchedule = this.schedule.map(({ month, principal, interest,emi, balance, monthLabel }) => ({
      Month: month,
      MonthLabel: monthLabel,
      Principal: principal,
      EMI: emi,
      Interest: interest,
      Balance: balance
    }));
  
    // Step 2: Add a title row
    const title = [['Loan Repayment Schedule']]; // Title as first row
    const headers = [['S NO','Month', 'Principal', 'Interest', 'EMI','Balance']]; // Header row
    const dataRows = filteredSchedule.map(row => [row.Month, row.MonthLabel, row.Principal, row.Interest, row.EMI, row.Balance]);
  
    const sheetData = [...title, ...headers, ...dataRows];
  
    // Step 3: Convert to worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  
    // Step 4: Merge cells for title row (optional)
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } } // Merge A1:D1
    ];
  
    // Step 5: Set column widths
    worksheet['!cols'] = [
      { wch: 10 }, // Month
      { wch: 25 }, // Month Label
      { wch: 25 }, // Principal
      { wch: 25 }, // Interest
      { wch: 25 }, // EMI
      { wch: 25 }  // Balance
    ];

    worksheet['!rows'] = [
      { hpt: 23 }, // Row 1: title
      { hpt: 20 }  // Row 2: header
      // More rows can be added if needed
    ];

    worksheet['A1'].s = {
      alignment: { horizontal: 'center', vertical: 'center' },
      font: { bold: true, sz: 14, color: { rgb: '000000' } },
      fill: { fgColor: { rgb: 'DDEBF7' } }
    };
  
    // Step 6: Create workbook and export
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Schedule');
    XLSX.writeFile(workbook, 'LoanSchedule.xlsx');
    setTimeout(() => {
    this.loader.hide();
    }, 50);

  }


  exportToEMIPdf(): void {
    this.loader.show();
    if(this.showAllRows === false){
      this.toggleRows();
    }
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
  
    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text('Tech Trends Talks', pageWidth / 2, 20, { align: 'center' });
  
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Grow with us: Empowering Your Financial Journey', pageWidth / 2, 26, { align: 'center' });
  
    // Loan Summary Box
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(0.5);
    doc.roundedRect(12, 32, pageWidth - 24, 28, 2, 2 , 'S');
  
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'normal');
    doc.text(`${this.loanTypes[this.selectedLoanTypeIndex].viewValue} Amount: ${this.currencyFormat(this.amount)}`, 16, 40);
    doc.text(`Interest Rate (%): ${this.interestRate.toFixed(2)}`, 16, 46);
    doc.text(`Loan Tenure (years): ${this.years}`, 16, 52);
  
    // Payment Summary
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(41, 128, 185);
    doc.text("Payment Summary", 14, 70);
  
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(12, 74, pageWidth - 24, 24, 2, 2, 'F');
  
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text("Loan EMI:", 16, 82);
    doc.setFont('helvetica', 'bold');
    doc.text(`${this.currencyFormat(this.emi)}`, 60, 82);
  
    doc.setFont('helvetica', 'normal');
    doc.text("Total Interest Payable:", 16, 88);
    doc.setFont('helvetica', 'bold');
    doc.text(`${this.currencyFormat(this.totalInterest)}`, 60, 88);
  
    doc.setFont('helvetica', 'normal');
    doc.text("Total Payment (Principal + Interest):", 16, 94);
    doc.setFont('helvetica', 'bold');
    doc.text(`${this.currencyFormat(this.totalPayment)}`, 85, 94);
  
    // Load and wait for watermark image
    const img = new Image();
    img.src = 'assets/images/company_name.png';
    img.onload = () => {
     

    // const imgData = canvas.toDataURL('image/png');
      const tableBody = this.filteredSchedule.map((row, index) => ([
        (index + 1).toString(),
        row.monthLabel,
        this.currencyFormat(row.principal),
        this.currencyFormat(row.interest),
        this.currencyFormat(row.emi),
        this.currencyFormat(row.balance)
      ]));
  
      // Render table after summary — startY must be below summary box
      autoTable(doc, {
        head: [['S.NO', 'Month', 'Principal', 'Interest', 'EMI', 'Balance']],
        body: tableBody,
        startY: 110,
        theme: 'grid',
        styles: {
          fontSize: 8,
          font: 'helvetica',
          cellPadding: { top: 3, right: 2, bottom: 3, left: 2 },
          valign: 'middle',
          halign: 'right',
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
        },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' },
          1: { cellWidth: 25, halign: 'left' },
          2: { cellWidth: 30, halign: 'right' },
          3: { cellWidth: 30, halign: 'right' },
          4: { cellWidth: 30, halign: 'right' },
          5: { cellWidth: 45, halign: 'right' },
        },
        willDrawCell: (data) => {
          const text = Array.isArray(data.cell.text) ? data.cell.text.join('') : data.cell.text;
          if (text.length > 15) {
            data.cell.styles.fontSize = 6.5;
          }
        },
        didDrawPage: () => {
          doc.setFontSize(8);
          doc.setTextColor(100);
          // doc.addImage(img, 'PNG',
          //   (pageWidth / 2) - 40, // x
          //   120,                  // y (should be table Y position)
          //   100,                  // width
          //   100,                  // height
          //   undefined,
          //   'FAST'
          // );
          doc.text(`© ${new Date().getFullYear()} Tech Trends Talks. All rights reserved.`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }
      });
  
      doc.save('Loan-Schedule.pdf');
      setTimeout(() => {
        this.loader.hide();
        }, 50);
    };
  }
  

  currencyFormat(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
       maximumFractionDigits: 2 
    }).format(amount);
  }
  
}
