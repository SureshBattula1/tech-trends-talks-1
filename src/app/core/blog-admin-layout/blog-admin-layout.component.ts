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
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

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
  private breakpointObserver = inject(BreakpointObserver);
  
  isVisible = computed(() => this.appService.isSidebarVisible());

  isMobile = false;
  
  ngOnInit(): void {
    this.appService.setSidebarVisible(true);

    this.breakpointObserver.observe([Breakpoints.Small, Breakpoints.XSmall])
      .subscribe(result => {
        this.isMobile = result.matches;
        if(this.isMobile){
          this.appService.setSidebarVisible(false);
        }
      });
  }

  menuClick(): void {
    if(this.isMobile){    
      this.appService.toggleSidenav();
    }
  }

  goToHome(): void {
    this.appService.toggleSidenav();
    this.router.navigate(['/blogs/home']);
  }

  logout(): void {
    this.authService.logout();
  }
}
