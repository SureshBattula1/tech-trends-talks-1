import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { SharedModule } from '../../module/shared/shared.module';
import { LoaderComponent } from '../loader/loader.component';
import { FooterComponent } from '../footer/footer.component';
import { ComponentNavComponent } from '../component-nav/component-nav.component';
import { ComponentViewerComponent } from '../component-viewer/component-viewer.component';
import { AppService } from '../../services/app/app.service';
import { LoaderService } from '../../services/loading-bar/loader.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-blog-admin-layout',
  standalone: true,
  imports: [RouterOutlet, SharedModule, RouterModule, LoaderComponent, NavbarComponent, FooterComponent, ComponentNavComponent, ComponentViewerComponent],
  templateUrl: './blog-admin-layout.component.html',
  styleUrl: './blog-admin-layout.component.scss'
})
export class BlogAdminLayoutComponent implements OnInit {
 private appService = inject(AppService);
 public loader = inject(LoaderService);
  
 isVisible = computed(() => this.appService.isSidebarVisible());
 ngOnInit(): void {
   this.appService.toggleSidenav();
 }
}
