import { Injectable } from '@angular/core';

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
  canonical: string;
  structuredData?: any;
  breadcrumbs?: Array<{ name: string; url: string }>;
}

@Injectable({
  providedIn: 'root'
})
export class SeoConfigService {
  private readonly baseUrl = 'https://techtrendstalks.com';
  private readonly defaultImage = '/assets/images/techtrendstalks-logo.jpeg';

  // Default SEO configuration
  readonly defaultConfig: SEOConfig = {
    title: 'Tech Trends Talks - Free EMI, SIP & Loan Calculators | Financial Planning Tools',
    description: 'Free online calculators for EMI, SIP, loan eligibility, and financial planning. Calculate home loan EMI, mutual fund SIP returns, and plan your finances with our accurate calculators.',
    keywords: [
      'emi calculator',
      'sip calculator',
      'loan calculator',
      'mutual fund calculator',
      'home loan emi calculator',
      'personal loan calculator',
      'investment calculator',
      'financial planning tools',
      'loan eligibility calculator',
      'free online calculator'
    ],
    ogImage: `${this.baseUrl}${this.defaultImage}`,
    canonical: this.baseUrl
  };

  // Page-specific SEO configurations
  readonly pageConfigs: Record<string, Partial<SEOConfig>> = {
    '/calculator/emi-calculator': {
      title: 'Free EMI Calculator - Calculate Loan EMI Online | Home, Car, Personal Loan EMI',
      description: 'Free online EMI calculator for home loans, car loans, personal loans, and business loans. Calculate monthly EMI, total interest, and download detailed amortization schedule in PDF/Excel format.',
      keywords: [
        'emi calculator',
        'loan emi calculator',
        'home loan emi calculator',
        'car loan emi calculator',
        'personal loan emi calculator',
        'mortgage calculator',
        'loan repayment calculator',
        'interest calculator',
        'amortization schedule',
        'free emi calculator online',
        'emi calculator india',
        'equated monthly installment calculator',
        'loan calculator with schedule',
        'monthly loan payment calculator',
        'rupee emi calculator'
      ],
      ogImage: `${this.baseUrl}/assets/images/calculator.png`,
      breadcrumbs: [
        { name: 'Home', url: this.baseUrl },
        { name: 'Calculators', url: `${this.baseUrl}/calculator` },
        { name: 'EMI Calculator', url: `${this.baseUrl}/calculator/emi-calculator` }
      ]
    },
    '/calculator/sip-calculator': {
      title: 'Free SIP Calculator - Calculate Mutual Fund Returns & SIP Investment Growth',
      description: 'Free online SIP calculator to calculate mutual fund returns and wealth creation. Plan your systematic investment plan with accurate projections for monthly SIP, lumpsum, and step-up SIP investments.',
      keywords: [
        'sip calculator',
        'mutual fund sip calculator',
        'investment calculator',
        'sip returns calculator',
        'monthly investment calculator',
        'wealth calculator',
        'retirement planning calculator',
        'systematic investment plan calculator',
        'compound interest calculator',
        'free sip calculator online',
        'sip calculator india',
        'mutual fund calculator',
        'sip investment calculator',
        'goal based investing calculator',
        'financial planning calculator'
      ],
      ogImage: `${this.baseUrl}/assets/images/sip-calculator.png`,
      breadcrumbs: [
        { name: 'Home', url: this.baseUrl },
        { name: 'Calculators', url: `${this.baseUrl}/calculator` },
        { name: 'SIP Calculator', url: `${this.baseUrl}/calculator/sip-calculator` }
      ]
    },
    '/calculator/swp-calculator': {
      title: 'Free SWP Calculator - Calculate Systematic Withdrawal Plan for Retirement',
      description: 'Free online SWP calculator for retirement planning. Calculate systematic withdrawals from mutual fund investments, plan monthly income, and track remaining corpus.',
      keywords: [
        'swp calculator',
        'systematic withdrawal plan calculator',
        'retirement income calculator',
        'pension calculator',
        'withdrawal calculator',
        'retirement planning calculator',
        'monthly income calculator',
        'swp calculator india',
        'mutual fund withdrawal calculator',
        'post retirement planning'
      ],
      ogImage: `${this.baseUrl}/assets/images/swp-calculator.png`,
      breadcrumbs: [
        { name: 'Home', url: this.baseUrl },
        { name: 'Calculators', url: `${this.baseUrl}/calculator` },
        { name: 'SWP Calculator', url: `${this.baseUrl}/calculator/swp-calculator` }
      ]
    },
    '/calculator/grade-calculator': {
      title: 'Free Grade Calculator - Calculate SGPA, CGPA & GPA Online for Students',
      description: 'Free online grade calculator for students to calculate SGPA, CGPA, and GPA. Convert marks to grades, calculate semester grade point average with detailed analysis.',
      keywords: [
        'grade calculator',
        'sgpa calculator',
        'cgpa calculator',
        'gpa calculator',
        'student grade calculator',
        'marks to grade converter',
        'semester grade calculator',
        'academic performance calculator',
        'university grade calculator',
        'college grade calculator'
      ],
      ogImage: `${this.baseUrl}/assets/images/grade-calculator.png`,
      breadcrumbs: [
        { name: 'Home', url: this.baseUrl },
        { name: 'Calculators', url: `${this.baseUrl}/calculator` },
        { name: 'Grade Calculator', url: `${this.baseUrl}/calculator/grade-calculator` }
      ]
    },
    '/loan-eligibility-calculator/checker': {
      title: 'Free Loan Eligibility Calculator - Check Your Loan Approval Chances Online',
      description: 'Free loan eligibility calculator to check your loan approval chances instantly. Calculate maximum loan amount based on income, credit score, and DTI ratio for home, personal, and car loans.',
      keywords: [
        'loan eligibility calculator',
        'loan approval calculator',
        'home loan eligibility calculator',
        'personal loan eligibility calculator',
        'car loan eligibility calculator',
        'loan amount calculator',
        'credit score calculator',
        'debt to income ratio calculator',
        'loan qualification calculator',
        'affordability calculator'
      ],
      ogImage: `${this.baseUrl}/assets/images/loan-eligibility.png`,
      breadcrumbs: [
        { name: 'Home', url: this.baseUrl },
        { name: 'Calculators', url: `${this.baseUrl}/calculator` },
        { name: 'Loan Eligibility Calculator', url: `${this.baseUrl}/loan-eligibility-calculator/checker` }
      ]
    },
    '/blogs/home': {
      title: 'Financial Planning Blog - Expert Tips on EMI, SIP & Loan Management',
      description: 'Read expert articles on financial planning, EMI calculation, SIP investments, loan management, and personal finance tips. Stay updated with the latest trends in Indian finance.',
      keywords: [
        'financial planning blog',
        'emi tips',
        'sip investment guide',
        'loan management tips',
        'personal finance blog',
        'investment tips',
        'money management',
        'financial advice india'
      ],
      breadcrumbs: [
        { name: 'Home', url: this.baseUrl },
        { name: 'Blog', url: `${this.baseUrl}/blogs/home` }
      ]
    }
  };

  /**
   * Get SEO configuration for a specific route
   */
  getConfigForRoute(route: string): SEOConfig {
    const config = this.pageConfigs[route];
    if (config) {
      return {
        ...this.defaultConfig,
        ...config,
        canonical: `${this.baseUrl}${route}`
      };
    }
    return this.defaultConfig;
  }

  /**
   * Get all keywords for a route
   */
  getKeywordsString(route: string): string {
    const config = this.getConfigForRoute(route);
    return config.keywords.join(', ');
  }

  /**
   * Generate breadcrumb structured data
   */
  generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': crumb.name,
        'item': crumb.url
      }))
    };
  }

  /**
   * Generate WebSite structured data with search action
   */
  generateWebSiteStructuredData(): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'Tech Trends Talks',
      'url': this.baseUrl,
      'description': 'Free online financial calculators for EMI, SIP, loan eligibility, and investment planning',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': {
          '@type': 'EntryPoint',
          'urlTemplate': `${this.baseUrl}/search?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      },
      'sameAs': [
        'https://www.facebook.com/techtrendstalks',
        'https://twitter.com/techtrendstalks',
        'https://www.instagram.com/techtrendstalks',
        'https://www.linkedin.com/company/techtrendstalks',
        'https://www.youtube.com/techtrendstalks'
      ]
    };
  }

  /**
   * Generate Organization structured data
   */
  generateOrganizationStructuredData(): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'Tech Trends Talks',
      'alternateName': 'TechTrendsTalks',
      'url': this.baseUrl,
      'logo': {
        '@type': 'ImageObject',
        'url': `${this.baseUrl}${this.defaultImage}`,
        'width': 250,
        'height': 60
      },
      'description': 'Tech Trends Talks provides free online financial calculators including EMI calculator, SIP calculator, loan eligibility calculator, and financial planning tools for individuals and businesses in India.',
      'address': {
        '@type': 'PostalAddress',
        'addressCountry': 'IN',
        'addressRegion': 'India'
      },
      'areaServed': {
        '@type': 'Country',
        'name': 'India'
      },
      'contactPoint': {
        '@type': 'ContactPoint',
        'contactType': 'customer service',
        'availableLanguage': ['English', 'Hindi']
      },
      'foundingDate': '2024',
      'sameAs': [
        'https://www.facebook.com/techtrendstalks',
        'https://twitter.com/techtrendstalks',
        'https://www.instagram.com/techtrendstalks',
        'https://www.linkedin.com/company/techtrendstalks',
        'https://www.youtube.com/techtrendstalks'
      ]
    };
  }

  /**
   * Get recommended internal links for a page
   */
  getRecommendedLinks(currentRoute: string): Array<{ title: string; url: string; description: string }> {
    const linkMap: Record<string, Array<{ title: string; url: string; description: string }>> = {
      '/calculator/emi-calculator': [
        { 
          title: 'SIP Calculator', 
          url: '/calculator/sip-calculator', 
          description: 'Calculate mutual fund SIP returns and plan investments' 
        },
        { 
          title: 'Loan Eligibility Calculator', 
          url: '/loan-eligibility-calculator/checker', 
          description: 'Check your loan approval chances instantly' 
        },
        { 
          title: 'Financial Blog', 
          url: '/blogs/home', 
          description: 'Read expert tips on loan management and financial planning' 
        }
      ],
      '/calculator/sip-calculator': [
        { 
          title: 'EMI Calculator', 
          url: '/calculator/emi-calculator', 
          description: 'Calculate monthly loan EMI and repayment schedule' 
        },
        { 
          title: 'SWP Calculator', 
          url: '/calculator/swp-calculator', 
          description: 'Plan systematic withdrawals for retirement income' 
        },
        { 
          title: 'Investment Tips', 
          url: '/blogs/home', 
          description: 'Learn about SIP strategies and investment planning' 
        }
      ],
      '/loan-eligibility-calculator/checker': [
        { 
          title: 'EMI Calculator', 
          url: '/calculator/emi-calculator', 
          description: 'Calculate EMI after checking eligibility' 
        },
        { 
          title: 'SIP Calculator', 
          url: '/calculator/sip-calculator', 
          description: 'Start investing with systematic investment plan' 
        },
        { 
          title: 'Loan Management Blog', 
          url: '/blogs/home', 
          description: 'Tips for better loan management and credit score' 
        }
      ]
    };

    return linkMap[currentRoute] || [];
  }
}

