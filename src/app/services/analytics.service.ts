import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { EnvironmentService } from './environment.service';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private environmentService = inject(EnvironmentService);
  private router = inject(Router);

  constructor() {
    this.initializeAnalytics();
  }

  /**
   * Initialize Google Analytics
   */
  private initializeAnalytics(): void {
    if (!this.environmentService.isAnalyticsEnabled) {
      return;
    }

    // Track page views on route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.trackPageView(event.urlAfterRedirects);
      });
  }

  /**
   * Track page view
   */
  trackPageView(url: string): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', this.environmentService.googleAnalyticsId, {
        page_path: url,
        page_title: this.getPageTitle(url)
      });
    }
  }

  /**
   * Track calculator usage
   */
  trackCalculatorUsage(calculatorType: string, action: string, parameters?: any): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'calculator_usage', {
        calculator_type: calculatorType,
        action: action,
        ...parameters
      });
    }
  }

  /**
   * Track EMI calculation
   */
  trackEMICalculation(loanAmount: number, interestRate: number, tenure: number, emi: number): void {
    this.trackCalculatorUsage('emi', 'calculation', {
      loan_amount: loanAmount,
      interest_rate: interestRate,
      tenure_years: tenure,
      emi_amount: emi,
      currency: 'INR'
    });
  }

  /**
   * Track SIP calculation
   */
  trackSIPCalculation(monthlyInvestment: number, interestRate: number, period: number, totalValue: number): void {
    this.trackCalculatorUsage('sip', 'calculation', {
      monthly_investment: monthlyInvestment,
      interest_rate: interestRate,
      investment_period: period,
      total_value: totalValue,
      currency: 'INR'
    });
  }

  /**
   * Track loan eligibility check
   */
  trackEligibilityCheck(loanType: string, monthlySalary: number, loanAmount: number, eligible: boolean): void {
    this.trackCalculatorUsage('eligibility', 'check', {
      loan_type: loanType,
      monthly_salary: monthlySalary,
      loan_amount: loanAmount,
      eligible: eligible,
      currency: 'INR'
    });
  }

  /**
   * Track file download
   */
  trackFileDownload(fileType: 'pdf' | 'excel', calculatorType: string): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'file_download', {
        file_type: fileType,
        calculator_type: calculatorType
      });
    }
  }

  /**
   * Track user engagement
   */
  trackUserEngagement(action: string, category: string, label?: string, value?: number): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      });
    }
  }

  /**
   * Track conversion
   */
  trackConversion(conversionType: string, value?: number): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: `${this.environmentService.googleAnalyticsId}/${conversionType}`,
        value: value
      });
    }
  }

  /**
   * Get page title based on URL
   */
  private getPageTitle(url: string): string {
    if (url.includes('/calculator/emi-calculator')) {
      return 'EMI Calculator - Calculate Loan EMI & Repayment Schedule';
    } else if (url.includes('/calculator/sip-calculator')) {
      return 'SIP Calculator - Calculate Mutual Fund Returns & Investment Growth';
    } else if (url.includes('/loan-eligibility-calculator')) {
      return 'Loan Eligibility Calculator - Check Your Loan Approval Chances';
    } else if (url.includes('/blogs')) {
      return 'Blog - Tech Trends Talks';
    } else {
      return 'Tech Trends Talks - EMI Calculators & Smart Loan Insights';
    }
  }

  /**
   * Track custom events
   */
  trackCustomEvent(eventName: string, parameters?: any): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, parameters);
    }
  }
}
