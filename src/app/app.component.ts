import { Component, inject, Inject, OnInit, Renderer2 } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './core/navbar/navbar.component';
import { ComponentSidenavComponent } from './core/component-sidenav/component-sidenav.component';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
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

  constructor(private title: Title, private meta: Meta, private renderer: Renderer2, @Inject(DOCUMENT) private document: Document,  private router: Router) {}

  ngOnInit(): void {
  
    this.title.setTitle('Tech Trends Talks - EMI Calculators & Smart Loan Insights & SIP Calculator');

    this.meta.addTags([
      { name: 'description', content: 'EMI calculators for home, car, personal, gold, and more loans. Fast approvals, flexible repayment, and PDF download of EMI breakdowns and sip calculator.' },
      { name: 'keywords', content: 'emi calculator, sip calculator, loan calculator, mutual fund calculator, sip return calculator, समान मासिक किस्त, personal loan, home loan, car loan , emi download' },
      { name: 'author', content: 'Tech Trends Talks' },
      { name: 'robots', content: 'index, follow' },
      { property: 'og:title', content: 'Tech Trends Talks - EMI Calculators & Smart Loan Insights & SIP Calculator' },
      { property: 'og:description', content: 'Get loan EMI breakdowns, SIP Calculator, tips and more.' },
      { property: 'og:url', content: 'https://techtrendstalks.com/' },
      { property: 'og:type', content: 'website' },
      { property: 'og:image',  content: 'https://techtrendstalks.com/assets/images/social-preview.jpg' },
      { property: 'og:site_name', content: 'techtrendstalks' }
    ]);

    const currentUrl = this.router.url;

    if (currentUrl.includes('/calculator/emi-calculator')) {
      this.addEmiStructuredData(); 
      this.addCanonicalTag('https://techtrendstalks.com/calculator/emi-calculator');
    }
  
    if (currentUrl.includes('/calculator/sip-calculator')) {
      this.addSipStructuredData(); 
      this.addCanonicalTag('https://techtrendstalks.com/calculator/sip-calculator');
    }

    if (currentUrl.includes('/loan-eligibility-calculator/checker')) {
      this.addLoanEligibilityStructuredData();
      this.addCanonicalTag('https://techtrendstalks.com/loan-eligibility-calculator/checker');
    }
    
  }

  addCanonicalTag(url: string): void {
    const link: HTMLLinkElement = this.renderer.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', url);
    this.renderer.appendChild(this.document.head, link);
  }

  addEmiStructuredData(): void {
    const script = this.renderer.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Techtrendstalks EMI Calculator",
      "operatingSystem": "All",
      "applicationCategory": "FinanceApplication",
      "description": "Free online EMI calculator to calculate loan repayments and download statements in PDF.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    });
    this.renderer.appendChild(this.document.head, script);
  }

  addSipStructuredData(): void {
    const script = this.renderer.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Techtrendstalks SIP Calculator",
      "operatingSystem": "All",
      "applicationCategory": "FinanceApplication",
      "description": "Free SIP calculator by Techtrendstalks to calculate mutual fund returns. Plan your monthly investments and get projected returns.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    });
    this.renderer.appendChild(this.document.head, script);
  }

  addLoanEligibilityStructuredData(): void {
    const script = this.renderer.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Techtrendstalks Loan Eligibility Checker",
      "operatingSystem": "All",
      "applicationCategory": "FinanceApplication",
      "description": "Check your loan eligibility instantly using Techtrendstalks' online tool. Fast and accurate results for personal, home, and car loans.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    });
    this.renderer.appendChild(this.document.head, script);
  }
  
  
  
}
