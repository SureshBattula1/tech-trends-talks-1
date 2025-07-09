import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculatorSipViewComponent } from './calculator-sip-view.component';

describe('CalculatorSipViewComponent', () => {
  let component: CalculatorSipViewComponent;
  let fixture: ComponentFixture<CalculatorSipViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalculatorSipViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalculatorSipViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
