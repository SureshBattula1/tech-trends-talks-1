import { Component } from '@angular/core';
import { SharedModule } from '../../module/shared/shared.module';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-component-nav',
  standalone: true,
  imports: [SharedModule, RouterModule],
  templateUrl: './component-nav.component.html',
  styleUrl: './component-nav.component.scss'
})
export class ComponentNavComponent {

}
