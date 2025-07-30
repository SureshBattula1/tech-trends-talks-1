import { Component } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';

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
  result: { eligible: boolean; maxLoanAmount: number } | null = null;

  onSubmit(form: any) {
    const income = form.value.income;
    const loanAmount = form.value.loanAmount;
    const tenure = form.value.tenure;

    // Simple eligibility logic: eligible if monthly income * 10 >= loan amount
    const maxLoanAmount = income * 10;
    const eligible = maxLoanAmount >= loanAmount;

    this.result = { eligible, maxLoanAmount };
  }
}
