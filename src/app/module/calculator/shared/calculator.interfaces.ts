/**
 * Shared Calculator Interfaces
 * Common type definitions for calculator components
 */

/**
 * Generic validation configuration
 */
export interface ValidationConfig {
  min: number;
  max: number;
  defaultValue: number;
  fieldName: string;
}

/**
 * Validation error state
 */
export interface ValidationErrors {
  [key: string]: string;
}

/**
 * Loading states for async operations
 */
export interface LoadingStates {
  isCalculating: boolean;
  isExporting: boolean;
  isLoading: boolean;
}

/**
 * Input event type
 */
export interface CalculatorInputEvent {
  target: HTMLInputElement;
}

/**
 * EMI Calculator specific interfaces
 */
export interface LoanType {
  value: string;
  viewValue: string;
  interest: number;
  icon: string;
}

export interface SEOLoanType {
  title: string;
  description: string;
}

export interface MonthlyPayment {
  month: number;
  monthLabel: string;
  emi: string;
  principal: string;
  interest: string;
  balance: string;
  id?: string;
}

export interface YearlyPayment {
  year: number;
  emi: string;
  principal: string;
  interest: string;
  balance: string;
  yearlyData?: {
    emi: string;
    principal: string;
    interest: string;
    balance: string;
  };
  monthlyDetails?: MonthlyPayment[];
  isExpanded?: boolean;
}

export interface EMICalculationResult {
  emi: number;
  totalInterest: number;
  totalPayment: number;
  principalAmount: number;
}

/**
 * SIP Calculator specific interfaces
 */
export interface SIPCalculationResult {
  investedAmount: number;
  estimatedReturns: number;
  totalValue: number;
}

export interface LumpsumCalculationResult {
  investedAmount: number;
  estimatedReturns: number;
  totalValue: number;
}

/**
 * Calculator mode types
 */
export type CalculatorMode = 'SIP' | 'LUMPSUM';

/**
 * Price progress bar modes
 */
export type ProgressBarMode = 'PRICE' | 'PERCENTAGE' | 'TENURE' | 
                               'LUMPSUM_PRICE' | 'LUMPSUM_PERCENTAGE' | 'LUMPSUM_TENURE';

/**
 * Export format types
 */
export type ExportFormat = 'PDF' | 'EXCEL';

/**
 * Chart configuration
 */
export interface CalculatorChartData {
  labels: string[];
  data: number[];
  backgroundColor: string[];
}

/**
 * Form field types for validation
 */
export type EMIFormField = 'amount' | 'interestRate' | 'years';
export type SIPFormField = 'monthlyInvestment' | 'annualInterestRate' | 'investmentPeriod' |
                            'lumpsumAmount' | 'lumpsumAnnualInterestRate' | 'lumpsumInvestmentPeriod';

/**
 * Generic calculator state
 */
export interface CalculatorState<T = any> {
  inputs: T;
  results: T;
  validationErrors: ValidationErrors;
  loadingStates: LoadingStates;
}

/**
 * Structured data type for SEO
 */
export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

