import { Component, inject } from '@angular/core';
import { SharedModule } from '../../module/shared/shared.module';
import { RouterModule } from '@angular/router';
import { AppService } from '../../services/app/app.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [SharedModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

 private appService = inject(AppService);

 toggle() {
    this.appService.toggleSidenav();
    console.log('Navbar toggle clicked', this.appService.isSidebarVisible());
 }

}
