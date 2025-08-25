import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, inject, HostListener } from '@angular/core';
import { NgForm } from '@angular/forms';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-eligibility-checker',
  templateUrl: './eligibility-checker.component.html',
  styleUrls: ['./eligibility-checker.component.scss'],
  animations: [
    trigger('fadeInAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideInAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-30px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('pulseAnimation', [
      state('normal', style({ transform: 'scale(1)' })),
      state('pulse', style({ transform: 'scale(1.05)' })),
      transition('normal <=> pulse', animate('0.3s ease-in-out'))
    ]) 
  ]
})
export class EligibilityCheckerComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  // Form data
  monthlySalary: number = 0;
  loanAmount: number = 0;
  tenureValue: number = 5;
  tenureUnit: string = 'years';
  tenureMonths: number = 60;
  expenses: number = 0;
  creditScore: number = 750;
  selectedLoanType: any = null;
  employmentType: string = '';
  formProgress: number = 0;

  // Collapsible loan type display
  isLoanTypesExpanded: boolean = false;
  defaultVisibleLoanTypes: number = 8; // 2 rows on desktop, 4 rows on mobile

  // Formatted values for display
  monthlySalaryFormatted: string = '';
  loanAmountFormatted: string = '';
  expensesFormatted: string = '';

  // Validation messages
  monthlySalaryError: string = '';
  loanAmountError: string = '';
  tenureError: string = '';
  expensesError: string = '';
  validationMessages: string[] = [];
  helpfulTips: string[] = [];
  eligibilityScore: number = 0;

  // Dynamic placeholders
  tenurePlaceholder: string = 'Enter years';

  // Results
  result: { eligible: boolean; emi: number; ratio: number } | null = null;
  explanation: string = '';

  // Chart configuration
  chartType: ChartType = 'doughnut';
  chartData: ChartConfiguration['data'] = {
    labels: ['EMI', 'Remaining Salary'],
    datasets: [{
      label: 'Monthly Allocation',
      data: [0, 0],
      backgroundColor: ['#FF6384', '#36A2EB'],
      borderWidth: 0
    }]
  };

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#ffffff',
          font: {
            size: 14
          }
        }
      }
    }
  };

  // 50+ Loan types with comprehensive coverage
   loanTypes = [
    // Home & Property Loans
    { value: 'home', label: 'Home Loan', icon: '🏠', description: 'Purchase or construct your dream home', interest: 8.5, minAmount: 100000, maxAmount: 50000000, minTenure: 5, maxTenure: 30, minIncome: 25000 },
    { value: 'home-construction', label: 'Home Construction', icon: '🏗️', description: 'Build your house from scratch', interest: 9.2, minAmount: 200000, maxAmount: 30000000, minTenure: 5, maxTenure: 25, minIncome: 35000 },
    { value: 'home-renovation', label: 'Home Renovation', icon: '🔨', description: 'Renovate and upgrade your home', interest: 10.5, minAmount: 50000, maxAmount: 20000000, minTenure: 3, maxTenure: 15, minIncome: 20000 },
    { value: 'plot-purchase', label: 'Plot Purchase', icon: '📐', description: 'Buy land for future construction', interest: 11.0, minAmount: 100000, maxAmount: 20000000, minTenure: 5, maxTenure: 20, minIncome: 30000 },
    { value: 'home-extension', label: 'Home Extension', icon: '🏘️', description: 'Extend your existing home', interest: 9.8, minAmount: 50000, maxAmount: 10000000, minTenure: 3, maxTenure: 15, minIncome: 25000 },
    { value: 'home-improvement', label: 'Home Improvement', icon: '✨', description: 'Improve your home infrastructure', interest: 10.2, minAmount: 25000, maxAmount: 5000000, minTenure: 2, maxTenure: 10, minIncome: 20000 },
    { value: 'home-equity', label: 'Home Equity', icon: '🏦', description: 'Loan against home equity', interest: 9.5, minAmount: 50000, maxAmount: 20000000, minTenure: 3, maxTenure: 20, minIncome: 25000 },
    { value: 'mortgage', label: 'Mortgage Loan', icon: '🔑', description: 'Loan secured by property', interest: 9.8, minAmount: 100000, maxAmount: 30000000, minTenure: 5, maxTenure: 25, minIncome: 30000 },

    // Vehicle Loans
    { value: 'car', label: 'Car Loan', icon: '🚗', description: 'Buy your preferred vehicle', interest: 9.2, minAmount: 50000, maxAmount: 10000000, minTenure: 1, maxTenure: 8, minIncome: 15000 },
    { value: 'two-wheeler', label: 'Two-Wheeler Loan', icon: '🏍️', description: 'Purchase motorcycle or scooter', interest: 10.2, minAmount: 10000, maxAmount: 500000, minTenure: 1, maxTenure: 5, minIncome: 10000 },
    { value: 'commercial-vehicle', label: 'Commercial Vehicle', icon: '🚛', description: 'Buy commercial transport vehicle', interest: 11.5, minAmount: 50000, maxAmount: 20000000, minTenure: 3, maxTenure: 10, minIncome: 40000 },
    { value: 'tractor', label: 'Tractor Loan', icon: '🚜', description: 'Agricultural tractor financing', interest: 8.8, minAmount: 25000, maxAmount: 5000000, minTenure: 3, maxTenure: 12, minIncome: 20000 },
    { value: 'boat', label: 'Boat Loan', icon: '⛵', description: 'Marine vehicle financing', interest: 12.0, minAmount: 100000, maxAmount: 5000000, minTenure: 2, maxTenure: 8, minIncome: 30000 },
    { value: 'rv', label: 'RV Loan', icon: '🚐', description: 'Recreational vehicle financing', interest: 11.8, minAmount: 100000, maxAmount: 10000000, minTenure: 2, maxTenure: 10, minIncome: 35000 },

    // Personal & Consumer Loans
    { value: 'personal', label: 'Personal Loan', icon: '💼', description: 'Flexible loan for any purpose', interest: 11.75, minAmount: 10000, maxAmount: 4000000, minTenure: 1, maxTenure: 7, minIncome: 15000 },
    { value: 'wedding', label: 'Wedding Loan', icon: '💒', description: 'Finance your dream wedding', interest: 12.5, minAmount: 25000, maxAmount: 2000000, minTenure: 1, maxTenure: 5, minIncome: 20000 },
    { value: 'vacation', label: 'Vacation Loan', icon: '✈️', description: 'Travel and holiday financing', interest: 13.0, minAmount: 10000, maxAmount: 1000000, minTenure: 1, maxTenure: 4, minIncome: 18000 },
    { value: 'medical', label: 'Medical Loan', icon: '🏥', description: 'Healthcare and treatment expenses', interest: 11.0, minAmount: 10000, maxAmount: 5000000, minTenure: 1, maxTenure: 6, minIncome: 20000 },
    { value: 'education', label: 'Education Loan', icon: '🎓', description: 'Study and course financing', interest: 7.8, minAmount: 25000, maxAmount: 2000000, minTenure: 2, maxTenure: 10, minIncome: 15000 },
    { value: 'consumer-durable', label: 'Consumer Durable', icon: '📱', description: 'Electronics and appliances', interest: 9.9, minAmount: 5000, maxAmount: 500000, minTenure: 1, maxTenure: 3, minIncome: 12000 },
    { value: 'furniture', label: 'Furniture Loan', icon: '🪑', description: 'Home and office furniture', interest: 10.8, minAmount: 5000, maxAmount: 500000, minTenure: 1, maxTenure: 4, minIncome: 15000 },
    { value: 'jewelry', label: 'Jewelry Loan', icon: '💍', description: 'Precious metal financing', interest: 12.2, minAmount: 5000, maxAmount: 2000000, minTenure: 1, maxTenure: 3, minIncome: 15000 },

    // Business & Professional Loans
    { value: 'business', label: 'Business Loan', icon: '🏢', description: 'Grow your business with capital', interest: 12.0, minAmount: 50000, maxAmount: 100000000, minTenure: 2, maxTenure: 10, minIncome: 30000 },
    { value: 'startup', label: 'Startup Loan', icon: '🚀', description: 'New business venture funding', interest: 13.5, minAmount: 25000, maxAmount: 20000000, minTenure: 1, maxTenure: 7, minIncome: 25000 },
    { value: 'msme', label: 'MSME Loan', icon: '🏭', description: 'Micro, small and medium enterprise', interest: 11.5, minAmount: 50000, maxAmount: 10000000, minTenure: 2, maxTenure: 8, minIncome: 25000 },
    { value: 'working-capital', label: 'Working Capital', icon: '💰', description: 'Business operational expenses', interest: 12.8, minAmount: 25000, maxAmount: 5000000, minTenure: 1, maxTenure: 5, minIncome: 25000 },
    { value: 'equipment', label: 'Equipment Loan', icon: '⚙️', description: 'Business machinery and equipment', interest: 11.2, minAmount: 50000, maxAmount: 15000000, minTenure: 2, maxTenure: 8, minIncome: 25000 },
    { value: 'inventory', label: 'Inventory Loan', icon: '📦', description: 'Stock and inventory financing', interest: 12.5, minAmount: 25000, maxAmount: 5000000, minTenure: 1, maxTenure: 6, minIncome: 20000 },
    { value: 'trade-finance', label: 'Trade Finance', icon: '🌐', description: 'Import-export financing', interest: 10.8, minAmount: 100000, maxAmount: 50000000, minTenure: 3, maxTenure: 12, minIncome: 30000 },
    { value: 'invoice', label: 'Invoice Financing', icon: '📄', description: 'Advance against invoices', interest: 13.2, minAmount: 10000, maxAmount: 5000000, minTenure: 1, maxTenure: 4, minIncome: 20000 },

    // Agricultural & Rural Loans
    { value: 'agriculture', label: 'Agriculture Loan', icon: '🌾', description: 'Farming and cultivation support', interest: 6.5, minAmount: 10000, maxAmount: 2000000, minTenure: 3, maxTenure: 15, minIncome: 15000 },
    { value: 'kisan-credit', label: 'Kisan Credit Card', icon: '🌱', description: 'Farmer credit facility', interest: 5.8, minAmount: 5000, maxAmount: 500000, minTenure: 2, maxTenure: 12, minIncome: 10000 },
    { value: 'dairy', label: 'Dairy Loan', icon: '🐄', description: 'Dairy farming and cattle', interest: 7.2, minAmount: 10000, maxAmount: 1000000, minTenure: 2, maxTenure: 10, minIncome: 15000 },
    { value: 'poultry', label: 'Poultry Loan', icon: '🐔', description: 'Poultry farming business', interest: 7.5, minAmount: 5000, maxAmount: 500000, minTenure: 2, maxTenure: 8, minIncome: 12000 },
    { value: 'fishery', label: 'Fishery Loan', icon: '🐟', description: 'Fish farming and aquaculture', interest: 7.8, minAmount: 10000, maxAmount: 1000000, minTenure: 2, maxTenure: 8, minIncome: 15000 },
    { value: 'horticulture', label: 'Horticulture', icon: '🌺', description: 'Flower and fruit cultivation', interest: 8.0, minAmount: 5000, maxAmount: 500000, minTenure: 2, maxTenure: 8, minIncome: 12000 },

    // Specialized Loans
    { value: 'gold', label: 'Gold Loan', icon: '🥇', description: 'Loan against gold ornaments', interest: 10.5, minAmount: 5000, maxAmount: 50000000, minTenure: 1, maxTenure: 3, minIncome: 10000 },
    { value: 'property', label: 'Property Loan', icon: '🏘️', description: 'Loan against property', interest: 9.5, minAmount: 50000, maxAmount: 50000000, minTenure: 3, maxTenure: 20, minIncome: 25000 },
    { value: 'insurance', label: 'Insurance Premium', icon: '🛡️', description: 'Insurance policy premium', interest: 11.8, minAmount: 5000, maxAmount: 500000, minTenure: 1, maxTenure: 3, minIncome: 12000 },
    { value: 'tax', label: 'Tax Payment', icon: '📊', description: 'Income tax payment assistance', interest: 12.5, minAmount: 5000, maxAmount: 1000000, minTenure: 1, maxTenure: 3, minIncome: 15000 },
    { value: 'legal', label: 'Legal Expenses', icon: '⚖️', description: 'Legal and court expenses', interest: 13.5, minAmount: 5000, maxAmount: 1000000, minTenure: 1, maxTenure: 4, minIncome: 20000 },
    { value: 'emergency', label: 'Emergency Loan', icon: '🚨', description: 'Urgent financial assistance', interest: 14.0, minAmount: 2000, maxAmount: 200000, minTenure: 1, maxTenure: 3, minIncome: 10000 },
    { value: 'debt-consolidation', label: 'Debt Consolidation', icon: '🔄', description: 'Consolidate multiple debts', interest: 11.2, minAmount: 10000, maxAmount: 2000000, minTenure: 2, maxTenure: 7, minIncome: 20000 },
    { value: 'credit-card', label: 'Credit Card', icon: '💳', description: 'Credit card debt settlement', interest: 15.5, minAmount: 5000, maxAmount: 1000000, minTenure: 1, maxTenure: 3, minIncome: 15000 },
    { value: 'payday', label: 'Payday Loan', icon: '📅', description: 'Short-term salary advance', interest: 18.0, minAmount: 2000, maxAmount: 100000, minTenure: 1, maxTenure: 2, minIncome: 10000 },
    { value: 'overdraft', label: 'Overdraft', icon: '📈', description: 'Bank account overdraft facility', interest: 13.0, minAmount: 5000, maxAmount: 2000000, minTenure: 1, maxTenure: 3, minIncome: 15000 }
];


  constructor(private meta: Meta, private title: Title, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.updateFormProgress();
    this.updateTenureMonths();
    this.updateTenurePlaceholder();
    this.updateSEO();
    this.initializeFAQ();
    this.generateSitemapData();
    this.calculateDefaultVisibleLoanTypes();
  }

  // Calculate default visible loan types based on screen size
  calculateDefaultVisibleLoanTypes() {
    if (window.innerWidth <= 768) {
      // Mobile: 4 rows × 4 columns = 16 loan types
      this.defaultVisibleLoanTypes = 16;
    } else if (window.innerWidth <= 1200) {
      // Tablet: 3 rows × 4 columns = 12 loan types
      this.defaultVisibleLoanTypes = 12;
    } else {
      // Desktop: 2 rows × 4 columns = 8 loan types
      this.defaultVisibleLoanTypes = 8;
    }
    
    // If currently expanded, reset to collapsed state when screen size changes
    if (this.isLoanTypesExpanded) {
      this.isLoanTypesExpanded = false;
    }
  }

  // Get grid columns based on screen size
  getGridColumns() {
    if (window.innerWidth <= 768) {
      return 4; // 4 columns on mobile
    } else if (window.innerWidth <= 1200) {
      return 4; // 4 columns on tablet
    } else {
      return 4; // 4 columns on desktop
    }
  }

  // Calculate rows based on visible loan types and columns
  getVisibleRows() {
    const columns = this.getGridColumns();
    return Math.ceil(this.defaultVisibleLoanTypes / columns);
  }

  // Get loan types for current screen size with proper grid distribution
  getVisibleLoanTypes() {
    if (this.isLoanTypesExpanded) {
      return this.loanTypes; // Show all loan types when expanded
    }
    
    const columns = this.getGridColumns();
    const rows = this.getVisibleRows();
    const totalVisible = columns * rows;
    
    return this.loanTypes.slice(0, totalVisible);
  }

  // Check if more button should be shown
  shouldShowMoreButton(): boolean {
    return !this.isLoanTypesExpanded && this.loanTypes.length > this.defaultVisibleLoanTypes;
  }

  // Get total rows needed for all loan types
  getTotalRows(): number {
    const columns = this.getGridColumns();
    return Math.ceil(this.loanTypes.length / columns);
  }

  // Get window width for debug info
  get window() {
    return window;
  }

  // Handle window resize
  @HostListener('window:resize')
  onResize() {
    this.calculateDefaultVisibleLoanTypes();
  }

  // Initialize FAQ functionality
  initializeFAQ() {
    // Add click event listeners to FAQ questions after view initialization
    setTimeout(() => {
      const faqQuestions = document.querySelectorAll('.faq-question');
      faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
          const faqItem = question.closest('.faq-item');
          const isActive = faqItem?.classList.contains('active');
          
          // Close all FAQ items
          document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
          });
          
          // Open clicked item if it wasn't active
          if (!isActive) {
            faqItem?.classList.add('active');
          }
        });
      });
    }, 100);
  }

  // Update form progress based on filled fields
  updateFormProgress() {
    let filledFields = 0;
    const totalFields = 6; // loan type, salary, amount, tenure, expenses, employment

    if (this.selectedLoanType) filledFields++;
    if (this.monthlySalary > 0) filledFields++;
    if (this.loanAmount > 0) filledFields++;
    if (this.tenureValue > 0) filledFields++;
    if (this.expenses >= 0) filledFields++;
    if (this.employmentType) filledFields++;

    this.formProgress = (filledFields / totalFields) * 100;
  }

  // Toggle loan types expansion with better responsive handling
  toggleLoanTypesExpansion() {
    this.isLoanTypesExpanded = !this.isLoanTypesExpanded;
    
    // Force reflow to ensure proper layout
    setTimeout(() => {
      // Trigger change detection
      this.cdr.detectChanges();
    }, 100);
  }

  getMoreButtonText() {
    return this.isLoanTypesExpanded ? 'Show Less' : 'Show More';
  }

  getMoreButtonIcon() {
    return this.isLoanTypesExpanded ? '▲' : '▼';
  }

  // Select loan type
  selectLoanType(loanType: string) {
    this.selectedLoanType = this.loanTypes.find(lt => lt.value === loanType);
    this.updateFormProgress();
    this.validateLoanTypeRequirements();
    this.updateDynamicSEO();
  }

  // Update dynamic SEO based on selected loan type
  updateDynamicSEO() {
    if (!this.selectedLoanType) return;

    const loanType = this.selectedLoanType.label;
    const interestRate = this.selectedLoanType.interest;
    
    // Update title dynamically
    this.title.setTitle(`${loanType} Eligibility Checker - Check ${loanType} Eligibility Online`);
    
    // Update meta description
    this.meta.updateTag({ name: 'description', content: `Check your ${loanType} eligibility online. Get instant eligibility results for ${loanType} with ${interestRate}% interest rate. Know your chances of ${loanType} approval.` });
    
    // Update Open Graph tags
    this.meta.updateTag({ name: 'og:title', content: `${loanType} Eligibility Checker - Check ${loanType} Eligibility Online` });
    this.meta.updateTag({ name: 'og:description', content: `Check your ${loanType} eligibility online. Get instant eligibility results for ${loanType} with ${interestRate}% interest rate.` });
    
    // Update Twitter tags
    this.meta.updateTag({ name: 'twitter:title', content: `${loanType} Eligibility Checker - Check ${loanType} Eligibility Online` });
    this.meta.updateTag({ name: 'twitter:description', content: `Check your ${loanType} eligibility online. Get instant eligibility results for ${loanType} with ${interestRate}% interest rate.` });
    
    // Update keywords
    this.meta.updateTag({ name: 'keywords', content: `${loanType.toLowerCase()} eligibility, ${loanType.toLowerCase()} eligibility checker, ${loanType.toLowerCase()} approval, loan eligibility calculator, ${loanType.toLowerCase()} interest rate ${interestRate}%` });
  }

  // Update tenure months when tenure value or unit changes
  updateTenureMonths() {
    if (this.tenureUnit === 'years') {
      this.tenureMonths = this.tenureValue * 12;
    } else {
      this.tenureMonths = this.tenureValue;
    }
    this.updateFormProgress();
  }

  // Set tenure unit and update calculations
  setTenureUnit(unit: string) {
    this.tenureUnit = unit;
    this.updateTenureMonths();
    this.updateTenurePlaceholder();
    this.validateField('tenure');
  }

  // Update tenure placeholder based on selected unit
  updateTenurePlaceholder() {
    if (this.tenureUnit === 'months') {
      this.tenurePlaceholder = 'Enter months (1-360)';
    } else {
      this.tenurePlaceholder = 'Enter years (1-30)';
    }
  }

  // Format number with commas
  formatNumber(field: string) {
    let value: string;
    let numericValue: number;

    switch (field) {
      case 'monthlySalary':
        value = this.monthlySalaryFormatted.replace(/[^\d]/g, '');
        numericValue = parseInt(value) || 0;
        this.monthlySalary = numericValue;
        this.monthlySalaryFormatted = this.formatWithCommas(numericValue);
        break;
      case 'loanAmount':
        value = this.loanAmountFormatted.replace(/[^\d]/g, '');
        numericValue = parseInt(value) || 0;
        this.loanAmount = numericValue;
        this.loanAmountFormatted = this.formatWithCommas(numericValue);
        break;
      case 'expenses':
        value = this.expensesFormatted.replace(/[^\d]/g, '');
        numericValue = parseInt(value) || 0;
        this.expenses = numericValue;
        this.expensesFormatted = this.formatWithCommas(numericValue);
        break;
    }

    this.updateFormProgress();
    this.validateLoanTypeRequirements();
  }

  // Format number with commas
  formatWithCommas(num: number): string {
    if (num === 0) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // Handle input blur for validation
  onInputBlur(field: string) {
    this.validateField(field);
  }

  // Validate individual field
  validateField(field: string) {
    switch (field) {
      case 'monthlySalary':
        this.validateMonthlySalary();
        break;
      case 'loanAmount':
        this.validateLoanAmount();
        break;
      case 'tenure':
        this.validateTenure();
        break;
      case 'expenses':
        this.validateExpenses();
        break;
    }
  }

  // Validate monthly salary - More inclusive approach
  validateMonthlySalary() {
    if (!this.monthlySalary || this.monthlySalary < 5000) {
      this.monthlySalaryError = 'Monthly salary should be at least ₹5,000 for basic eligibility';
      this.addHelpfulTip('Consider part-time work or freelance opportunities to increase your income');
    } else if (this.selectedLoanType && this.monthlySalary < this.selectedLoanType.minIncome) {
      this.monthlySalaryError = `For ${this.selectedLoanType.label}, recommended minimum: ₹${this.formatWithCommas(this.selectedLoanType.minIncome)}`;
      this.addHelpfulTip(`You can still apply, but consider smaller loan amounts or longer tenures`);
    } else {
      this.monthlySalaryError = '';
    }
  }

  // Validate loan amount - More flexible approach
  validateLoanAmount() {
    if (!this.loanAmount || this.loanAmount < 1000) {
      this.loanAmountError = 'Loan amount should be at least ₹1,000';
    } else if (this.selectedLoanType) {
      if (this.loanAmount < this.selectedLoanType.minAmount) {
        this.loanAmountError = `Recommended minimum for ${this.selectedLoanType.label}: ₹${this.formatWithCommas(this.selectedLoanType.minAmount)}`;
        this.addHelpfulTip('You can still apply - some lenders offer flexibility for smaller amounts');
      } else if (this.loanAmount > this.selectedLoanType.maxAmount) {
        this.loanAmountError = `Maximum recommended for ${this.selectedLoanType.label}: ₹${this.formatWithCommas(this.selectedLoanType.maxAmount)}`;
        this.addHelpfulTip('Consider splitting into multiple loans or applying with a co-applicant');
      } else {
        this.loanAmountError = '';
      }
    } else {
      this.loanAmountError = '';
    }
  }

  // Validate tenure - More flexible approach
  validateTenure() {
    if (!this.tenureValue || this.tenureValue < 1) {
      this.tenureError = `Tenure should be at least 1 ${this.tenureUnit === 'months' ? 'month' : 'year'}`;
    } else if (this.tenureUnit === 'months' && this.tenureValue > 360) {
      this.tenureError = 'Maximum tenure cannot exceed 360 months (30 years)';
      this.addHelpfulTip('Consider using years for longer tenures');
    } else if (this.tenureUnit === 'years' && this.tenureValue > 30) {
      this.tenureError = 'Maximum tenure cannot exceed 30 years';
      this.addHelpfulTip('Very long tenures increase total interest cost');
    } else if (this.selectedLoanType) {
      const tenureInYears = this.tenureUnit === 'years' ? this.tenureValue : this.tenureValue / 12;
      if (tenureInYears < this.selectedLoanType.minTenure) {
        this.tenureError = `Recommended minimum tenure for ${this.selectedLoanType.label}: ${this.selectedLoanType.minTenure} years`;
        this.addHelpfulTip('Shorter tenures mean higher EMIs but lower total interest');
      } else if (tenureInYears > this.selectedLoanType.maxTenure) {
        this.tenureError = `Recommended maximum tenure for ${this.selectedLoanType.label}: ${this.selectedLoanType.maxTenure} years`;
        this.addHelpfulTip('Longer tenures reduce monthly EMIs but increase total interest cost');
      } else {
        this.tenureError = '';
      }
    } else {
      this.tenureError = '';
    }
  }

  // Validate expenses - More realistic approach
  validateExpenses() {
    if (this.expenses < 0) {
      this.expensesError = 'Expenses cannot be negative';
    } else if (this.expenses > this.monthlySalary * 0.9) {
      this.expensesError = 'Expenses seem high - consider if this is sustainable';
      this.addHelpfulTip('High expenses reduce loan eligibility. Look for ways to reduce monthly obligations');
    } else {
      this.expensesError = '';
    }
  }

  // Add helpful tip without duplicates
  addHelpfulTip(tip: string) {
    if (!this.helpfulTips.includes(tip)) {
      this.helpfulTips.push(tip);
    }
  }

  // Clear helpful tips
  clearHelpfulTips() {
    this.helpfulTips = [];
  }

  // Get income level category
  getIncomeLevel(): string {
    if (this.monthlySalary < 15000) return 'low';
    if (this.monthlySalary < 50000) return 'medium';
    if (this.monthlySalary < 100000) return 'high';
    return 'very-high';
  }

  // Get income level specific guidance
  getIncomeLevelGuidance(): string[] {
    const level = this.getIncomeLevel();
    const tips: string[] = [];

    switch (level) {
      case 'low':
        tips.push('Consider government schemes and micro-finance options');
        tips.push('Look for loans with longer tenures to reduce monthly EMIs');
        tips.push('Explore secured loan options like gold loans');
        break;
      case 'medium':
        tips.push('You have good eligibility for most loan types');
        tips.push('Consider building credit history for better rates');
        tips.push('Look for pre-approved offers from your bank');
        break;
      case 'high':
        tips.push('Excellent eligibility - you can negotiate better rates');
        tips.push('Consider premium loan products with better terms');
        tips.push('You may qualify for higher loan amounts');
        break;
      case 'very-high':
        tips.push('Premium eligibility - explore exclusive banking services');
        tips.push('Consider investment-linked loan products');
        tips.push('You can negotiate the best terms and rates');
        break;
    }

    return tips;
  }

  // Calculate eligibility score (0-100)
  calculateEligibilityScore(): number {
    let score = 0;
    
    // Base score from income level
    const incomeLevel = this.getIncomeLevel();
    switch (incomeLevel) {
      case 'low': score += 20; break;
      case 'medium': score += 40; break;
      case 'high': score += 70; break;
      case 'very-high': score += 90; break;
    }

    // Credit score contribution
    if (this.creditScore >= 750) score += 20;
    else if (this.creditScore >= 650) score += 15;
    else if (this.creditScore >= 550) score += 10;
    else score += 5;

    // Employment type contribution
    if (this.employmentType === 'salaried') score += 10;
    else if (this.employmentType === 'self-employed') score += 8;
    else if (this.employmentType === 'business-owner') score += 7;
    else if (this.employmentType === 'freelancer') score += 5;

    // Expenses ratio contribution
    const expenseRatio = this.expenses / this.monthlySalary;
    if (expenseRatio < 0.3) score += 10;
    else if (expenseRatio < 0.5) score += 7;
    else if (expenseRatio < 0.7) score += 3;
    else score += 0;

    return Math.min(100, score);
  }

  // Get eligibility category
  getEligibilityCategory(score: number): string {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    if (score >= 20) return 'Limited';
    return 'Poor';
  }

  // Get eligibility color
  getEligibilityColor(score: number): string {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#8BC34A';
    if (score >= 40) return '#FFC107';
    if (score >= 20) return '#FF9800';
    return '#F44336';
  }

  // Validate loan type requirements - More inclusive approach
  validateLoanTypeRequirements() {
    this.validationMessages = [];
    this.clearHelpfulTips();
    
    if (!this.selectedLoanType) return;

    // Add income level specific guidance
    this.helpfulTips.push(...this.getIncomeLevelGuidance());

    // Check minimum income - but don't block, just inform
    if (this.monthlySalary > 0 && this.monthlySalary < this.selectedLoanType.minIncome) {
      this.validationMessages.push(`💡 For ${this.selectedLoanType.label}, recommended minimum income: ₹${this.formatWithCommas(this.selectedLoanType.minIncome)}`);
      this.addHelpfulTip(`You can still apply - some lenders offer flexibility for lower incomes`);
    }

    // Check loan amount range - provide guidance
    if (this.loanAmount > 0) {
      if (this.loanAmount < this.selectedLoanType.minAmount) {
        this.validationMessages.push(`💡 Recommended minimum for ${this.selectedLoanType.label}: ₹${this.formatWithCommas(this.selectedLoanType.minAmount)}`);
        this.addHelpfulTip('Consider saving more for down payment or exploring smaller loan options');
      }
      if (this.loanAmount > this.selectedLoanType.maxAmount) {
        this.validationMessages.push(`💡 Recommended maximum for ${this.selectedLoanType.label}: ₹${this.formatWithCommas(this.selectedLoanType.maxAmount)}`);
        this.addHelpfulTip('Consider splitting into multiple loans or applying with a co-applicant');
      }
    }

    // Check tenure range - provide guidance
    if (this.tenureValue > 0) {
      const tenureInYears = this.tenureUnit === 'years' ? this.tenureValue : this.tenureValue / 12;
      if (tenureInYears < this.selectedLoanType.minTenure) {
        this.validationMessages.push(`💡 Recommended minimum tenure: ${this.selectedLoanType.minTenure} years`);
        this.addHelpfulTip('Shorter tenures mean higher EMIs but lower total interest cost');
      }
      if (tenureInYears > this.selectedLoanType.maxTenure) {
        this.validationMessages.push(`💡 Recommended maximum tenure: ${this.selectedLoanType.maxTenure} years`);
        this.addHelpfulTip('Longer tenures reduce monthly EMIs but increase total interest cost');
      }
    }

    // Add general tips based on loan type
    this.addLoanTypeSpecificTips();
  }

  // Add loan type specific helpful tips
  addLoanTypeSpecificTips() {
    if (!this.selectedLoanType) return;

    switch (this.selectedLoanType.value) {
      case 'home':
        this.addHelpfulTip('Home loans typically have the lowest interest rates');
        this.addHelpfulTip('Consider government schemes like PMAY for additional benefits');
        break;
      case 'car':
        this.addHelpfulTip('Car loans often have competitive rates from dealerships');
        this.addHelpfulTip('Consider used car loans for better affordability');
        break;
      case 'personal':
        this.addHelpfulTip('Personal loans are unsecured but have higher interest rates');
        this.addHelpfulTip('Build credit history to get better personal loan rates');
        break;
      case 'business':
        this.addHelpfulTip('Business loans may require business plan and financial statements');
        this.addHelpfulTip('Consider government schemes for MSME loans');
        break;
      case 'education':
        this.addHelpfulTip('Education loans often have moratorium periods');
        this.addHelpfulTip('Government education loans have lower interest rates');
        break;
    }
  }

  // Get alternative loan suggestions based on current profile
  getAlternativeLoanSuggestions(): any[] {
    if (!this.selectedLoanType) return [];

    const alternatives: any[] = [];
    const currentLoanType = this.selectedLoanType.value;

    // Suggest alternatives based on income level and current loan type
    const incomeLevel = this.getIncomeLevel();

    switch (currentLoanType) {
      case 'home':
        if (incomeLevel === 'low') {
          alternatives.push(
            this.loanTypes.find(lt => lt.value === 'plot-purchase'),
            this.loanTypes.find(lt => lt.value === 'home-improvement'),
            this.loanTypes.find(lt => lt.value === 'gold')
          );
        }
        break;
      case 'car':
        if (incomeLevel === 'low') {
          alternatives.push(
            this.loanTypes.find(lt => lt.value === 'two-wheeler'),
            this.loanTypes.find(lt => lt.value === 'personal'),
            this.loanTypes.find(lt => lt.value === 'consumer-durable')
          );
        }
        break;
      case 'personal':
        if (incomeLevel === 'low') {
          alternatives.push(
            this.loanTypes.find(lt => lt.value === 'gold'),
            this.loanTypes.find(lt => lt.value === 'consumer-durable'),
            this.loanTypes.find(lt => lt.value === 'emergency')
          );
        }
        break;
      case 'business':
        if (incomeLevel === 'low') {
          alternatives.push(
            this.loanTypes.find(lt => lt.value === 'msme'),
            this.loanTypes.find(lt => lt.value === 'personal'),
            this.loanTypes.find(lt => lt.value === 'gold')
          );
        }
        break;
    }

    // Filter out undefined values and add general alternatives
    const filteredAlternatives = alternatives.filter(alt => alt !== undefined);
    
    // Add some general alternatives if we don't have enough
    if (filteredAlternatives.length < 3) {
      const generalAlternatives = [
        this.loanTypes.find(lt => lt.value === 'personal'),
        this.loanTypes.find(lt => lt.value === 'gold'),
        this.loanTypes.find(lt => lt.value === 'consumer-durable')
      ].filter(alt => alt !== undefined && !filteredAlternatives.includes(alt));
      
      filteredAlternatives.push(...generalAlternatives.slice(0, 3 - filteredAlternatives.length));
    }

    return filteredAlternatives.slice(0, 3);
  }

  // Get loan type recommendations based on profile
  getLoanTypeRecommendations(): any[] {
    const incomeLevel = this.getIncomeLevel();
    const recommendations: any[] = [];

    switch (incomeLevel) {
      case 'low':
        recommendations.push(
          this.loanTypes.find(lt => lt.value === 'gold'),
          this.loanTypes.find(lt => lt.value === 'personal'),
          this.loanTypes.find(lt => lt.value === 'consumer-durable')
        );
        break;
      case 'medium':
        recommendations.push(
          this.loanTypes.find(lt => lt.value === 'home'),
          this.loanTypes.find(lt => lt.value === 'car'),
          this.loanTypes.find(lt => lt.value === 'education')
        );
        break;
      case 'high':
        recommendations.push(
          this.loanTypes.find(lt => lt.value === 'home'),
          this.loanTypes.find(lt => lt.value === 'business'),
          this.loanTypes.find(lt => lt.value === 'property')
        );
        break;
      case 'very-high':
        recommendations.push(
          this.loanTypes.find(lt => lt.value === 'home'),
          this.loanTypes.find(lt => lt.value === 'business'),
          this.loanTypes.find(lt => lt.value === 'property')
        );
        break;
    }

    return recommendations.filter(rec => rec !== undefined);
  }

  // Check if form is valid - More inclusive approach
  isFormValid(): boolean {
    // Basic validation - allow submission even with warnings
    const hasBasicData = !!(this.selectedLoanType && 
                           this.monthlySalary > 0 && 
                           this.loanAmount > 0 && 
                           this.tenureValue > 0);
    
    // Allow submission even with validation warnings
    return hasBasicData;
  }

  // Get credit score label
  getCreditScoreLabel(score: number): string {
    if (score >= 750) return 'Excellent';
    if (score >= 700) return 'Good';
    if (score >= 650) return 'Fair';
    if (score >= 600) return 'Poor';
    return 'Very Poor';
  }

  // Handle form submission
  onSubmit(form: NgForm) {
    // console.log('Form submitted:', form.valid);
    // console.log('Selected loan type:', this.selectedLoanType);
    
    if (this.isFormValid()) {
      this.calculateEligibility();
    } else {
              // console.log('Form validation failed');
      // Trigger validation for all fields
      this.validateField('monthlySalary');
      this.validateField('loanAmount');
      this.validateField('tenure');
      this.validateField('expenses');
    }
  }

  // Calculate eligibility
  calculateEligibility() {
    if (!this.selectedLoanType) {
      // console.log('No loan type selected for calculation');
      return;
    }

    // console.log('Calculating eligibility for:', this.selectedLoanType.label);
    // console.log('Interest rate:', this.selectedLoanType.interest);
    // console.log('Tenure months:', this.tenureMonths);

    const principal = this.loanAmount;
    const annualInterestRate = this.selectedLoanType.interest;
    const monthlyInterestRate = annualInterestRate / 1200;
    const n = this.tenureMonths;

    // EMI calculation formula
    const emi = (principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, n)) /
                (Math.pow(1 + monthlyInterestRate, n) - 1);

    // Adjust monthly salary by subtracting expenses (existing EMIs)
    const adjustedSalary = this.monthlySalary - this.expenses;

    const ratio = (emi / adjustedSalary) * 100;
    
    // More flexible eligibility criteria
    let eligible = false;
    let eligibilityReason = '';
    
    if (ratio <= 40) {
      eligible = true;
      eligibilityReason = 'Excellent affordability - EMI is well within safe limits';
    } else if (ratio <= 50) {
      eligible = true;
      eligibilityReason = 'Good affordability - EMI is within acceptable limits';
    } else if (ratio <= 60) {
      eligible = true;
      eligibilityReason = 'Moderate affordability - EMI is at the upper limit but manageable';
    } else if (ratio <= 70) {
      eligible = false;
      eligibilityReason = 'High EMI ratio - consider reducing loan amount or increasing tenure';
    } else {
      eligible = false;
      eligibilityReason = 'Very high EMI ratio - not recommended for financial stability';
    }

    this.result = { eligible, emi, ratio };

    // Calculate eligibility score
    this.eligibilityScore = this.calculateEligibilityScore();

    const remainingSalary = adjustedSalary - emi;

    // Update chart data
    this.chartData.datasets[0].data = [parseFloat(emi.toFixed(2)), parseFloat(remainingSalary.toFixed(2))];

    // Trigger chart update
    setTimeout(() => {
      this.chart?.update();
    }, 0);

    // Generate explanation with more helpful guidance
    if (eligible) {
      this.explanation = `${eligibilityReason}. Your EMI of ₹${emi.toFixed(2)} represents ${ratio.toFixed(1)}% of your adjusted monthly income. This loan appears manageable for your current financial situation.`;
      
      if (ratio > 50) {
        this.explanation += ' However, consider building an emergency fund and ensuring stable income before proceeding.';
      }
    } else {
      this.explanation = `${eligibilityReason}. Your EMI of ₹${emi.toFixed(2)} represents ${ratio.toFixed(1)}% of your adjusted monthly income, which could strain your finances.`;
      
      if (this.monthlySalary < this.selectedLoanType.minIncome) {
        this.explanation += ' Consider increasing your income or exploring smaller loan amounts.';
      } else if (this.loanAmount > this.selectedLoanType.maxAmount) {
        this.explanation += ' Consider reducing the loan amount or exploring alternative financing options.';
      } else {
        this.explanation += ' Consider increasing the loan tenure or reducing the loan amount to improve affordability.';
      }
    }

    // console.log('Calculation completed:', this.result);
  }

  // Download PDF report
  downloadPDF(): void {
    if (!this.result) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Loan Eligibility Report', pageWidth / 2, 20, { align: 'center' });
    
    // Add loan details
    doc.setFontSize(12);
    doc.text(`Loan Type: ${this.selectedLoanType?.label || 'N/A'}`, 20, 40);
    doc.text(`Interest Rate: ${this.selectedLoanType?.interest || 'N/A'}% p.a.`, 20, 50);
    doc.text(`Monthly Salary: ₹${this.monthlySalary?.toLocaleString() || 'N/A'}`, 20, 60);
    doc.text(`Loan Amount: ₹${this.loanAmount?.toLocaleString() || 'N/A'}`, 20, 70);
    doc.text(`Loan Tenure: ${this.tenureValue} ${this.tenureUnit} (${this.tenureMonths} months)`, 20, 80);
    doc.text(`Existing EMIs: ₹${this.expenses?.toLocaleString() || '0'}`, 20, 90);
    doc.text(`Credit Score: ${this.creditScore}/900 (${this.getCreditScoreLabel(this.creditScore)})`, 20, 100);
    doc.text(`Employment Type: ${this.employmentType || 'N/A'}`, 20, 110);
    
    // Add results
    doc.setFontSize(14);
    doc.text('Eligibility Results:', 20, 130);
    doc.setFontSize(12);
    doc.text(`Status: ${this.result.eligible ? 'APPROVED' : 'NOT APPROVED'}`, 20, 140);
    doc.text(`Monthly EMI: ₹${this.result.emi.toLocaleString()}`, 20, 150);
    doc.text(`EMI to Income Ratio: ${this.result.ratio.toFixed(2)}%`, 20, 160);
    doc.text(`Eligibility Score: ${this.eligibilityScore}/100 (${this.getEligibilityCategory(this.eligibilityScore)})`, 20, 170);
    doc.text(`Explanation: ${this.explanation}`, 20, 180);
    
    // Add helpful tips if available
    if (this.helpfulTips.length > 0) {
      doc.setFontSize(14);
      doc.text('Helpful Tips & Guidance:', 20, 200);
      doc.setFontSize(10);
      let yPosition = 210;
      this.helpfulTips.forEach((tip, index) => {
        if (yPosition < 270) { // Check if we need a new page
          doc.text(`• ${tip}`, 20, yPosition);
          yPosition += 8;
        }
      });
    }
    
    // Add footer
    doc.setFontSize(10);
    doc.text('Generated by Tech Trends Talks Loan Eligibility Calculator', pageWidth / 2, 280, { align: 'center' });
    
    // Save the PDF
    doc.save('loan-eligibility-report.pdf');
  }

  // Download Excel report
  downloadExcel(): void {
    if (!this.result) return;
    
    const worksheet = XLSX.utils.json_to_sheet([
      {
        'Loan Type': this.selectedLoanType?.label || 'N/A',
        'Interest Rate (% p.a.)': this.selectedLoanType?.interest || 'N/A',
        'Monthly Salary': this.monthlySalary,
        'Loan Amount': this.loanAmount,
        'Loan Tenure': `${this.tenureValue} ${this.tenureUnit}`,
        'Tenure (months)': this.tenureMonths,
        'Existing EMIs': this.expenses,
        'Credit Score': this.creditScore,
        'Credit Score Label': this.getCreditScoreLabel(this.creditScore),
        'Employment Type': this.employmentType || 'N/A',
        'Eligibility Status': this.result.eligible ? 'APPROVED' : 'NOT APPROVED',
        'Monthly EMI': this.result.emi,
        'EMI to Income Ratio (%)': this.result.ratio,
        'Eligibility Score': this.eligibilityScore,
        'Eligibility Category': this.getEligibilityCategory(this.eligibilityScore),
        'Explanation': this.explanation,
        'Helpful Tips': this.helpfulTips.join('; ')
      }
    ]);
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Eligibility Report');
    
    // Save the Excel file
    XLSX.writeFile(workbook, 'loan-eligibility-report.xlsx');
  }

  // Update SEO meta tags and title
  updateSEO() {
    this.title.setTitle('Loan Eligibility Checker - Check Your Loan Eligibility Online');
    this.meta.addTags([
      { name: 'description', content: 'Check your loan eligibility online. Get instant eligibility results for home loans, personal loans, car loans, and more. Know your chances of loan approval.' },
      { name: 'keywords', content: 'loan eligibility, home loan eligibility, personal loan eligibility, car loan eligibility, loan eligibility calculator, eligibility check, loan approval, loan eligibility criteria' },
      { name: 'author', content: 'Tech Trends Talks' },
      { name: 'robots', content: 'index, follow' },
      { name: 'og:title', content: 'Loan Eligibility Checker - Check Your Loan Eligibility Online' },
      { name: 'og:description', content: 'Check your loan eligibility online. Get instant eligibility results for home loans, personal loans, car loans, and more. Know your chances of loan approval.' },
      { name: 'og:url', content: `${window.location.origin}${window.location.pathname}` },
      { name: 'og:type', content: 'website' },
      { name: 'og:image', content: `${window.location.origin}/assets/images/loan-eligibility.jpg` },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Loan Eligibility Checker - Check Your Loan Eligibility Online' },
      { name: 'twitter:description', content: 'Check your loan eligibility online. Get instant eligibility results for home loans, personal loans, car loans, and more. Know your chances of loan approval.' },
      { name: 'twitter:image', content: `${window.location.origin}/assets/images/loan-eligibility.jpg` },
      { name: 'article:author', content: 'Tech Trends Talks' },
      { name: 'article:section', content: 'Finance' },
      { name: 'article:tag', content: 'Loan Eligibility, Loan Eligibility Checker, Loan Approval, Loan Eligibility Calculator' },
      { name: 'article:published_time', content: new Date().toISOString() },
      { name: 'article:modified_time', content: new Date().toISOString() }
    ]);

    // Add structured data for better SEO
    this.addStructuredData();
  }

  // Add structured data (JSON-LD) for better SEO
  addStructuredData() {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      'name': 'Loan Eligibility Checker',
      'description': 'Check your loan eligibility online. Get instant eligibility results for home loans, personal loans, car loans, and more. Know your chances of loan approval.',
      'url': window.location.href,
      'applicationCategory': 'FinanceApplication',
      'operatingSystem': 'Web Browser',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'INR',
        'description': 'Free loan eligibility checker'
      },
      'featureList': [
        'Home Loan Eligibility Check',
        'Personal Loan Eligibility Check',
        'Car Loan Eligibility Check',
        'Business Loan Eligibility Check',
        'Education Loan Eligibility Check',
        'Instant EMI Calculation',
        'Eligibility Score',
        'Alternative Loan Suggestions'
      ],
      'screenshot': `${window.location.origin}/assets/images/loan-eligibility.jpg`,
      'softwareVersion': '1.0',
      'author': {
        '@type': 'Organization',
        'name': 'Tech Trends Talks',
        'url': 'https://techtrendstalks.com'
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'Tech Trends Talks',
        'url': 'https://techtrendstalks.com'
      },
      'datePublished': new Date().toISOString(),
      'dateModified': new Date().toISOString()
    };

    // Create and inject the structured data script
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    // Add FAQ structured data
    this.addFAQStructuredData();
  }

  // Add FAQ structured data for better SEO
  addFAQStructuredData() {
    const faqData = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'How to check loan eligibility?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'To check loan eligibility, enter your monthly income, desired loan amount, tenure, existing EMIs, and select loan type. Our calculator will instantly show your eligibility status and EMI.'
          }
        },
        {
          '@type': 'Question',
          'name': 'What is the minimum salary required for loan eligibility?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'The minimum salary requirement varies by loan type. Generally, ₹5,000 monthly income is required for basic eligibility, but specific loan types may have higher requirements.'
          }
        },
        {
          '@type': 'Question',
          'name': 'How is loan eligibility calculated?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Loan eligibility is calculated based on your monthly income, existing EMIs, loan amount, tenure, and interest rate. We use the EMI formula and check if the EMI ratio is within acceptable limits.'
          }
        },
        {
          '@type': 'Question',
          'name': 'What is a good EMI to income ratio?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'A good EMI to income ratio is below 50%. Below 40% is excellent, 40-50% is good, and 50-60% is moderate. Above 60% may strain your finances.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Can I get a loan with low credit score?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Yes, you can get loans with a low credit score, but you may face higher interest rates or need to provide additional security. Consider secured loans like gold loans for better approval chances.'
          }
        }
      ]
    };

    // Create and inject the FAQ structured data script
    const faqScript = document.createElement('script');
    faqScript.type = 'application/ld+json';
    faqScript.text = JSON.stringify(faqData);
    document.head.appendChild(faqScript);
  }

  // Generate sitemap data for SEO
  generateSitemapData() {
    const sitemapData = {
      url: window.location.href,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: '0.9',
      title: 'Loan Eligibility Checker',
      description: 'Check your loan eligibility online. Get instant eligibility results for home loans, personal loans, car loans, and more.',
      keywords: ['loan eligibility', 'loan eligibility calculator', 'home loan eligibility', 'personal loan eligibility', 'car loan eligibility'],
      h1: 'Loan Eligibility Calculator',
      h2: ['How Loan Eligibility Checker Works', 'Frequently Asked Questions'],
      images: ['/assets/images/loan-eligibility.jpg'],
      structuredData: ['WebApplication', 'FAQPage']
    };

    // Log sitemap data for SEO tools
    // console.log('Sitemap Data:', sitemapData);
    
    return sitemapData;
  }
}
