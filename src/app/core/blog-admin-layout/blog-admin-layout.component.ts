import { Component, computed, inject, OnInit } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { SharedModule } from '../../module/shared/shared.module';
import { LoaderComponent } from '../loader/loader.component';
import { FooterComponent } from '../footer/footer.component';
import { ComponentNavComponent } from '../component-nav/component-nav.component';
import { ComponentViewerComponent } from '../component-viewer/component-viewer.component';
import { AppService } from '../../services/app/app.service';
import { LoaderService } from '../../services/loading-bar/loader.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-blog-admin-layout',
  standalone: true,
  imports: [RouterOutlet, SharedModule, RouterModule, LoaderComponent, NavbarComponent, FooterComponent, ComponentNavComponent, ComponentViewerComponent],
  templateUrl: './blog-admin-layout.component.html',
  styleUrl: './blog-admin-layout.component.scss'
})
export class BlogAdminLayoutComponent implements OnInit {
  private appService = inject(AppService);
  public authService = inject(AuthService);
  public loader = inject(LoaderService);
  private router = inject(Router);
  
  isVisible = computed(() => this.appService.isSidebarVisible());
  
  ngOnInit(): void {
    this.appService.setSidebarVisibleTrue();
  }

  goToHome(): void {
    this.appService.toggleSidenav();
    this.router.navigate(['/blogs/home']);
  }

  logout(): void {
    this.authService.logout();
  }
}
