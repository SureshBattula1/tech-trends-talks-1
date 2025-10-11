import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './core/navbar/navbar.component';
import { ComponentSidenavComponent } from './core/component-sidenav/component-sidenav.component';
import { PageComingSoonComponent } from './core/page-coming-soon/page-coming-soon.component';
import { LoaderService } from './services/loading-bar/loader.service';
import { LoaderComponent } from './core/loader/loader.component';
import { StructuredDataService } from './services/structured-data.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ComponentSidenavComponent, PageComingSoonComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'] 

})
export class AppComponent implements OnInit{

  public loader = inject(LoaderService);
  private structuredDataService = inject(StructuredDataService);
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    // SEO is now handled by individual components using MetaTagsService and StructuredDataService
    // Global fallback SEO and structured data (@graph format) is defined in index.html
    // This prevents duplicate Organization and WebSite schemas
    
    // Note: Individual pages (calculators, blogs) still add page-specific structured data
    // like WebApplication, Article, FAQPage, etc.
  }

}
