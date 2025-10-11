import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculatorSwpViewComponent } from './calculator-swp-view.component';

describe('CalculatorSwpViewComponent', () => {
  let component: CalculatorSwpViewComponent;
  let fixture: ComponentFixture<CalculatorSwpViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalculatorSwpViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CalculatorSwpViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate SWP correctly', () => {
    component.initialInvestment = 1000000;
    component.monthlyWithdrawal = 10000;
    component.annualInterestRate = 12;
    component.withdrawalPeriod = 10;
    
    component.calculate();
    
    expect(component.INITIAL_INVESTMENT).toBe(1000000);
    expect(component.TOTAL_WITHDRAWN).toBeGreaterThan(0);
    expect(component.REMAINING_VALUE).toBeGreaterThanOrEqual(0);
    // Total withdrawn should be less than or equal to total months * withdrawal
    expect(component.TOTAL_WITHDRAWN).toBeLessThanOrEqual(10 * 12 * 10000);
  });

  it('should calculate remaining value correctly (withdraw first, then interest)', () => {
    // Test with 1 year period for easier verification
    component.initialInvestment = 1000000; // 10 lakhs
    component.monthlyWithdrawal = 10000;   // 10k per month
    component.annualInterestRate = 12;     // 1% per month
    component.withdrawalPeriod = 1;        // 1 year
    
    component.calculate();
    
    // After 12 months of 10k withdrawal and 1% monthly interest on remaining:
    // Month 1: 1,000,000 - 10,000 = 990,000, +1% = 999,900
    // Month 2: 999,900 - 10,000 = 989,900, +1% = 999,899
    // And so on...
    // The remaining value should be close to 999,394
    expect(component.REMAINING_VALUE).toBeGreaterThan(990000);
    expect(component.REMAINING_VALUE).toBeLessThan(1000000);
    expect(component.TOTAL_WITHDRAWN).toBe(120000); // 12 months * 10,000
  });

  it('should validate initial investment', () => {
    component.initialInvestment = -100;
    component.validateInitialInvestment();
    
    expect(component.initialInvestment).toBeGreaterThanOrEqual(100000);
  });

  it('should validate monthly withdrawal', () => {
    component.monthlyWithdrawal = -100;
    component.validateMonthlyWithdrawal();
    
    expect(component.monthlyWithdrawal).toBeGreaterThanOrEqual(1000);
  });

  it('should format currency correctly', () => {
    const formatted = component.formatCurrency(1000000);
    expect(formatted).toContain('L'); // Should format as Lakhs
  });

  it('should get correct status message', () => {
    component.withdrawalStatus = 'sufficient';
    expect(component.getStatusMessage()).toContain('corpus will last');
    
    component.withdrawalStatus = 'warning';
    expect(component.getStatusMessage()).toContain('Warning');
    
    component.withdrawalStatus = 'exhausted';
    expect(component.getStatusMessage()).toContain('exhausted');
  });
});

