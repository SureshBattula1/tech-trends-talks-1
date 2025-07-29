import { Component, inject, Inject, OnInit, Renderer2 } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{

  public loader = inject(LoaderService);

  constructor(private title: Title, private meta: Meta, private renderer: Renderer2, @Inject(DOCUMENT) private document: Document) {}

  ngOnInit(): void {
  
    this.title.setTitle('Tech Trends Talks - EMI Calculators & Smart Loan Insights');

    const link: HTMLLinkElement = this.renderer.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', 'https://techtrendstalks.com/calculator/loan-emi-calculator');
    this.renderer.appendChild(this.document.head, link);


    this.meta.addTags([
      { name: 'description', content: 'EMI calculators for home, car, personal, gold, and more loans. Fast approvals, flexible repayment, and PDF download of EMI breakdowns.' },
      { name: 'keywords', content: 'emi calculator, sip calculator, loan calculator, mutual fund calculator, sip return calculator, समान मासिक किस्त, personal loan, home loan, car loan , emi download' },
      { name: 'author', content: 'Tech Trends Talks' },
      { name: 'robots', content: 'index, follow' },
      { property: 'og:title', content: 'Tech Trends Talks - Smart Loan Insights' },
      { property: 'og:description', content: 'Get loan EMI breakdowns, tips and more.' },
      { property: 'og:url', content: 'https://techtrendstalks.com/' },
      { property: 'og:type', content: 'website' },
      { property: 'og:image',  content: 'https://techtrendstalks.com/assets/images/social-preview.jpg' 
      }
    ]);

    
  }
}
