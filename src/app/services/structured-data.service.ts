import { Injectable, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { CalculatorType } from './meta-tags.service';

export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class StructuredDataService {
  private meta = inject(Meta);

  /**
   * Add structured data to the page
   */
  addStructuredData(data: StructuredData): void {
    // Remove existing structured data
    this.removeStructuredData();

    // Create script element
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    script.id = 'structured-data';

    // Add to head
    document.head.appendChild(script);
  }

  /**
   * Remove existing structured data
   */
  removeStructuredData(): void {
    const existingScript = document.getElementById('structured-data');
    if (existingScript) {
      existingScript.remove();
    }
  }

  /**
   * Generate structured data for blog posts
   */
  generateBlogStructuredData(blog: any, currentUrl: string): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: blog.title,
      description: blog.excerpt || blog.content?.substring(0, 160),
      image: blog.featured_image,
      url: currentUrl,
      author: {
        '@type': 'Person',
        name: blog.author || 'Tech Trends Talks'
      },
      publisher: {
        '@type': 'Organization',
        name: 'Tech Trends Talks',
        logo: {
          '@type': 'ImageObject',
          url: 'https://techtrendstalks.com/assets/images/techtrendstalks-logo.jpeg'
        }
      },
      datePublished: blog.published_at,
      dateModified: blog.updated_at || blog.published_at,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': currentUrl
      },
      articleSection: blog.category?.name || 'Finance',
      keywords: blog.tags?.join(', ') || 'emi calculator, loan calculator, finance'
    };
  }

  /**
   * Generate structured data for calculator pages
   */
  generateCalculatorStructuredData(calculatorType: CalculatorType, currentUrl: string): StructuredData {
    const calculatorData: Record<CalculatorType, { name: string; description: string; category: string; keywords: string[] }> = {
      'emi-calculator': {
        name: 'EMI Calculator',
        description: 'Calculate your monthly EMI and view complete repayment schedule for home, car, personal, and other loans.',
        category: 'Loan Calculator',
        keywords: ['emi calculator', 'loan calculator', 'home loan emi', 'car loan calculator']
      },
      'sip-calculator': {
        name: 'SIP Calculator',
        description: 'Calculate SIP returns and investment growth for mutual funds and other investment instruments. Plan your financial future with our comprehensive investment calculator.',
        category: 'Investment Calculator',
        keywords: ['sip calculator', 'mutual fund calculator', 'investment calculator', 'sip returns calculator']
      },
      'loan-eligibility': {
        name: 'Loan Eligibility Calculator',
        description: 'Check your loan eligibility instantly and get personalized loan recommendations.',
        category: 'Loan Eligibility Tool',
        keywords: ['loan eligibility calculator', 'loan approval chances', 'loan amount calculator']
      }
    };

    const data = calculatorData[calculatorType] || calculatorData['emi-calculator'];

    return {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: data.name,
      description: data.description,
      url: currentUrl,
      applicationCategory: data.category,
      operatingSystem: 'Web Browser',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      keywords: data.keywords.join(', '),
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
        description: 'Free online calculator tool'
      },
      provider: {
        '@type': 'Organization',
        name: 'Tech Trends Talks',
        url: 'https://techtrendstalks.com'
      },
      featureList: [
        'Free online calculator',
        'Instant calculations',
        'Downloadable reports',
        'Mobile responsive',
        'No registration required'
      ]
    };
  }

  /**
   * Generate structured data for the organization
   */
  generateOrganizationStructuredData(): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Tech Trends Talks',
      url: 'https://techtrendstalks.com',
      logo: 'https://techtrendstalks.com/assets/images/techtrendstalks-logo.jpeg',
      description: 'EMI calculators for home, car, personal, gold, and more loans. Fast approvals, flexible repayment, and PDF download of EMI breakdowns and sip calculator',
      sameAs: [
        'https://www.facebook.com/techtrendstalks',
        'https://www.twitter.com/techtrendstalks',
        'https://www.instagram.com/techtrendstalks',
        'https://www.linkedin.com/company/techtrendstalks',
        'https://www.youtube.com/techtrendstalks'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        availableLanguage: 'English, Hindi'
      },
      areaServed: {
        '@type': 'Country',
        name: 'India'
      }
    };
  }

  /**
   * Generate structured data for breadcrumbs
   */
  generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>): StructuredData {
    const breadcrumbList = breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url
    }));

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbList
    };
  }

  /**
   * Generate structured data for FAQ
   */
  generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>): StructuredData {
    const mainEntity = faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }));

    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity
    };
  }
}
