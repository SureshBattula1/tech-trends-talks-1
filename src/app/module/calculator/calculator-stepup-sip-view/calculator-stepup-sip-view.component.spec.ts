import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalculatorStepupSipViewComponent } from './calculator-stepup-sip-view.component';

describe('CalculatorStepupSipViewComponent', () => {
  let component: CalculatorStepupSipViewComponent;
  let fixture: ComponentFixture<CalculatorStepupSipViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalculatorStepupSipViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalculatorStepupSipViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate step up SIP correctly', () => {
    component.initialMonthlyInvestment = 5000;
    component.annualInterestRate = 12;
    component.investmentPeriod = 10;
    component.stepUpPercentage = 10;
    
    component.calculateStepUpSIP();
    
    expect(component.TOTAL_VALUE).toBeGreaterThan(component.INVESTED_AMOUNT);
    expect(component.EST_RETURNS).toBeGreaterThan(0);
  });

  it('should toggle frequency correctly', () => {
    component.toggleFrequency('HALF_YEARLY');
    expect(component.stepUpFrequency).toBe('HALF_YEARLY');
    
    component.toggleFrequency('YEARLY');
    expect(component.stepUpFrequency).toBe('YEARLY');
  });

  it('should validate initial monthly investment', () => {
    component.initialMonthlyInvestment = 50;
    component.validateInitialMonthlyInvestment();
    expect(component.initialMonthlyInvestment).toBeGreaterThan(50);
  });

  it('should validate step up percentage', () => {
    component.stepUpPercentage = 60;
    component.validateStepUpPercentage();
    expect(component.stepUpPercentage).toBeLessThanOrEqual(50);
  });
});

