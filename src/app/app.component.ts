import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './core/navbar/navbar.component';
import { ComponentSidenavComponent } from './core/component-sidenav/component-sidenav.component';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
 imports: [RouterOutlet, NavbarComponent, ComponentSidenavComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{

  constructor(private title: Title, private meta: Meta, private renderer: Renderer2, @Inject(DOCUMENT) private document: Document) {}

  ngOnInit(): void {
    this.title.setTitle('Tech Trends Talks - Your Loan Guide');

    const link: HTMLLinkElement = this.renderer.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', 'https://techtrendstalks.com/calculator/loan-emi-calculator');
    this.renderer.appendChild(this.document.head, link);


    this.meta.addTags([
      { name: 'description', content: 'EMI calculators - home, car, personal, gold, mortgage, overdraft, travel, consumer durable & credit card loans with fast approvals & flexible repayment options.' },
      { name: 'keywords', content: 'EMI, loan calculator, finance, interest rate, mortgage, home loan, personal loan, car loan' },
      { name: 'author', content: 'Tech Trends Talks' },
      { name: 'robots', content: 'index, follow' },
      { property: 'og:title', content: 'Tech Trends Talks - Smart Loan Insights' },
      { property: 'og:description', content: 'Get loan EMI breakdowns, tips and more.' },
      { property: 'og:url', content: 'https://techtrendstalks.com/' },
      { property: 'og:type', content: 'website' },
    ]);

    
  }
}
