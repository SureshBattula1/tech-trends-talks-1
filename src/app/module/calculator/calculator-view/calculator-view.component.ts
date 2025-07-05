import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SharedModule } from '../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-calculator-view',
  standalone: true,
  imports: [ SharedModule, CommonModule,
    FormsModule,],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calculator-view.component.html',
  styleUrl: './calculator-view.component.scss'
})
export class CalculatorViewComponent {
  readonly panelOpenState = signal(false);


  amount = 100000;
  interestRate = 8;
  years = 2;
  emi = 0;
  totalInterest = 0;
  totalPayment = 0;
  schedule: any[] = [];

  calculateEMI() {
    const principal = this.amount;
    const monthlyInterest = this.interestRate / 1200;
    const totalMonths = this.years * 12;

    this.emi = (principal * monthlyInterest * Math.pow(1 + monthlyInterest, totalMonths)) / 
               (Math.pow(1 + monthlyInterest, totalMonths) - 1);

    this.totalPayment = this.emi * totalMonths;
    this.totalInterest = this.totalPayment - principal;

    this.schedule = [];
    let balance = principal;

    for (let i = 1; i <= totalMonths; i++) {
      const interest = balance * monthlyInterest;
      const principalPaid = this.emi - interest;
      balance -= principalPaid;

      this.schedule.push({
        month: i,
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
