import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from '../../shared/shared.module';
import { PriceProgressBarComponent } from '../price-progress-bar/price-progress-bar.component';

import { CalculatorSipViewComponent } from './calculator-sip-view.component';

describe('CalculatorSipViewComponent', () => {
  let component: CalculatorSipViewComponent;
  let fixture: ComponentFixture<CalculatorSipViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CalculatorSipViewComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        SharedModule,
        PriceProgressBarComponent
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalculatorSipViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with SIP mode by default', () => {
    expect(component.calculatorMode).toBe('SIP');
  });

  it('should toggle to Lumpsum mode when called', () => {
    component.toggleCalculatorMode('LUMPSUM');
    expect(component.calculatorMode).toBe('LUMPSUM');
  });

  it('should toggle back to SIP mode', () => {
    component.toggleCalculatorMode('LUMPSUM');
    component.toggleCalculatorMode('SIP');
    expect(component.calculatorMode).toBe('SIP');
  });

  describe('SIP Calculations', () => {
    beforeEach(() => {
      component.calculatorMode = 'SIP';
    });

    it('should calculate SIP returns correctly', () => {
      component.monthlyInvestment = 10000;
      component.annualInterestRate = 12;
      component.investmentPeriod = 10;
      
      component.calculateSIP();
      
      expect(component.INVESTED_AMOUNT).toBe(1200000); // 10000 * 12 * 10
      expect(component.TOTAL_VALUE).toBeGreaterThan(component.INVESTED_AMOUNT);
      expect(component.EST_RETURNS).toBeGreaterThan(0);
    });

    it('should validate monthly investment minimum', () => {
      component.monthlyInvestment = 50;
      component.validateMonthlyInvestment();
      expect(component.monthlyInvestment).toBe(100);
    });

    it('should validate investment period range', () => {
      component.investmentPeriod = 0;
      component.validateInvestmentPeriod();
      expect(component.investmentPeriod).toBe(1);
    });

    it('should validate interest rate range', () => {
      component.annualInterestRate = 35;
      component.validateAnnualInterestRate();
      expect(component.annualInterestRate).toBe(12);
    });
  });

  describe('Lumpsum Calculations', () => {
    beforeEach(() => {
      component.calculatorMode = 'LUMPSUM';
    });

    it('should calculate lumpsum returns correctly', () => {
      component.lumpsumAmount = 100000;
      component.lumpsumAnnualInterestRate = 12;
      component.lumpsumInvestmentPeriod = 10;
      
      component.calculateLumpsum();
      
      expect(component.INVESTED_AMOUNT).toBe(100000);
      expect(component.TOTAL_VALUE).toBeGreaterThan(component.INVESTED_AMOUNT);
      expect(component.EST_RETURNS).toBeGreaterThan(0);
    });

    it('should validate lumpsum amount minimum', () => {
      component.lumpsumAmount = 500;
      component.validateLumpsumAmount();
      expect(component.lumpsumAmount).toBe(1000);
    });

    it('should validate lumpsum investment period range', () => {
      component.lumpsumInvestmentPeriod = 0;
      component.validateLumpsumInvestmentPeriod();
      expect(component.lumpsumInvestmentPeriod).toBe(1);
    });

    it('should validate lumpsum interest rate range', () => {
      component.lumpsumAnnualInterestRate = 35;
      component.validateLumpsumAnnualInterestRate();
      expect(component.lumpsumAnnualInterestRate).toBe(12);
    });
  });

  describe('Form Controls', () => {
    it('should initialize all form controls', () => {
      expect(component.monthlyInvestmentForm).toBeTruthy();
      expect(component.annualInterestRateForm).toBeTruthy();
      expect(component.investmentPeriodForm).toBeTruthy();
      expect(component.lumpsumAmountForm).toBeTruthy();
      expect(component.lumpsumAnnualInterestRateForm).toBeTruthy();
      expect(component.lumpsumInvestmentPeriodForm).toBeTruthy();
    });

    it('should update monthly investment when form changes', () => {
      component.monthlyInvestmentForm.setValue('20000');
      expect(component.monthlyInvestment).toBe(20000);
    });

    it('should update lumpsum amount when form changes', () => {
      component.lumpsumAmountForm.setValue('200000');
      expect(component.lumpsumAmount).toBe(200000);
    });
  });

  describe('Chart Updates', () => {
    it('should update chart data after SIP calculation', () => {
      component.calculateSIP();
      expect(component.chartData.datasets[0].data).toEqual([
        component.INVESTED_AMOUNT,
        component.EST_RETURNS
      ]);
    });

    it('should update chart data after lumpsum calculation', () => {
      component.calculateLumpsum();
      expect(component.chartData.datasets[0].data).toEqual([
        component.INVESTED_AMOUNT,
        component.EST_RETURNS
      ]);
    });
  });

  describe('Price Progress Change', () => {
    it('should handle PRICE mode for SIP', () => {
      component.calculatorMode = 'SIP';
      component.priceProgressChange(15000, 'PRICE');
      expect(component.monthlyInvestment).toBe(15000);
    });

    it('should handle PRICE mode for Lumpsum', () => {
      component.calculatorMode = 'LUMPSUM';
      component.priceProgressChange(150000, 'PRICE');
      expect(component.lumpsumAmount).toBe(150000);
    });

    it('should handle PERCENTAGE mode for SIP', () => {
      component.calculatorMode = 'SIP';
      component.priceProgressChange(15, 'PERCENTAGE');
      expect(component.annualInterestRate).toBe(15);
    });

    it('should handle PERCENTAGE mode for Lumpsum', () => {
      component.calculatorMode = 'LUMPSUM';
      component.priceProgressChange(15, 'PERCENTAGE');
      expect(component.lumpsumAnnualInterestRate).toBe(15);
    });

    it('should handle TENURE mode for SIP', () => {
      component.calculatorMode = 'SIP';
      component.priceProgressChange(15, 'TENURE');
      expect(component.investmentPeriod).toBe(15);
    });

    it('should handle TENURE mode for Lumpsum', () => {
      component.calculatorMode = 'LUMPSUM';
      component.priceProgressChange(15, 'TENURE');
      expect(component.lumpsumInvestmentPeriod).toBe(15);
    });
  });

  describe('Comma Formatting', () => {
    it('should format numbers with Indian numbering system correctly', () => {
      expect(component.formatNumberWithCommas(1000)).toBe('1,000');
      expect(component.formatNumberWithCommas(10000)).toBe('10,000');
      expect(component.formatNumberWithCommas(100000)).toBe('1,00,000');
      expect(component.formatNumberWithCommas(1000000)).toBe('10,00,000');
      expect(component.formatNumberWithCommas(1234567)).toBe('12,34,567');
    });

    it('should parse numbers from comma-formatted strings', () => {
      expect(component.parseNumberFromCommas('1,000')).toBe(1000);
      expect(component.parseNumberFromCommas('1,00,000')).toBe(100000);
      expect(component.parseNumberFromCommas('10,00,000')).toBe(1000000);
      expect(component.parseNumberFromCommas('12,34,567')).toBe(1234567);
    });

    it('should handle input focus and blur events for monthly investment', () => {
      component.monthlyInvestmentForm.setValue('10000');
      component.onInputFocus('monthlyInvestment');
      expect(component.monthlyInvestmentForm.value).toBe('10000');
      
      component.monthlyInvestmentForm.setValue('15000');
      component.onInputBlur('monthlyInvestment');
      expect(component.monthlyInvestmentForm.value as any).toBe('15,000');
    });

    it('should handle input focus and blur events for lumpsum amount', () => {
      component.lumpsumAmountForm.setValue('100000');
      component.onInputFocus('lumpsumAmount');
      expect(component.lumpsumAmountForm.value).toBe('100000');
      
      component.lumpsumAmountForm.setValue('150000');
      component.onInputBlur('lumpsumAmount');
      expect(component.lumpsumAmountForm.value as any).toBe('1,50,000');
    });
  });

  describe('Input Field Structure', () => {
    it('should have proper input groups with labels', () => {
      const compiled = fixture.nativeElement;
      
      // Check SIP mode inputs
      expect(compiled.querySelector('label:contains("Monthly Investment")')).toBeTruthy();
      expect(compiled.querySelector('label:contains("Expected Return Rate (p.a)")')).toBeTruthy();
      expect(compiled.querySelector('label:contains("Time Period (Years)")')).toBeTruthy();
    });

    it('should have input wrappers with proper styling classes', () => {
      const compiled = fixture.nativeElement;
      const inputWrappers = compiled.querySelectorAll('.input-wrapper');
      expect(inputWrappers.length).toBeGreaterThan(0);
      
      inputWrappers.forEach((wrapper: any) => {
        expect(wrapper.classList.contains('input-wrapper')).toBeTruthy();
      });
    });

    it('should have form inputs with proper classes', () => {
      const compiled = fixture.nativeElement;
      const formInputs = compiled.querySelectorAll('.form-input');
      expect(formInputs.length).toBeGreaterThan(0);
      
      formInputs.forEach((input: any) => {
        expect(input.classList.contains('form-input')).toBeTruthy();
      });
    });

    it('should have currency symbols and units in input wrappers', () => {
      const compiled = fixture.nativeElement;
      
      // Check for currency symbol
      const currencySymbols = compiled.querySelectorAll('.currency-symbol');
      expect(currencySymbols.length).toBeGreaterThan(0);
      
      // Check for units
      const units = compiled.querySelectorAll('.unit');
      expect(units.length).toBeGreaterThan(0);
    });
  });
});
