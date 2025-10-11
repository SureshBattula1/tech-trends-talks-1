/**
 * Shared Calculator Constants
 * Centralized configuration for all calculator components
 */

export const CALCULATOR_CONSTANTS = {
  // Amount/Investment Limits
  AMOUNTS: {
    EMI_MIN: 10000,
    EMI_MAX: 1000000000,
    SIP_MIN: 100,
    SIP_MAX: 1000000000,
    LUMPSUM_MIN: 1000,
    LUMPSUM_MAX: 1000000000,
  },

  // Interest Rate Limits
  INTEREST_RATES: {
    MIN: 1,
    MAX: 30,
    MAX_SIP: 50,
    DEFAULT: 12,
    DEFAULT_EMI: 8,
  },

  // Tenure/Period Limits
  TENURE: {
    MIN: 1,
    MAX: 50,
    DEFAULT_EMI: 2,
    DEFAULT_SIP: 10,
  },

  // Formatting Configuration
  FORMAT: {
    CURRENCY: {
      locale: 'en-IN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
    INPUT: {
      locale: 'en-IN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
  },

  // Export Configuration
  EXPORT: {
    FILE_NAMES: {
      EMI_EXCEL: 'TechTrendsTalks_EMI_Report',
      EMI_PDF_COMPLETE: 'TechTrendsTalks_Complete_EMI_Report',
      EMI_PDF_MONTHLY: 'TechTrendsTalks_Monthly_EMI_Details',
      SIP_EXCEL: 'TechTrendsTalks_SIP_Report',
      SIP_PDF: 'TechTrendsTalks_SIP_Investment_Report',
    },
  },

  // Currency Display Thresholds
  CURRENCY_THRESHOLDS: {
    CRORE: 10000000,
    LAKH: 100000,
    THOUSAND: 1000,
  },
} as const;

/**
 * Validation error messages
 */
export const VALIDATION_MESSAGES = {
  AMOUNT: {
    INVALID: 'Please enter a valid amount',
    MIN: (min: number) => `Minimum amount is ₹${min.toLocaleString('en-IN')}`,
    MAX: (max: number) => `Maximum amount is ₹${max.toLocaleString('en-IN')}`,
  },
  TENURE: {
    INVALID: 'Please enter a valid tenure',
    MIN: (min: number) => `Minimum tenure is ${min} year${min > 1 ? 's' : ''}`,
    MAX: (max: number) => `Maximum tenure is ${max} years`,
  },
  INTEREST_RATE: {
    INVALID: 'Please enter a valid interest rate',
    MIN: (min: number) => `Minimum interest rate is ${min}%`,
    MAX: (max: number) => `Maximum interest rate is ${max}%`,
  },
  GENERIC: 'Invalid input. Please try again.',
} as const;

/**
 * Chart color schemes
 */
export const CHART_COLORS = {
  PRIMARY: '#42A5F5',
  SECONDARY: '#5367ff',
  SUCCESS: '#66BB6A',
  WARNING: '#FFA726',
  DANGER: '#EF5350',
  INFO: '#26C6DA',
  PRINCIPAL: '#42A5F5',
  INTEREST: '#5367ff',
  INVESTED: '#42A5F5',
  RETURNS: '#5367ff',
} as const;

