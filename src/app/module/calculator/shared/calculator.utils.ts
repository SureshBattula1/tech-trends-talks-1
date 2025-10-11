/**
 * Shared Calculator Utilities
 * Common utility functions for calculator components
 */

import { CALCULATOR_CONSTANTS, VALIDATION_MESSAGES } from './calculator.constants';
import { ValidationConfig, ValidationErrors } from './calculator.interfaces';

/**
 * Number Formatting Utilities
 */
export class NumberFormatter {
  /**
   * Format number with Indian comma notation
   */
  static formatIndianNumber(value: number): string {
    return new Intl.NumberFormat('en-IN').format(value);
  }

  /**
   * Format currency with 2 decimal places
   */
  static formatCurrency(value: number): string {
    return new Intl.NumberFormat(
      CALCULATOR_CONSTANTS.FORMAT.CURRENCY.locale,
      {
        minimumFractionDigits: CALCULATOR_CONSTANTS.FORMAT.CURRENCY.minimumFractionDigits,
        maximumFractionDigits: CALCULATOR_CONSTANTS.FORMAT.CURRENCY.maximumFractionDigits,
      }
    ).format(value);
  }

  /**
   * Format input value for form controls
   */
  static formatInputValue(value: number): string {
    if (!value || value === 0) return '';
    return new Intl.NumberFormat(
      CALCULATOR_CONSTANTS.FORMAT.INPUT.locale,
      {
        minimumFractionDigits: CALCULATOR_CONSTANTS.FORMAT.INPUT.minimumFractionDigits,
        maximumFractionDigits: CALCULATOR_CONSTANTS.FORMAT.INPUT.maximumFractionDigits,
      }
    ).format(value);
  }

  /**
   * Parse comma-separated string to number
   */
  static parseInputValue(value: string): number {
    if (!value) return 0;
    const cleanValue = value.replace(/,/g, '');
    return parseFloat(cleanValue) || 0;
  }

  /**
   * Format currency with abbreviated units (Cr, L, K)
   */
  static formatCurrencyAbbreviated(value: number): string {
    const { CRORE, LAKH, THOUSAND } = CALCULATOR_CONSTANTS.CURRENCY_THRESHOLDS;

    if (value >= CRORE) {
      return (value / CRORE).toFixed(2) + ' Cr';
    } else if (value >= LAKH) {
      return (value / LAKH).toFixed(2) + ' L';
    } else if (value >= THOUSAND) {
      return (value / THOUSAND).toFixed(2) + ' K';
    }
    return value.toFixed(2);
  }

  /**
   * Truncate to 2 decimal places
   */
  static truncateToTwoDecimals(value: number): string {
    return value.toFixed(2);
  }
}

/**
 * Validation Utilities
 */
export class ValidationUtils {
  /**
   * Validate numeric input against config
   */
  static validateNumber(
    value: number,
    config: ValidationConfig
  ): { isValid: boolean; error: string } {
    if (!value || isNaN(value)) {
      return {
        isValid: false,
        error: VALIDATION_MESSAGES.GENERIC,
      };
    }

    if (value < config.min) {
      return {
        isValid: false,
        error: `Minimum ${config.fieldName} is ${config.min}`,
      };
    }

    if (value > config.max) {
      return {
        isValid: false,
        error: `Maximum ${config.fieldName} is ${config.max}`,
      };
    }

    return { isValid: true, error: '' };
  }

  /**
   * Sanitize input value within bounds
   */
  static sanitizeValue(value: number, min: number, max: number, defaultValue: number): number {
    if (!value || isNaN(value) || value < min) {
      return defaultValue;
    }
    if (value > max) {
      return max;
    }
    return value;
  }

  /**
   * Check if value is within valid range
   */
  static isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }
}

/**
 * Calculation Utilities
 */
export class CalculationUtils {
  /**
   * Calculate EMI using standard formula
   */
  static calculateEMI(
    principal: number,
    annualRate: number,
    years: number
  ): { emi: number; totalPayment: number; totalInterest: number } {
    try {
      const monthlyRate = annualRate / 1200;
      const totalMonths = years * 12;

      if (monthlyRate === 0) {
        const emi = principal / totalMonths;
        return {
          emi,
          totalPayment: principal,
          totalInterest: 0,
        };
      }

      const emi =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);

      const totalPayment = emi * totalMonths;
      const totalInterest = totalPayment - principal;

      return {
        emi: parseFloat(emi.toFixed(2)),
        totalPayment: parseFloat(totalPayment.toFixed(2)),
        totalInterest: parseFloat(totalInterest.toFixed(2)),
      };
    } catch (error) {
      console.error('EMI calculation error:', error);
      return { emi: 0, totalPayment: 0, totalInterest: 0 };
    }
  }

  /**
   * Calculate SIP returns
   */
  static calculateSIP(
    monthlyInvestment: number,
    annualRate: number,
    years: number
  ): { investedAmount: number; totalValue: number; estimatedReturns: number } {
    try {
      const monthlyRate = annualRate / 12 / 100;
      const totalMonths = years * 12;

      const totalValue =
        monthlyInvestment *
        (((Math.pow(1 + monthlyRate, totalMonths) - 1) * (1 + monthlyRate)) / monthlyRate);

      const investedAmount = monthlyInvestment * totalMonths;
      const estimatedReturns = totalValue - investedAmount;

      return {
        investedAmount: parseFloat(investedAmount.toFixed(2)),
        totalValue: parseFloat(totalValue.toFixed(2)),
        estimatedReturns: parseFloat(estimatedReturns.toFixed(2)),
      };
    } catch (error) {
      console.error('SIP calculation error:', error);
      return { investedAmount: 0, totalValue: 0, estimatedReturns: 0 };
    }
  }

  /**
   * Calculate Lumpsum returns
   */
  static calculateLumpsum(
    principal: number,
    annualRate: number,
    years: number
  ): { investedAmount: number; totalValue: number; estimatedReturns: number } {
    try {
      const rate = annualRate / 100;
      const totalValue = principal * Math.pow(1 + rate, years);
      const estimatedReturns = totalValue - principal;

      return {
        investedAmount: parseFloat(principal.toFixed(2)),
        totalValue: parseFloat(totalValue.toFixed(2)),
        estimatedReturns: parseFloat(estimatedReturns.toFixed(2)),
      };
    } catch (error) {
      console.error('Lumpsum calculation error:', error);
      return { investedAmount: 0, totalValue: 0, estimatedReturns: 0 };
    }
  }

  /**
   * Calculate Step Up SIP returns
   */
  static calculateStepUpSIP(
    initialMonthlyInvestment: number,
    annualRate: number,
    years: number,
    stepUpPercentage: number,
    stepUpFrequency: 'YEARLY' | 'HALF_YEARLY' = 'YEARLY'
  ): { investedAmount: number; totalValue: number; estimatedReturns: number; yearlyBreakdown: any[] } {
    try {
      const monthlyRate = annualRate / 12 / 100;
      const totalMonths = years * 12;
      const stepUpFactor = 1 + stepUpPercentage / 100;
      const stepUpInterval = stepUpFrequency === 'YEARLY' ? 12 : 6;

      let totalValue = 0;
      let totalInvested = 0;
      let currentMonthlyInvestment = initialMonthlyInvestment;
      const yearlyBreakdown: any[] = [];

      for (let month = 1; month <= totalMonths; month++) {
        // Step up the investment at specified intervals
        if (month > 1 && (month - 1) % stepUpInterval === 0) {
          currentMonthlyInvestment *= stepUpFactor;
        }

        // Calculate future value of this month's investment
        const remainingMonths = totalMonths - month + 1;
        const futureValue = currentMonthlyInvestment * Math.pow(1 + monthlyRate, remainingMonths);
        
        totalValue += futureValue;
        totalInvested += currentMonthlyInvestment;

        // Store yearly data
        if (month % 12 === 0 || month === totalMonths) {
          const year = Math.ceil(month / 12);
          yearlyBreakdown.push({
            year,
            monthlyInvestment: currentMonthlyInvestment,
            yearlyInvestment: currentMonthlyInvestment * Math.min(12, totalMonths - (year - 1) * 12),
            cumulativeInvestment: totalInvested,
            cumulativeValue: totalValue,
          });
        }
      }

      const estimatedReturns = totalValue - totalInvested;

      return {
        investedAmount: parseFloat(totalInvested.toFixed(2)),
        totalValue: parseFloat(totalValue.toFixed(2)),
        estimatedReturns: parseFloat(estimatedReturns.toFixed(2)),
        yearlyBreakdown,
      };
    } catch (error) {
      console.error('Step Up SIP calculation error:', error);
      return { investedAmount: 0, totalValue: 0, estimatedReturns: 0, yearlyBreakdown: [] };
    }
  }

  /**
   * Calculate SWP (Systematic Withdrawal Plan) returns
   * This calculates how long your investment will last with regular withdrawals
   */
  static calculateSWP(
    initialInvestment: number,
    monthlyWithdrawal: number,
    annualRate: number,
    years: number
  ): { 
    initialInvestment: number; 
    totalWithdrawn: number; 
    remainingValue: number;
    totalReturns: number;
    monthlyBreakdown: any[];
    status: 'sufficient' | 'exhausted' | 'warning';
  } {
    try {
      const monthlyRate = annualRate / 12 / 100;
      const totalMonths = years * 12;
      
      let remainingBalance = initialInvestment;
      let totalWithdrawn = 0;
      const monthlyBreakdown: any[] = [];
      let exhaustedMonth = 0;

      for (let month = 1; month <= totalMonths; month++) {
        // Withdraw monthly amount FIRST (at the beginning of the month)
        const withdrawal = Math.min(monthlyWithdrawal, remainingBalance);
        remainingBalance -= withdrawal;
        totalWithdrawn += withdrawal;
        
        // Check if balance is exhausted after withdrawal
        if (remainingBalance <= 0 && exhaustedMonth === 0) {
          exhaustedMonth = month;
          // Store final month data
          const year = Math.ceil(month / 12);
          monthlyBreakdown.push({
            month,
            year,
            withdrawal,
            interest: 0,
            remainingBalance: 0,
          });
          break;
        }
        
        // Calculate interest on REMAINING balance (after withdrawal)
        const monthlyInterest = remainingBalance * monthlyRate;
        
        // Add interest to remaining balance
        remainingBalance += monthlyInterest;

        // Store monthly data (store yearly or at end for performance)
        if (month % 12 === 0 || month === totalMonths) {
          const year = Math.ceil(month / 12);
          monthlyBreakdown.push({
            month,
            year,
            withdrawal,
            interest: monthlyInterest,
            remainingBalance,
          });
        }
      }

      const totalReturns = totalWithdrawn + remainingBalance - initialInvestment;
      
      // Determine status
      let status: 'sufficient' | 'exhausted' | 'warning' = 'sufficient';
      if (exhaustedMonth > 0) {
        status = 'exhausted';
      } else if (remainingBalance < (monthlyWithdrawal * 12)) {
        status = 'warning';
      }

      return {
        initialInvestment: parseFloat(initialInvestment.toFixed(2)),
        totalWithdrawn: parseFloat(totalWithdrawn.toFixed(2)),
        remainingValue: parseFloat(Math.max(0, remainingBalance).toFixed(2)),
        totalReturns: parseFloat(totalReturns.toFixed(2)),
        monthlyBreakdown,
        status,
      };
    } catch (error) {
      console.error('SWP calculation error:', error);
      return { 
        initialInvestment: 0, 
        totalWithdrawn: 0, 
        remainingValue: 0,
        totalReturns: 0,
        monthlyBreakdown: [],
        status: 'exhausted'
      };
    }
  }
}

/**
 * File/Export Utilities
 */
export class ExportUtils {
  /**
   * Generate timestamped filename
   */
  static generateTimestampedFilename(baseName: string, extension: string): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    return `${baseName}_${timestamp}.${extension}`;
  }

  /**
   * Safe alert with error handling
   */
  static showError(message: string): void {
    console.error(message);
    if (typeof alert !== 'undefined') {
      alert(message);
    }
  }

  /**
   * Safe console warning
   */
  static warn(message: string, data?: any): void {
    console.warn(message, data);
  }
}

/**
 * Input Handling Utilities
 */
export class InputUtils {
  /**
   * Check if input is a partial decimal
   */
  static isPartialDecimal(value: string): boolean {
    return value.endsWith('.') || (value.includes('.') && !value.endsWith('.'));
  }

  /**
   * Debounce function for input handling
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return function (this: any, ...args: Parameters<T>) {
      const context = this;

      if (timeout !== null) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => {
        func.apply(context, args);
      }, wait);
    };
  }

  /**
   * Throttle function for performance optimization
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return function (this: any, ...args: Parameters<T>) {
      const context = this;

      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }
}

/**
 * Date Utilities
 */
export class DateUtils {
  /**
   * Get month name from month number
   */
  static getMonthName(monthIndex: number): string {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[monthIndex];
  }

  /**
   * Format date for display
   */
  static formatDate(date: Date): string {
    return `${this.getMonthName(date.getMonth())} ${date.getFullYear()}`;
  }
}

