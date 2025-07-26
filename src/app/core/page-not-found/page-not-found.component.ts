import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SharedModule } from '../../module/shared/shared.module';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [SharedModule, RouterOutlet],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.scss'
})
export class PageNotFoundComponent {

}
