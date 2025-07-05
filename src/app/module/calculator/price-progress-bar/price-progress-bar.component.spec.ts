import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceProgressBarComponent } from './price-progress-bar.component';

describe('PriceProgressBarComponent', () => {
  let component: PriceProgressBarComponent;
  let fixture: ComponentFixture<PriceProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceProgressBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriceProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
