import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './core/navbar/navbar.component';
import { ComponentSidenavComponent } from './core/component-sidenav/component-sidenav.component';
import { PageComingSoonComponent } from './core/page-coming-soon/page-coming-soon.component';
import { LoaderService } from './services/loading-bar/loader.service';
import { LoaderComponent } from './core/loader/loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ComponentSidenavComponent, PageComingSoonComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'] 

})
export class AppComponent implements OnInit{

  public loader = inject(LoaderService);

  ngOnInit(): void {
    // SEO is now handled by individual components using MetaTagsService and StructuredDataService
    // Global fallback SEO is defined in index.html
  }

}
