import { Component } from '@angular/core';
import { SharedModule } from '../../module/shared/shared.module';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss'
})
export class LoaderComponent {

}
