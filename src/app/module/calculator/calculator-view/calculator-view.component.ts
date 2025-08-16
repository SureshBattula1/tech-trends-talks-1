import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, signal, ViewChild, HostListener } from '@angular/core';
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
  trigger, transition, query, style, stagger, animate, state
} from '@angular/animations';
import { LoaderService } from '../../../services/loading-bar/loader.service';
import autoTable from 'jspdf-autotable';
import { MetaTagsService, CalculatorType } from '../../../services/meta-tags.service';
import { StructuredDataService } from '../../../services/structured-data.service';
import { Router } from '@angular/router';
import { Meta } from '@angular/platform-browser';


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
    ]),
    trigger('pulseAnimation', [
      state('normal', style({ transform: 'scale(1)' })),
      state('pulse', style({ transform: 'scale(1.05)' })),
      transition('normal <=> pulse', animate('0.3s ease-in-out'))
    ]),
    trigger('arrowAnimation', [
      state('collapsed', style({ 
        transform: 'rotate(0deg)',
        opacity: 0.8
      })),
      state('expanded', style({ 
        transform: 'rotate(180deg)',
        opacity: 1
      })),
      transition('collapsed <=> expanded', [
        animate('0.4s cubic-bezier(0.4, 0.0, 0.2, 1)')
      ])
    ])
  ]
})
export class CalculatorViewComponent implements OnInit{

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  
  
  public loader = inject(LoaderService);
  private metaTagsService = inject(MetaTagsService);
  private structuredDataService = inject(StructuredDataService);
  private router = inject(Router);
  private meta = inject(Meta);
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

  // New properties for enhanced table
  expandedYears: Set<number> = new Set();
  yearlySchedule: any[] = [];

  suggestedLoanAmounts = [1000000, 2000000, 2500000, 3000000, 4000000, 5000000, 7500000, 10000000, 20000000, 50000000];

  // Keep this property as it's still used
  selectedLoanTypeIndex = 0;

  // Collapsible loan type display
  isLoanTypesExpanded: boolean = false;
  defaultVisibleLoanTypes: number = 8; // 2 rows on desktop, 4 rows on mobile

  // FAQ functionality
  activeFaqIndex: number | null = null;

  // SEO Loan Types functionality
  isSEOLoanTypesExpanded: boolean = false;
  defaultVisibleSEOLoanTypes: number = 4; // Show only 4 loan types initially (1 row)

  // Calculate default visible loan types based on screen size
  calculateDefaultVisibleLoanTypes() {
    if (window.innerWidth <= 768) {
      // Mobile: 4 rows × 2 columns = 8 loan types
      this.defaultVisibleLoanTypes = 8;
    } else if (window.innerWidth <= 1200) {
      // Tablet: 3 rows × 3 columns = 9 loan types
      this.defaultVisibleLoanTypes = 9;
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
      return 2; // 2 columns on mobile
    } else if (window.innerWidth <= 1200) {
      return 3; // 3 columns on tablet
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

  // Toggle loan types expansion
  toggleLoanTypesExpansion() {
    this.isLoanTypesExpanded = !this.isLoanTypesExpanded;
    
    // Force reflow to ensure proper layout
    setTimeout(() => {
      // Trigger change detection
      this.cd.markForCheck();
    }, 100);
  }

  getMoreButtonText() {
    return this.isLoanTypesExpanded ? 'Show Less' : 'Show More';
  }

  getMoreButtonIcon() {
    return this.isLoanTypesExpanded ? '▲' : '▼';
  }

  // Handle window resize
  @HostListener('window:resize')
  onResize() {
    this.calculateDefaultVisibleLoanTypes();
  }


  // New methods for enhanced table
  toggleYearExpansion(year: number) {
    if (this.expandedYears.has(year)) {
      this.expandedYears.delete(year);
    } else {
      this.expandedYears.add(year);
    }
    this.cd.markForCheck();
  }

  isYearExpanded(year: number): boolean {
    return this.expandedYears.has(year);
  }

  getYearlyRowClass(year: number): string {
    return this.isYearExpanded(year) ? 'year-row-expanded' : 'year-row-collapsed';
  }

  trackByYear(index: number, yearData: any): number {
    return yearData.year;
  }

  // Methods for expand/collapse all functionality
  expandAllYears() {
    this.yearlySchedule.forEach(yearData => {
      this.expandedYears.add(yearData.year);
    });
    this.cd.markForCheck();
  }

  collapseAllYears() {
    this.expandedYears.clear();
    this.cd.markForCheck();
  }

  // FAQ toggle functionality
  toggleFaq(index: number) {
    if (this.activeFaqIndex === index) {
      this.activeFaqIndex = null; // Close if already open
    } else {
      this.activeFaqIndex = index; // Open the clicked FAQ
    }
    this.cd.markForCheck();
  }

  // Custom function to truncate to 2 decimal places without rounding
  truncateToTwoDecimals(value: number): string {
    const truncated = Math.floor(value * 100) / 100;
    return truncated.toFixed(2);
  }

  // SEO Loan Types methods
  getVisibleLoanTypesForSEO() {
    if (this.isSEOLoanTypesExpanded) {
      return this.seoLoanTypes; // Show all loan types when expanded
    }
    return this.seoLoanTypes.slice(0, this.defaultVisibleSEOLoanTypes); // Show only first 4
  }

  // Generate structured data for SEO
  generateLoanTypesStructuredData() {
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Types of Loans You Can Calculate with EMI Calculator",
      "description": "Comprehensive list of 35+ loan types including home loans, car loans, personal loans, business loans, education loans, and more. Calculate EMI for all loan types with our free calculator.",
      "numberOfItems": this.seoLoanTypes.length,
      "url": window.location.href,
      "itemListElement": this.seoLoanTypes.map((loan, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": loan.title,
        "description": loan.description,
        "url": `${window.location.href}#${loan.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
      }))
    };
  }

  // Generate FAQ structured data
  generateFAQStructuredData() {
    const faqData = [
      {
        question: "How accurate is the EMI calculator?",
        answer: "Our EMI calculator provides highly accurate results using the standard EMI formula. The calculations include principal, interest, and processing fees to give you the most realistic EMI amount."
      },
      {
        question: "What factors affect my EMI amount?",
        answer: "EMI amount depends on three main factors: Principal amount (loan amount), Interest rate (annual percentage), and Loan tenure (repayment period in years)."
      },
      {
        question: "Can I reduce my EMI amount?",
        answer: "Yes, you can reduce EMI by: choosing a longer loan tenure, maintaining a good credit score, negotiating lower interest rates, or making a larger down payment."
      }
    ];

    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqData.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };
  }

  shouldShowMoreButtonForSEO(): boolean {
    return !this.isSEOLoanTypesExpanded && this.seoLoanTypes.length > this.defaultVisibleSEOLoanTypes;
  }

  toggleSEOLoanTypesExpansion() {
    this.isSEOLoanTypesExpanded = !this.isSEOLoanTypesExpanded;
    this.cd.markForCheck();
  }

  getSEOMoreButtonText() {
    return this.isSEOLoanTypesExpanded ? 'Show Less' : 'Show More';
  }

  getSEOMoreButtonIcon() {
    return this.isSEOLoanTypesExpanded ? '▲' : '▼';
  }

  trackByLoanType(index: number, loanType: any): string {
    return loanType.title;
  }
  
  onLoanTypeChange(index: number) {
    this.loader.show();
    this.selectedLoanTypeIndex = index;
    const selected = this.loanTypes[index];
    if (selected?.interest) {
      this.interestRate = selected.interest;
      this.interestForm.setValue(this.formatInputValue(this.interestRate), { emitEvent: false });  // updates the input field
      this.calculateEMI();
      this.cd.markForCheck();
      setTimeout(() => {
        this.loader.hide();
        }, 100);
    }
  }
  
  // loanTypes = [ 
  //   { value: 'home', viewValue: 'Home Loan', interest: 8.5, icon: 'home' },
  //   { value: 'car', viewValue: 'Car Loan', interest: 9.2, icon: 'directions_car' },
  //   { value: 'personal', viewValue: 'Personal Loan', interest: 11.75, icon: 'person' },
  //   { value: 'education', viewValue: 'Education Loan', interest: 7.8, icon: 'school' },
  //   { value: 'gold', viewValue: 'Gold Loan', interest: 10.5, icon: 'emoji_events' },
  //   { value: 'mortgage', viewValue: 'Mortgage Loan', interest: 9.8, icon: 'apartment' },
  //   { value: 'twoWheeler', viewValue: 'Two-Wheeler Loan', interest: 10.2, icon: 'two_wheeler' },
  //   { value: 'agriculture', viewValue: 'Agriculture Loan', interest: 6.5, icon: 'agriculture' },
  //   { value: 'creditCard', viewValue: 'Credit Card Loan', interest: 15.5, icon: 'credit_card' },
  //   { value: 'overdraft', viewValue: 'Overdraft Loan', interest: 13.0, icon: 'swap_horiz' },
  //   { value: 'consumerDurable', viewValue: 'Consumer Durable Loan', interest: 9.9, icon: 'devices' },
  //   { value: 'travel', viewValue: 'Travel Loan', interest: 12.75, icon: 'flight_takeoff' },
  //   { value: 'lap', viewValue: 'Loan Against Property', interest: 9.5, icon: 'location_city' },
  //   { value: 'business', viewValue: 'Business Loan', interest: 12.0, icon: 'business_center' }
  // ];

  loanTypes = [
    { value: 'personal', viewValue: 'Personal Loan', interest: 11.75, icon: '💼' },
    { value: 'home', viewValue: 'Home Loan', interest: 8.5, icon: '🏠' },
    { value: 'gold', viewValue: 'Gold Loan', interest: 10.5, icon: '🥇' },
    { value: 'car', viewValue: 'Car Loan', interest: 9.2, icon: '🚗' },
    { value: 'education', viewValue: 'Education Loan', interest: 7.8, icon: '🎓' },
    { value: 'twoWheeler', viewValue: 'Two-Wheeler Loan', interest: 10.2, icon: '🏍️' },
    { value: 'business', viewValue: 'Business Loan', interest: 12.0, icon: '🏢' },
    { value: 'agriculture', viewValue: 'Agriculture Loan', interest: 6.5, icon: '🌾' },
    { value: 'homeRenovation', viewValue: 'Home Renovation Loan', interest: 10.5, icon: '🔨' },
    { value: 'property', viewValue: 'Loan Against Property', interest: 9.5, icon: '🏘️' },
    { value: 'mortgage', viewValue: 'Mortgage Loan', interest: 9.8, icon: '🔑' },
    { value: 'wedding', viewValue: 'Wedding Loan', interest: 12.5, icon: '💒' },
    { value: 'medical', viewValue: 'Medical Loan', interest: 11.0, icon: '🏥' },
    { value: 'emergency', viewValue: 'Emergency Loan', interest: 14.0, icon: '🚨' },
    { value: 'payday', viewValue: 'Payday Loan', interest: 18.0, icon: '📅' },
    { value: 'creditCard', viewValue: 'Credit Card Loan', interest: 15.5, icon: '💳' },
    { value: 'workingCapital', viewValue: 'Working Capital Loan', interest: 12.8, icon: '💰' },
    { value: 'msme', viewValue: 'MSME Loan', interest: 11.5, icon: '🏭' },
    { value: 'homeConstruction', viewValue: 'Home Construction Loan', interest: 9.2, icon: '🏗️' },
    { value: 'commercialVehicle', viewValue: 'Commercial Vehicle Loan', interest: 11.5, icon: '🚛' },
    { value: 'consumerDurable', viewValue: 'Consumer Durable Loan', interest: 9.9, icon: '📱' },
    { value: 'vacation', viewValue: 'Vacation Loan', interest: 13.0, icon: '✈️' },
    { value: 'travel', viewValue: 'Travel Loan', interest: 12.75, icon: '🌍' },
    { value: 'startup', viewValue: 'Startup Loan', interest: 13.5, icon: '🚀' },
    { value: 'equipment', viewValue: 'Equipment Loan', interest: 11.2, icon: '⚙️' },
    { value: 'inventory', viewValue: 'Inventory Loan', interest: 12.5, icon: '📦' },
    { value: 'kisanCredit', viewValue: 'Kisan Credit Card Loan', interest: 5.8, icon: '🌱' },
    { value: 'dairy', viewValue: 'Dairy Loan', interest: 7.2, icon: '🐄' },
    { value: 'poultry', viewValue: 'Poultry Loan', interest: 7.5, icon: '🐔' },
    { value: 'fishery', viewValue: 'Fishery Loan', interest: 7.8, icon: '🐟' },
    { value: 'horticulture', viewValue: 'Horticulture Loan', interest: 8.0, icon: '🌺' },
    { value: 'tax', viewValue: 'Tax Payment Loan', interest: 12.5, icon: '📊' },
    { value: 'legal', viewValue: 'Legal Expenses Loan', interest: 13.5, icon: '⚖️' },
    { value: 'tradeFinance', viewValue: 'Trade Finance Loan', interest: 10.8, icon: '🌐' },
    { value: 'invoice', viewValue: 'Invoice Financing', interest: 13.2, icon: '📄' },
    { value: 'rv', viewValue: 'RV Loan', interest: 11.8, icon: '🚐' },
    { value: 'boat', viewValue: 'Boat Loan', interest: 12.0, icon: '⛵' },
    { value: 'plotPurchase', viewValue: 'Plot Purchase Loan', interest: 11.0, icon: '📐' },
    { value: 'overdraft', viewValue: 'Overdraft Loan', interest: 13.0, icon: '📈' }
  ];

  // SEO Loan Types data for the Types of Loans Section
  seoLoanTypes = [
    { title: '🏠 Home Loan EMI Calculator', description: 'Calculate monthly EMI for home loans with competitive interest rates starting from 8.5% p.a. Our calculator considers processing fees and helps you plan your home purchase budget.' },
    { title: '🚗 Car Loan EMI Calculator', description: 'Plan your car purchase with our car loan EMI calculator. Get instant EMI calculations for new and used car loans with interest rates from 9.2% p.a.' },
    { title: '👤 Personal Loan EMI Calculator', description: 'Calculate EMI for personal loans used for medical emergencies, education, travel, or any personal needs. Interest rates typically range from 11.75% p.a.' },
    { title: '🎓 Education Loan EMI Calculator', description: 'Plan your education financing with our education loan calculator. Calculate EMI for domestic and international education loans with rates from 7.8% p.a.' },
    { title: '🥇 Gold Loan EMI Calculator', description: 'Calculate EMI for gold loans with competitive interest rates starting from 10.5% p.a. Quick disbursal and minimal documentation required.' },
    { title: '🏢 Business Loan EMI Calculator', description: 'Plan your business expansion with our business loan EMI calculator. Calculate EMI for working capital, equipment financing, and business expansion loans.' },
    { title: '🏍️ Two Wheeler Loan EMI Calculator', description: 'Calculate EMI for two-wheeler loans with competitive interest rates from 10.2% p.a. Quick approval and minimal documentation for bike and scooter financing.' },
    { title: '🌾 Agriculture Loan EMI Calculator', description: 'Plan your agricultural investments with our agriculture loan calculator. Calculate EMI for farming equipment, crop loans, and agricultural development with rates from 6.5% p.a.' },
    { title: '🔨 Home Renovation Loan EMI Calculator', description: 'Calculate EMI for home renovation and improvement loans. Interest rates start from 10.5% p.a. for upgrading your existing home.' },
    { title: '🏢 Property Loan EMI Calculator', description: 'Calculate EMI for loans against property with competitive rates from 9.5% p.a. Use your property as collateral for business or personal needs.' },
    { title: '🏢 Mortgage Loan EMI Calculator', description: 'Calculate EMI for mortgage loans with rates from 9.8% p.a. Secure financing using your property as security for various financial needs.' },
    { title: '💒 Wedding Loan EMI Calculator', description: 'Plan your dream wedding with our wedding loan calculator. Calculate EMI for wedding expenses with interest rates from 12.5% p.a.' },
    { title: '🏥 Medical Loan EMI Calculator', description: 'Calculate EMI for medical loans and healthcare financing. Interest rates start from 11.0% p.a. for medical emergencies and treatments.' },
    { title: '🚨 Emergency Loan EMI Calculator', description: 'Calculate EMI for emergency loans with quick disbursal. Interest rates from 14.0% p.a. for urgent financial needs and emergencies.' },
    { title: '💰 Payday Loan EMI Calculator', description: 'Calculate EMI for short-term payday loans with rates from 18.0% p.a. Quick cash for immediate financial needs.' },
    { title: '💳 Credit Card Loan EMI Calculator', description: 'Convert credit card outstanding to EMI with rates from 15.5% p.a. Manage your credit card debt with structured repayment.' },
    { title: '💼 Working Capital Loan EMI Calculator', description: 'Calculate EMI for working capital loans with rates from 12.8% p.a. Finance your business operations and working capital needs.' },
    { title: '🏭 MSME Loan EMI Calculator', description: 'Calculate EMI for MSME loans with rates from 11.5% p.a. Support for micro, small, and medium enterprises.' },
    { title: '🏗️ Home Construction Loan EMI Calculator', description: 'Calculate EMI for home construction loans with rates from 9.2% p.a. Build your dream home with structured financing.' },
    { title: '🚛 Commercial Vehicle Loan EMI Calculator', description: 'Calculate EMI for commercial vehicle loans with rates from 11.5% p.a. Finance trucks, buses, and commercial vehicles.' },
    { title: '📱 Consumer Durable Loan EMI Calculator', description: 'Calculate EMI for consumer durable loans with rates from 9.9% p.a. Finance electronics, appliances, and consumer goods.' },
    { title: '✈️ Vacation Loan EMI Calculator', description: 'Calculate EMI for vacation and travel loans with rates from 13.0% p.a. Plan your dream vacation with easy financing.' },
    { title: '💡 Startup Loan EMI Calculator', description: 'Calculate EMI for startup loans with rates from 13.5% p.a. Finance your business idea and entrepreneurial journey.' },
    { title: '⚙️ Equipment Loan EMI Calculator', description: 'Calculate EMI for equipment financing with rates from 11.2% p.a. Finance machinery and equipment for business growth.' },
    { title: '📦 Inventory Loan EMI Calculator', description: 'Calculate EMI for inventory financing with rates from 12.5% p.a. Finance stock and inventory for your business.' },
    { title: '🌱 Kisan Credit Card Loan EMI Calculator', description: 'Calculate EMI for Kisan Credit Card loans with rates from 5.8% p.a. Special financing for farmers and agricultural activities.' },
    { title: '🐄 Dairy Loan EMI Calculator', description: 'Calculate EMI for dairy farming loans with rates from 7.2% p.a. Finance dairy business and cattle farming.' },
    { title: '🥚 Poultry Loan EMI Calculator', description: 'Calculate EMI for poultry farming loans with rates from 7.5% p.a. Finance poultry business and bird farming.' },
    { title: '🐟 Fishery Loan EMI Calculator', description: 'Calculate EMI for fishery loans with rates from 7.8% p.a. Finance fish farming and aquaculture business.' },
    { title: '🌺 Horticulture Loan EMI Calculator', description: 'Calculate EMI for horticulture loans with rates from 8.0% p.a. Finance flower farming and horticultural activities.' },
    { title: '📊 Tax Payment Loan EMI Calculator', description: 'Calculate EMI for tax payment loans with rates from 12.5% p.a. Finance tax payments and avoid penalties.' },
    { title: '⚖️ Legal Expenses Loan EMI Calculator', description: 'Calculate EMI for legal expense loans with rates from 13.5% p.a. Finance legal proceedings and court cases.' },
    { title: '🌍 Trade Finance Loan EMI Calculator', description: 'Calculate EMI for trade finance loans with rates from 10.8% p.a. Finance international trade and import-export business.' },
    { title: '📄 Invoice Financing EMI Calculator', description: 'Calculate EMI for invoice financing with rates from 13.2% p.a. Convert your invoices to immediate cash flow.' },
    { title: '🚐 RV Loan EMI Calculator', description: 'Calculate EMI for RV and motorhome loans with rates from 11.8% p.a. Finance your recreational vehicle purchase.' },
    { title: '⛵ Boat Loan EMI Calculator', description: 'Calculate EMI for boat and marine loans with rates from 12.0% p.a. Finance your boat purchase and marine adventures.' },
    { title: '🏞️ Plot Purchase Loan EMI Calculator', description: 'Calculate EMI for plot purchase loans with rates from 11.0% p.a. Finance land and plot purchases for future development.' },
    { title: '💱 Overdraft Loan EMI Calculator', description: 'Calculate EMI for overdraft loans with rates from 13.0% p.a. Flexible credit facility for business and personal needs.' }
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

  // Form controls for inputs
  amountForm = new FormControl(this.formatInputValue(this.amount));
  interestForm = new FormControl(this.formatInputValue(this.interestRate));
  yearsForm = new FormControl(this.formatInputValue(this.years));

  // Flags to prevent subscription interference
  private isUpdatingFromProgressBar = false;

  public cd = inject(ChangeDetectorRef);

  ngOnInit() {
    this.onLoanTypeChange(0);
    this.calculateDefaultVisibleLoanTypes();
    // Initialize form controls with formatted values
    this.amountForm.setValue(this.formatInputValue(this.amount));
    this.interestForm.setValue(this.formatInputValue(this.interestRate));
    this.yearsForm.setValue(this.formatInputValue(this.years));
    
    // Ensure SEO content is accessible to search engines
    this.ensureSEOContentAccessibility();

    // Subscribe to form control changes
    this.amountForm.valueChanges.subscribe(
      (value) => {
        if (value && !this.isUpdatingFromProgressBar) {
          const numericValue = this.parseInputValue(value);
          if (numericValue > 0) {
            this.amount = numericValue;
            this.cd.markForCheck();
          }
        }
      }
    );

    this.interestForm.valueChanges.subscribe(
      (value) => {
        if (value && !this.isUpdatingFromProgressBar) {
          const numericValue = this.parseInputValue(value);
          if (numericValue > 0) {
            this.interestRate = numericValue;
            this.cd.markForCheck();
          }
        }
      }
    );

    this.yearsForm.valueChanges.subscribe(
      (value) => {
        if (value && !this.isUpdatingFromProgressBar) {
          const numericValue = this.parseInputValue(value);
          if (numericValue > 0) {
            this.years = numericValue;
            this.cd.markForCheck();
          }
        }
      }
    );

    // Initial calculation
    this.calculateEMI();
    
    // Update meta tags for EMI calculator
    this.updateMetaTags();
    
    // Inject additional structured data for loan types and FAQ
    this.injectAdditionalStructuredData();
  }

  private updateMetaTags(): void {
    const currentUrl = `${window.location.origin}${this.router.url}`;
    const calculatorType: CalculatorType = 'emi-calculator';
    const metaTags = this.metaTagsService.generateCalculatorMetaTags(calculatorType, currentUrl);
    this.metaTagsService.updateMetaTags(metaTags);
    
    // Add enhanced structured data for EMI calculator
    const enhancedStructuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "EMI Calculator - Calculate Monthly Loan Installments",
      "description": "Free EMI Calculator for all types of loans including home loan, car loan, personal loan, business loan, education loan, gold loan and more. Get complete repayment schedule, interest breakdown, and download detailed reports.",
      "url": currentUrl,
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "INR",
        "description": "Free EMI Calculator Tool"
      },
      "featureList": [
        "35+ Loan Types",
        "Instant EMI Calculation",
        "Yearly and Monthly Breakdown",
        "Excel and PDF Export",
        "Interactive Charts",
        "Mobile Responsive"
      ],
      "screenshot": `${window.location.origin}/assets/images/calculator.png`,
      "softwareVersion": "2.0",
      "author": {
        "@type": "Organization",
        "name": "Tech Trends Talks",
        "url": "https://techtrendstalks.com"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Tech Trends Talks",
        "url": "https://techtrendstalks.com"
      },
      "mainEntity": {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How accurate is the EMI calculator?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Our EMI calculator provides highly accurate results using the standard EMI formula. The calculations include principal, interest, and processing fees to give you the most realistic EMI amount."
            }
          },
          {
            "@type": "Question",
            "name": "What factors affect my EMI amount?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "EMI amount depends on three main factors: Principal amount (loan amount), Interest rate (annual percentage), and Loan tenure (repayment period in years)."
            }
          },
          {
            "@type": "Question",
            "name": "Can I reduce my EMI amount?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, you can reduce EMI by: choosing a longer loan tenure, maintaining a good credit score, negotiating lower interest rates, or making a larger down payment."
            }
          },
          {
            "@type": "Question",
            "name": "How do I download my EMI calculation report?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "After calculating EMI, use the 'Export to Excel' or 'Export to PDF' buttons to download detailed reports with yearly and monthly breakdowns."
            }
          }
        ]
      },
      "potentialAction": {
        "@type": "UseAction",
        "target": currentUrl,
        "description": "Calculate EMI for various loan types"
      }
    };
    
    // Add the enhanced structured data
    this.structuredDataService.addStructuredData(enhancedStructuredData);
    
    // Add additional meta tags for better SEO
    const additionalMetaTags = [
      { name: 'keywords', content: 'EMI Calculator, Loan Calculator, Home Loan EMI, Car Loan EMI, Personal Loan EMI, Business Loan EMI, Education Loan EMI, Gold Loan EMI, Free EMI Calculator, Monthly Installment Calculator, Loan Repayment Calculator, Indian EMI Calculator, Rupee EMI Calculator' },
      { name: 'author', content: 'Tech Trends Talks' },
      { name: 'robots', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
      { name: 'googlebot', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
      { name: 'bingbot', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'EMI Calculator - Calculate Monthly Loan Installments | Tech Trends Talks' },
      { property: 'og:description', content: 'Free EMI Calculator for all types of loans including home loan, car loan, personal loan, business loan, education loan, gold loan and more. Get complete repayment schedule and download reports.' },
      { property: 'og:url', content: currentUrl },
      { property: 'og:site_name', content: 'Tech Trends Talks' },
      { property: 'og:image', content: `${window.location.origin}/assets/images/calculator.png` },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:locale', content: 'en_US' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'EMI Calculator - Calculate Monthly Loan Installments' },
      { name: 'twitter:description', content: 'Free EMI Calculator for all types of loans. Get complete repayment schedule, interest breakdown, and download detailed reports in Excel and PDF formats.' },
      { name: 'twitter:image', content: `${window.location.origin}/assets/images/calculator.png` },
      { name: 'twitter:site', content: '@techtrendstalks' },
      { name: 'canonical', content: currentUrl },
      { name: 'language', content: 'English' },
      { name: 'geo.region', content: 'IN' },
      { name: 'geo.placename', content: 'India' },
      { name: 'geo.position', content: '20.5937;78.9629' },
      { name: 'ICBM', content: '20.5937, 78.9629' }
    ];
    
    // Update meta tags with additional ones
    additionalMetaTags.forEach(tag => {
      if ('property' in tag && tag.property) {
        this.meta.updateTag({ property: tag.property, content: tag.content });
      } else if ('name' in tag && tag.name) {
        this.meta.updateTag({ name: tag.name, content: tag.content });
      }
    });
  }

  // Inject additional structured data for SEO
  private injectAdditionalStructuredData() {
    // Inject loan types structured data
    const loanTypesData = this.generateLoanTypesStructuredData();
    this.structuredDataService.addStructuredData(loanTypesData);
    
    // Inject FAQ structured data
    const faqData = this.generateFAQStructuredData();
    this.structuredDataService.addStructuredData(faqData);
  }

  // Ensure SEO content is accessible to search engines
  private ensureSEOContentAccessibility() {
    // Temporarily expand all loan types to ensure search engines can crawl them
    // This happens after the page loads but before user interaction
    setTimeout(() => {
      // Force load all loan types for SEO indexing
      this.isSEOLoanTypesExpanded = true;
      this.cd.markForCheck();
      
      // Collapse back for user experience after a brief moment
      setTimeout(() => {
        this.isSEOLoanTypesExpanded = false;
        this.cd.markForCheck();
      }, 500);
    }, 1000);
  }

  
validateAmount() {
  const min = 10000;
  const max = 1000000000;

  if (!this.amount || this.amount < min || this.amount > max) {
    this.amount = min;
  } 
  
  this.amountForm.setValue(this.formatInputValue(this.amount), { emitEvent: false });
  this.amountForm.updateValueAndValidity();
  this.cd.markForCheck();
  this.calculateEMI();
}

  validateTenure() {
    const min = 1;
    const max = 50;
    if (!this.years || this.years < min || this.years > max) {
      this.yearsForm.setValue(this.formatInputValue(min), { emitEvent: false });
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
      this.interestForm.setValue(this.formatInputValue(8), { emitEvent: false });
      this.interestForm.updateValueAndValidity();
      this.interestRate = 8;
      this.cd.markForCheck();
    }
    this.calculateEMI();
  }

  priceProgressChange(value: number, mode: string) {
    // Set flag to prevent subscription interference
    this.isUpdatingFromProgressBar = true;
    
    if (mode === 'PRICE') {
      this.amount = value;
      this.amountForm.setValue(this.formatInputValue(value), { emitEvent: false });
      this.amountForm.updateValueAndValidity();
    } else if (mode === 'TENURE') {
      const min = Math.max(1, Math.min(50, value));
      this.years = min;
      this.yearsForm.setValue(this.formatInputValue(min), { emitEvent: false });
      this.yearsForm.updateValueAndValidity();
    } else if (mode === 'PERCENTAGE') {
      // Use the actual value from progress bar instead of hardcoding to 8
      this.interestRate = value;
      this.interestForm.setValue(this.formatInputValue(value), { emitEvent: false });
      this.interestForm.updateValueAndValidity();
    }
    
    // Reset flag after a short delay to allow form control updates
    setTimeout(() => {
      this.isUpdatingFromProgressBar = false;
    }, 100);
    
    // Trigger change detection to update the UI
    this.cd.markForCheck();
    
    // Calculate EMI with new values
    this.calculateEMI();
  }

  calculateLoanEMI(){
     this.loader.show();
     this.calculateEMI();
      setTimeout(() => {
      this.loader.hide();
      }, 100);  
  }

  calculateEMI() {
   
    if (this.amount > 0 && this.interestRate > 0 && this.years > 0) {
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
      
      this.cd.markForCheck();
    }
   
  }

  calculateYearlyEMI(principal: number, totalMonths: number, monthlyInterest: number) {
    this.scheduleYears = [];
    this.yearlySchedule = [];
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
      const yearMonths: any[] = [];
  
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
  
        // Store monthly details for this year
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                           "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthLabel = `${monthNames[month - 1]} ${year}`;
        
        yearMonths.push({
          month: monthsProcessed,
          monthLabel: monthLabel,
          emi: this.truncateToTwoDecimals(this.emi),
          principal: this.truncateToTwoDecimals(principalPaid),
          interest: this.truncateToTwoDecimals(interest),
          balance: balance > 0 ? this.truncateToTwoDecimals(balance) : '0.00'
        });
      }
  
      const yearlyEmi = this.emi * monthsInYear;
  
      this.scheduleYears.push({
        year: year,
        emi: this.truncateToTwoDecimals(yearlyEmi),
        principal: this.truncateToTwoDecimals(yearlyPrincipal),
        interest: this.truncateToTwoDecimals(yearlyInterest),
        balance: balance > 0 ? this.truncateToTwoDecimals(balance) : '0.00'
      });

      // Store yearly schedule with monthly details
      this.yearlySchedule.push({
        year: year,
        yearlyData: {
          emi: this.truncateToTwoDecimals(yearlyEmi),
          principal: this.truncateToTwoDecimals(yearlyPrincipal),
          interest: this.truncateToTwoDecimals(yearlyInterest),
          balance: balance > 0 ? this.truncateToTwoDecimals(balance) : '0.00'
        },
        monthlyDetails: yearMonths,
        isExpanded: false
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
        emi: this.truncateToTwoDecimals(this.emi),             // Monthly EMI
        principal: this.truncateToTwoDecimals(principalPaid),
        interest: this.truncateToTwoDecimals(interest),
        balance: balance > 0 ? this.truncateToTwoDecimals(balance) : '0.00'
      });
    }
  }




  // Export to Excel with enhanced design
  exportToExcel() {
    // Create workbook with multiple sheets
    const wb = XLSX.utils.book_new();

    // Yearly Summary Sheet
    const yearlyData = this.yearlySchedule.map(yearData => ({
      'Year': yearData.year,
      'Total EMI': Number(yearData.yearlyData.emi),
      'Principal Paid': Number(yearData.yearlyData.principal),
      'Interest Paid': Number(yearData.yearlyData.interest),
      'Remaining Balance': Number(yearData.yearlyData.balance)
    }));

    // Create structured yearly sheet data
    const yearlySheetData = [
      // App Headings Section
      { 'A': 'TECH TRENDS TALKS' },
      { 'A': 'EMI Calculator - Professional Report' },
      { 'A': '' },
      { 'A': '' },
      
      // Loan Summary Section
      { 'A': 'LOAN SUMMARY' },
      { 'A': 'Description', 'B': 'Amount' },
      { 'A': 'Loan Amount', 'B': Number(this.pricipalAmount) },
      { 'A': 'Interest Rate (%)', 'B': Number(this.interestRate) },
      { 'A': 'Loan Tenure (Years)', 'B': Number(this.years) },
      { 'A': 'Monthly EMI', 'B': Number(this.emi) },
      { 'A': 'Total Interest', 'B': Number(this.totalInterest) },
      { 'A': 'Total Payment', 'B': Number(this.totalPayment) },
      { 'A': '' },
      { 'A': '' },
      
      // EMI Statement Headers
      { 'A': 'YEARLY EMI STATEMENT' },
      { 'A': 'Year', 'B': 'Total EMI', 'C': 'Principal Paid', 'D': 'Interest Paid', 'E': 'Remaining Balance' },
      
      // Yearly Data
      ...yearlyData.map(item => ({
        'A': item['Year'],
        'B': item['Total EMI'],
        'C': item['Principal Paid'],
        'D': item['Interest Paid'],
        'E': item['Remaining Balance']
      }))
    ];

    const yearlyWs = XLSX.utils.json_to_sheet(yearlySheetData);
    
    // Style the yearly sheet
    this.styleExcelSheet(yearlyWs, 'Yearly Summary');
    XLSX.utils.book_append_sheet(wb, yearlyWs, 'Yearly Summary');

    // Monthly Details Sheet
    const monthlyData = this.schedule.map(item => ({
      'Month': item.month,
      'Month Label': item.monthLabel,
      'EMI': Number(item.emi),
      'Principal': Number(item.principal),
      'Interest': Number(item.interest),
      'Balance': Number(item.balance)
    }));

    // Create structured monthly sheet data
    const monthlySheetData = [
      // App Headings Section
      { 'A': 'TECH TRENDS TALKS' },
      { 'A': 'EMI Calculator - Monthly Details Report' },
      { 'A': '' },
      { 'A': '' },
      
      // Loan Summary Section
      { 'A': 'LOAN SUMMARY' },
      { 'A': 'Description', 'B': 'Amount' },
      { 'A': 'Loan Amount', 'B': Number(this.pricipalAmount) },
      { 'A': 'Interest Rate (%)', 'B': Number(this.interestRate) },
      { 'A': 'Loan Tenure (Years)', 'B': Number(this.years) },
      { 'A': 'Monthly EMI', 'B': Number(this.emi) },
      { 'A': 'Total Interest', 'B': Number(this.totalInterest) },
      { 'A': 'Total Payment', 'B': Number(this.totalPayment) },
      { 'A': '' },
      { 'A': '' },
      
      // EMI Statement Headers
      { 'A': 'MONTHLY EMI STATEMENT' },
      { 'A': 'Month', 'B': 'Month Label', 'C': 'EMI', 'D': 'Principal', 'E': 'Interest', 'F': 'Balance' },
      
      // Monthly Data
      ...monthlyData.map(item => ({
        'A': item['Month'],
        'B': item['Month Label'],
        'C': item['EMI'],
        'D': item['Principal'],
        'E': item['Interest'],
        'F': item['Balance']
      }))
    ];

    const monthlyWs = XLSX.utils.json_to_sheet(monthlySheetData);
    
    // Style the monthly sheet
    this.styleExcelSheet(monthlyWs, 'Monthly Details');
    XLSX.utils.book_append_sheet(wb, monthlyWs, 'Monthly Details');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `TechTrendsTalks_EMI_Report_${timestamp}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, filename);
  }

  // Style Excel sheet with better design
  private styleExcelSheet(worksheet: XLSX.WorkSheet, sheetName: string) {
    // Set column widths
    const colWidths = sheetName === 'Yearly Summary' 
      ? [{ wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 25 }]
      : [{ wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];

    worksheet['!cols'] = colWidths;

    // Get the range of the worksheet
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    // Define styles with better colors and formatting
    const brandTitleStyle = {
      font: { bold: true, size: 18, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '1A237E' } }, // Deep blue background
      alignment: { horizontal: 'center', vertical: 'center' }
    };

    const subtitleStyle = {
      font: { bold: true, size: 14, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '303F9F' } }, // Medium blue background
      alignment: { horizontal: 'center', vertical: 'center' }
    };

    const sectionTitleStyle = {
      font: { bold: true, size: 16, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '1976D2' } }, // Blue background
      alignment: { horizontal: 'left', vertical: 'center' }
    };

    const loanSummaryHeaderStyle = {
      font: { bold: true, size: 12, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '42A5F5' } }, // Light blue background
      alignment: { horizontal: 'left', vertical: 'center' },
      border: {
        top: { style: 'medium', color: { rgb: '1976D2' } },
        bottom: { style: 'medium', color: { rgb: '1976D2' } },
        left: { style: 'medium', color: { rgb: '1976D2' } },
        right: { style: 'medium', color: { rgb: '1976D2' } }
      }
    };

    const loanSummaryValueStyle = {
      font: { bold: true, size: 12, color: { rgb: '1A237E' } },
      fill: { fgColor: { rgb: 'E3F2FD' } }, // Very light blue background
      alignment: { horizontal: 'right', vertical: 'center' },
      border: {
        top: { style: 'medium', color: { rgb: '1976D2' } },
        bottom: { style: 'medium', color: { rgb: '1976D2' } },
        left: { style: 'medium', color: { rgb: '1976D2' } },
        right: { style: 'medium', color: { rgb: '1976D2' } }
      }
    };

    const statementTitleStyle = {
      font: { bold: true, size: 16, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '388E3C' } }, // Green background
      alignment: { horizontal: 'left', vertical: 'center' }
    };

    const dataHeaderStyle = {
      font: { bold: true, size: 12, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '388E3C' } }, // Green background
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thick', color: { rgb: '2E7D32' } },
        bottom: { style: 'thick', color: { rgb: '2E7D32' } },
        left: { style: 'thick', color: { rgb: '2E7D32' } },
        right: { style: 'thick', color: { rgb: '2E7D32' } }
      }
    };

    const dataRowStyle = {
      font: { size: 11, color: { rgb: '212121' } },
      fill: { fgColor: { rgb: 'F5F5F5' } }, // Light gray background
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: 'E0E0E0' } },
        bottom: { style: 'thin', color: { rgb: 'E0E0E0' } },
        left: { style: 'thin', color: { rgb: 'E0E0E0' } },
        right: { style: 'thin', color: { rgb: 'E0E0E0' } }
      }
    };

    const amountRowStyle = {
      font: { size: 11, color: { rgb: '212121' } },
      fill: { fgColor: { rgb: 'F5F5F5' } }, // Light gray background
      alignment: { horizontal: 'right', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: 'E0E0E0' } },
        bottom: { style: 'thin', color: { rgb: 'E0E0E0' } },
        left: { style: 'thin', color: { rgb: 'E0E0E0' } },
        right: { style: 'thin', color: { rgb: 'E0E0E0' } }
      }
    };

    const alternateRowStyle = {
      font: { size: 11, color: { rgb: '212121' } },
      fill: { fgColor: { rgb: 'FFFFFF' } }, // White background
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: 'E0E0E0' } },
        bottom: { style: 'thin', color: { rgb: 'E0E0E0' } },
        left: { style: 'thin', color: { rgb: 'E0E0E0' } },
        right: { style: 'thin', color: { rgb: 'E0E0E0' } }
      }
    };

    const alternateAmountRowStyle = {
      font: { size: 11, color: { rgb: '212121' } },
      fill: { fgColor: { rgb: 'FFFFFF' } }, // White background
      alignment: { horizontal: 'right', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: 'E0E0E0' } },
        bottom: { style: 'thin', color: { rgb: 'E0E0E0' } },
        left: { style: 'thin', color: { rgb: 'E0E0E0' } },
        right: { style: 'thin', color: { rgb: 'E0E0E0' } }
      }
    };

    // Apply styles and merge cells safely
    if (sheetName === 'Yearly Summary') {
      // App Headings Section (Rows 1-4)
      // Row 1: Brand Title
      const brandCell = XLSX.utils.encode_cell({ r: 0, c: 0 });
      if (worksheet[brandCell]) {
        worksheet[brandCell].s = brandTitleStyle;
      }
      worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];

      // Row 2: Subtitle
      const subtitleCell = XLSX.utils.encode_cell({ r: 1, c: 0 });
      if (worksheet[subtitleCell]) {
        worksheet[subtitleCell].s = subtitleStyle;
      }
      worksheet['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 4 } });

      // Rows 3-4: Empty spacing
      for (let i = 2; i <= 3; i++) {
        const emptyCell = XLSX.utils.encode_cell({ r: i, c: 0 });
        if (worksheet[emptyCell]) {
          worksheet[emptyCell].s = { fill: { fgColor: { rgb: 'FFFFFF' } } };
        }
      }

      // Loan Summary Section (Rows 5-16)
      // Row 5: Section Title
      const summaryTitleCell = XLSX.utils.encode_cell({ r: 4, c: 0 });
      if (worksheet[summaryTitleCell]) {
        worksheet[summaryTitleCell].s = sectionTitleStyle;
      }
      worksheet['!merges'].push({ s: { r: 4, c: 0 }, e: { r: 4, c: 4 } });

      // Row 6: Table Headers
      const descHeaderCell = XLSX.utils.encode_cell({ r: 5, c: 0 });
      const amountHeaderCell = XLSX.utils.encode_cell({ r: 5, c: 1 });
      if (worksheet[descHeaderCell]) {
        worksheet[descHeaderCell].s = loanSummaryHeaderStyle;
      }
      if (worksheet[amountHeaderCell]) {
        worksheet[amountHeaderCell].s = loanSummaryHeaderStyle;
      }
      worksheet['!merges'].push({ s: { r: 5, c: 1 }, e: { r: 5, c: 4 } });

      // Rows 7-12: Loan Summary Details
      for (let i = 6; i <= 11; i++) {
        const descCell = XLSX.utils.encode_cell({ r: i, c: 0 });
        const amountCell = XLSX.utils.encode_cell({ r: i, c: 1 });
        
        if (worksheet[descCell]) {
          worksheet[descCell].s = loanSummaryHeaderStyle;
        }
        if (worksheet[amountCell]) {
          worksheet[amountCell].s = loanSummaryValueStyle;
        }
      }

      // Rows 13-14: Empty spacing
      for (let i = 12; i <= 13; i++) {
        const emptyCell = XLSX.utils.encode_cell({ r: i, c: 0 });
        if (worksheet[emptyCell]) {
          worksheet[emptyCell].s = { fill: { fgColor: { rgb: 'FFFFFF' } } };
        }
      }

      // EMI Statement Section (Rows 15 onwards)
      // Row 15: Statement Title
      const statementTitleCell = XLSX.utils.encode_cell({ r: 14, c: 0 });
      if (worksheet[statementTitleCell]) {
        worksheet[statementTitleCell].s = statementTitleStyle;
      }
      worksheet['!merges'].push({ s: { r: 14, c: 0 }, e: { r: 14, c: 4 } });

      // Row 16: Data Headers
      const headerRow = 15;
      for (let j = 0; j < 5; j++) {
        const cellRef = XLSX.utils.encode_cell({ r: headerRow, c: j });
        if (worksheet[cellRef]) {
          worksheet[cellRef].s = dataHeaderStyle;
        }
      }

      // Data Rows (Row 17 onwards) - Alternating colors
      for (let i = 16; i <= range.e.r; i++) {
        const isAlternate = (i - 16) % 2 === 1;
        for (let j = 0; j < 5; j++) {
          const cellRef = XLSX.utils.encode_cell({ r: i, c: j });
          if (worksheet[cellRef]) {
            if (j === 0) {
              worksheet[cellRef].s = isAlternate ? alternateRowStyle : dataRowStyle;
            } else {
              worksheet[cellRef].s = isAlternate ? alternateAmountRowStyle : amountRowStyle;
            }
          }
        }
      }

    } else {
      // Monthly Details Sheet
      // App Headings Section (Rows 1-4)
      // Row 1: Brand Title
      const brandCell = XLSX.utils.encode_cell({ r: 0, c: 0 });
      if (worksheet[brandCell]) {
        worksheet[brandCell].s = brandTitleStyle;
      }
      worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];

      // Row 2: Subtitle
      const subtitleCell = XLSX.utils.encode_cell({ r: 1, c: 0 });
      if (worksheet[subtitleCell]) {
        worksheet[subtitleCell].s = subtitleStyle;
      }
      worksheet['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 5 } });

      // Rows 3-4: Empty spacing
      for (let i = 2; i <= 3; i++) {
        const emptyCell = XLSX.utils.encode_cell({ r: i, c: 0 });
        if (worksheet[emptyCell]) {
          worksheet[emptyCell].s = { fill: { fgColor: { rgb: 'FFFFFF' } } };
        }
      }

      // Loan Summary Section (Rows 5-16)
      // Row 5: Section Title
      const summaryTitleCell = XLSX.utils.encode_cell({ r: 4, c: 0 });
      if (worksheet[summaryTitleCell]) {
        worksheet[summaryTitleCell].s = sectionTitleStyle;
      }
      worksheet['!merges'].push({ s: { r: 4, c: 0 }, e: { r: 4, c: 5 } });

      // Row 6: Table Headers
      const descHeaderCell = XLSX.utils.encode_cell({ r: 5, c: 0 });
      const amountHeaderCell = XLSX.utils.encode_cell({ r: 5, c: 1 });
      if (worksheet[descHeaderCell]) {
        worksheet[descHeaderCell].s = loanSummaryHeaderStyle;
      }
      if (worksheet[amountHeaderCell]) {
        worksheet[amountHeaderCell].s = loanSummaryHeaderStyle;
      }
      worksheet['!merges'].push({ s: { r: 5, c: 1 }, e: { r: 5, c: 5 } });

      // Rows 7-12: Loan Summary Details
      for (let i = 6; i <= 11; i++) {
        const descCell = XLSX.utils.encode_cell({ r: i, c: 0 });
        const amountCell = XLSX.utils.encode_cell({ r: i, c: 1 });
        
        if (worksheet[descCell]) {
          worksheet[descCell].s = loanSummaryHeaderStyle;
        }
        if (worksheet[amountCell]) {
          worksheet[amountCell].s = loanSummaryValueStyle;
        }
      }

      // Rows 13-14: Empty spacing
      for (let i = 12; i <= 13; i++) {
        const emptyCell = XLSX.utils.encode_cell({ r: i, c: 0 });
        if (worksheet[emptyCell]) {
          worksheet[emptyCell].s = { fill: { fgColor: { rgb: 'FFFFFF' } } };
        }
      }

      // EMI Statement Section (Rows 15 onwards)
      // Row 15: Statement Title
      const statementTitleCell = XLSX.utils.encode_cell({ r: 14, c: 0 });
      if (worksheet[statementTitleCell]) {
        worksheet[statementTitleCell].s = statementTitleStyle;
      }
      worksheet['!merges'].push({ s: { r: 14, c: 0 }, e: { r: 14, c: 5 } });

      // Row 16: Data Headers
      const headerRow = 15;
      for (let j = 0; j < 6; j++) {
        const cellRef = XLSX.utils.encode_cell({ r: headerRow, c: j });
        if (worksheet[cellRef]) {
          worksheet[cellRef].s = dataHeaderStyle;
        }
      }

      // Data Rows (Row 17 onwards) - Alternating colors
      for (let i = 16; i <= range.e.r; i++) {
        const isAlternate = (i - 16) % 2 === 1;
        for (let j = 0; j < 6; j++) {
          const cellRef = XLSX.utils.encode_cell({ r: i, c: j });
          if (worksheet[cellRef]) {
            if (j === 0 || j === 1) {
              worksheet[cellRef].s = isAlternate ? alternateRowStyle : dataRowStyle;
            } else {
              worksheet[cellRef].s = isAlternate ? alternateAmountRowStyle : amountRowStyle;
            }
          }
        }
      }
    }
  }

  // Enhanced PDF export with yearly and monthly data
  exportToEMIPdf() {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Header with site branding
    doc.setFillColor(44, 62, 80);
    doc.rect(0, 0, pageWidth, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('TECH TRENDS TALKS', pageWidth / 2, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('EMI Calculator - Complete Report', pageWidth / 2, 25, { align: 'center' });

    // Loan Summary Box
    doc.setFillColor(236, 240, 241);
    doc.roundedRect(12, 40, pageWidth - 24, 40, 2, 2, 'F'); // Increased height from 30 to 40
    
    doc.setTextColor(44, 62, 80);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Loan Summary', 14, 52);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text('Loan Amount:', 16, 62);
    doc.text('Interest Rate:', 16, 68);
    doc.text('Tenure:', 16, 74);
    
    doc.setFont('helvetica', 'bold');
    doc.text(`${this.currencyFormat(this.pricipalAmount)}`, 60, 62);
    doc.text(`${this.interestRate}%`, 60, 68);
    doc.text(`${this.years} years`, 60, 74);

    // Yearly Summary Table
    const yearlyTableBody = this.yearlySchedule.map(yearData => [
      yearData.year.toString(),
      this.currencyFormat(parseFloat(yearData.yearlyData.emi)),
      this.currencyFormat(parseFloat(yearData.yearlyData.principal)),
      this.currencyFormat(parseFloat(yearData.yearlyData.interest)),
      this.currencyFormat(parseFloat(yearData.yearlyData.balance))
    ]);

    autoTable(doc, {
      head: [['Year', 'Total EMI', 'Principal Paid', 'Interest Paid', 'Remaining Balance']],
      body: yearlyTableBody,
      startY: 90, // Adjusted from 80 to 90 to account for increased loan summary box height
      theme: 'grid',
      styles: {
        fontSize: 9,
        font: 'helvetica',
        cellPadding: { top: 3, right: 2, bottom: 3, left: 2 },
        valign: 'middle',
        halign: 'center',
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [44, 62, 80],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 25, halign: 'center' },
        1: { cellWidth: 35, halign: 'right' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' },
        4: { cellWidth: 35, halign: 'right' },
      },
      didDrawPage: () => {
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`© ${new Date().getFullYear()} Tech Trends Talks. All rights reserved.`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }
    });

    const yearlyTableEndY = (doc as any).lastAutoTable.finalY;

    // Monthly Details Table
    const monthlyTableBody = this.schedule.map(item => [
      item.monthLabel,
      this.currencyFormat(parseFloat(item.emi)),
      this.currencyFormat(parseFloat(item.principal)),
      this.currencyFormat(parseFloat(item.interest)),
      this.currencyFormat(parseFloat(item.balance))
    ]);

    autoTable(doc, {
      head: [['Month', 'EMI', 'Principal', 'Interest', 'Balance']],
      body: monthlyTableBody,
      startY: yearlyTableEndY + 20,
      theme: 'grid',
      styles: {
        fontSize: 7,
        font: 'helvetica',
        cellPadding: { top: 2, right: 1, bottom: 2, left: 1 },
        valign: 'middle',
        halign: 'right',
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [52, 73, 94],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 25, halign: 'left' },
        1: { cellWidth: 35, halign: 'right' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' },
        4: { cellWidth: 35, halign: 'right' },
      },
      willDrawCell: (data) => {
        const text = Array.isArray(data.cell.text) ? data.cell.text.join('') : data.cell.text;
        if (text.length > 12) {
          data.cell.styles.fontSize = 6;
        }
      },
      didDrawPage: () => {
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`© ${new Date().getFullYear()} Tech Trends Talks. All rights reserved.`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }
    });

    // Save the PDF
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    doc.save(`TechTrendsTalks_Complete_EMI_Report_${timestamp}.pdf`);
  }

  // Enhanced Monthly Details PDF with payment summary
  exportMonthlyDetailsPdf() {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Header with site branding
    doc.setFillColor(44, 62, 80);
    doc.rect(0, 0, pageWidth, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('TECH TRENDS TALKS', pageWidth / 2, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('EMI Calculator - Monthly Details Report', pageWidth / 2, 25, { align: 'center' });

    // Loan Summary Box
    doc.setFillColor(236, 240, 241);
    doc.roundedRect(12, 40, pageWidth - 24, 40, 2, 2, 'F'); // Increased height from 24 to 40
    
    doc.setTextColor(44, 62, 80);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Loan Summary', 14, 52);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text('Loan Amount:', 16, 62);
    doc.text('Interest Rate:', 16, 68);
    doc.text('Tenure:', 16, 74);
    
    doc.setFont('helvetica', 'bold');
    doc.text(`${this.currencyFormat(this.pricipalAmount)}`, 60, 62);
    doc.text(`${this.interestRate}%`, 60, 68);
    doc.text(`${this.years} years`, 60, 74);

    // Payment Summary Box
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(44, 62, 80);
    doc.text("Payment Summary", 14, 90);
  
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(12, 94, pageWidth - 24, 30, 2, 2, 'F'); // Increased height from 24 to 30
  
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text("Monthly EMI:", 16, 102);
    doc.setFont('helvetica', 'bold');
    doc.text(`${this.currencyFormat(this.emi)}`, 60, 102);
  
    doc.setFont('helvetica', 'normal');
    doc.text("Total Interest Payable:", 16, 108);
    doc.setFont('helvetica', 'bold');
    doc.text(`${this.currencyFormat(this.totalInterest)}`, 60, 108);
  
    doc.setFont('helvetica', 'normal');
    doc.text("Total Payment (Principal + Interest):", 16, 114);
    doc.setFont('helvetica', 'bold');
    doc.text(`${this.currencyFormat(this.totalPayment)}`, 85, 114);

    // Monthly Schedule Table
    const monthlyTableBody = this.schedule.map(item => [
      item.monthLabel,
      this.currencyFormat(parseFloat(item.emi)),
      this.currencyFormat(parseFloat(item.principal)),
      this.currencyFormat(parseFloat(item.interest)),
      this.currencyFormat(parseFloat(item.balance))
    ]);

    autoTable(doc, {
      head: [['Month', 'EMI', 'Principal', 'Interest', 'Balance']],
      body: monthlyTableBody,
      startY: 140, // Adjusted from 130 to 140 to account for increased payment summary box height
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
        fillColor: [52, 73, 94],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 25, halign: 'left' },
        1: { cellWidth: 35, halign: 'right' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' },
        4: { cellWidth: 35, halign: 'right' },
      },
      willDrawCell: (data) => {
        const text = Array.isArray(data.cell.text) ? data.cell.text.join('') : data.cell.text;
        if (text.length > 12) {
          data.cell.styles.fontSize = 7;
        }
      },
      didDrawPage: () => {
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`© ${new Date().getFullYear()} Tech Trends Talks. All rights reserved.`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }
    });

    // Save the PDF
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    doc.save(`TechTrendsTalks_Monthly_EMI_Details_${timestamp}.pdf`);
  }

  currencyFormat(amount: number): string {
    // Return only the formatted number without currency symbol
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    }).format(amount);
  }

  // Format input value with comma separation
  formatInputValue(value: number): string {
    if (!value || value === 0) return '';
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  }

  

  // Parse comma-separated input value back to number
  parseInputValue(value: string): number {
    if (!value) return 0;
    // Remove all commas and convert to number
    const cleanValue = value.replace(/,/g, '');
    return parseInt(cleanValue) || 0;
  }

  // Handle amount input formatting
  onAmountInput(event: any) {
    const input = event.target;
    const value = this.parseInputValue(input.value);
    
    if (value > 0) {
      this.amount = value;
      // Update the form control with formatted value
      this.amountForm.setValue(this.formatInputValue(value), { emitEvent: false });
    }
  }

  // Handle amount input blur (when user leaves the field)
  onAmountBlur() {
    this.validateAmount();
    // Format the display value
    this.amountForm.setValue(this.formatInputValue(this.amount), { emitEvent: false });
  }

  // Handle years input formatting
  onYearsInput(event: any) {
    const input = event.target;
    const value = this.parseInputValue(input.value);
    
    if (value > 0) {
      this.years = value;
      // Update the form control with formatted value
      this.yearsForm.setValue(this.formatInputValue(value), { emitEvent: false });
    }
  }

  // Handle years input blur
  onYearsBlur() {
    this.validateTenure();
    // Format the display value
    this.yearsForm.setValue(this.formatInputValue(this.years), { emitEvent: false });
  }

  // Handle interest rate input formatting
  onInterestInput(event: any) {
    const input = event.target;
    const value = this.parseInputValue(input.value);
    
    if (value > 0) {
      this.interestRate = value;
      // Update the form control with formatted value
      this.interestForm.setValue(this.formatInputValue(value), { emitEvent: false });
    }
  }

  // Handle interest rate input blur
  onInterestBlur() {
    this.validateInterestRate();
    // Format the display value
    this.interestForm.setValue(this.formatInputValue(this.interestRate), { emitEvent: false });
  }

  // SEO Content Methods
  scrollToCalculator(): void {
    const calculatorElement = document.querySelector('.calculator-main');
    if (calculatorElement) {
      calculatorElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  downloadGuide(): void {
    // Create a simple EMI guide content
    const guideContent = `
EMI Calculator Guide - Tech Trends Talks

What is EMI?
EMI (Equated Monthly Installment) is the fixed amount you pay monthly for your loan.

How to Use Our Calculator:
1. Enter loan amount
2. Select loan tenure
3. Input interest rate
4. Get instant results

Tips for Lower EMI:
- Choose longer tenure
- Maintain good credit score
- Compare lenders
- Consider prepayment

Visit: https://techtrendstalks.com/calculator/emi-calculator
    `;

    const blob = new Blob([guideContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'EMI-Calculator-Guide.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
