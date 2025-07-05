import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, viewChild } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { I } from '@angular/cdk/keycodes';
import { FormControl } from '@angular/forms';
import { MatSlider } from '@angular/material/slider';

@Component({
  selector: 'app-price-progress-bar',
  standalone: true,
  imports: [SharedModule,],
  templateUrl: './price-progress-bar.component.html',
  styleUrl: './price-progress-bar.component.scss'
})
export class PriceProgressBarComponent implements OnInit,OnChanges {

  @ViewChild('slider') slider!: MatSlider;

  @Input() mode: string = 'PRICE';

  @Input() discrete: boolean = false;

  @Input() step: number = 0;

  @Input() minPrice: number = 10000;

  @Input() maxPrice: number = 1000000;

  @Input() currentPrice: number = 10000;

  @Output() priceChanged = new EventEmitter<number>();

  modeType: string = 'K';

  priceControl = new FormControl(this.currentPrice);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentPrice']) {
      this.priceControl.setValue(changes['currentPrice'].currentValue);
      this.priceControl.updateValueAndValidity();
    }
  }

  ngOnInit(): void {
    this.setupMode();
    this.priceControl.valueChanges.subscribe((price: any)=> 
      {
        this.currentPrice = price;
        this.priceChanged.emit(price);
      });
  }

  setupMode(){
    switch(this.mode){
      case 'PRICE':
        this.modeType = '';
        break;
      case 'PERCENTAGE':
          this.modeType = '%';
          break;
      case 'TENURE':
          this.modeType = 'Y';
          break;
      default:
    }
  }

}
