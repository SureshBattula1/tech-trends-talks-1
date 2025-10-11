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
    // Global fallback SEO is defined in index.html
    
    // Add global structured data for the entire website
    if (isPlatformBrowser(this.platformId)) {
      this.initializeGlobalStructuredData();
    }
  }

  /**
   * Initialize global structured data (WebSite, Organization) that applies to all pages
   */
  private initializeGlobalStructuredData(): void {
    const baseUrl = 'https://techtrendstalks.com';
    
    // Add WebSite structured data with search functionality
    const websiteData = this.structuredDataService.generateWebSiteStructuredData(baseUrl);
    
    // Add Organization structured data
    const organizationData = this.structuredDataService.generateOrganizationStructuredData();
    
    // Add both structured data
    this.structuredDataService.addMultipleStructuredData([websiteData, organizationData]);
  }

}
