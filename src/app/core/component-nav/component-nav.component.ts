import { Component, inject } from '@angular/core';
import { SharedModule } from '../../module/shared/shared.module';
import { RouterModule } from '@angular/router';
import { AppService } from '../../services/app/app.service';

@Component({
  selector: 'app-component-nav',
  standalone: true,
  imports: [SharedModule, RouterModule],
  templateUrl: './component-nav.component.html',
  styleUrl: './component-nav.component.scss'
})
export class ComponentNavComponent {
private appService = inject(AppService);
  menuClose(){
    this.appService.toggleSidenav();
  }
}
