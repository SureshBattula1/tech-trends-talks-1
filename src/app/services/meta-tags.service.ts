import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface MetaTags {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
}

export type CalculatorType = 'emi-calculator' | 'sip-calculator' | 'loan-eligibility' | 'grade-calculator';

@Injectable({
  providedIn: 'root'
})
export class MetaTagsService {
  private meta = inject(Meta);
  private title = inject(Title);

  private readonly defaultTags: MetaTags = {
    title: 'Tech Trends Talks - EMI Calculators & Smart Loan Insights',
    description: 'EMI calculators for home, car, personal, gold, and more loans. Fast approvals, flexible repayment, and PDF download of EMI breakdowns and sip calculator',
    keywords: 'emi calculator, sip calculator, loan calculator, mutual fund calculator, sip return calculator, समान मासिक किस्त, personal loan, home loan, car loan, emi download',
    author: 'Tech Trends Talks',
    ogType: 'website',
    twitterCard: 'summary_large_image'
  };

  /**
   * Update meta tags for a specific page
   */
  updateMetaTags(tags: Partial<MetaTags>): void {
    const combinedTags = { ...this.defaultTags, ...tags };
    
    // Update title
    if (combinedTags.title) {
      this.title.setTitle(combinedTags.title);
    }

    // Update basic meta tags
    this.updateBasicMetaTags(combinedTags);
    
    // Update Open Graph tags
    this.updateOpenGraphTags(combinedTags);
    
    // Update Twitter Card tags
    this.updateTwitterCardTags(combinedTags);
    
    // Update canonical URL
    this.updateCanonicalUrl(combinedTags.canonicalUrl);
  }

  /**
   * Update basic meta tags
   */
  private updateBasicMetaTags(tags: MetaTags): void {
    if (tags.description) {
      this.meta.updateTag({ name: 'description', content: tags.description });
    }
    if (tags.keywords) {
      this.meta.updateTag({ name: 'keywords', content: tags.keywords });
    }
    if (tags.author) {
      this.meta.updateTag({ name: 'author', content: tags.author });
    }
  }

  /**
   * Update Open Graph meta tags
   */
  private updateOpenGraphTags(tags: MetaTags): void {
    const ogTags = [
      { property: 'og:title', content: tags.ogTitle || tags.title },
      { property: 'og:description', content: tags.ogDescription || tags.description },
      { property: 'og:image', content: tags.ogImage },
      { property: 'og:url', content: tags.ogUrl },
      { property: 'og:type', content: tags.ogType },
      { property: 'og:site_name', content: 'Tech Trends Talks' }
    ];

    ogTags.forEach(tag => {
      if (tag.content) {
        this.meta.updateTag({ property: tag.property, content: tag.content });
      }
    });
  }

  /**
   * Update Twitter Card meta tags
   */
  private updateTwitterCardTags(tags: MetaTags): void {
    const twitterTags = [
      { name: 'twitter:card', content: tags.twitterCard },
      { name: 'twitter:title', content: tags.twitterTitle || tags.title },
      { name: 'twitter:description', content: tags.twitterDescription || tags.description },
      { name: 'twitter:image', content: tags.twitterImage || tags.ogImage },
      { name: 'twitter:site', content: '@TechTrendsTalks' }
    ];

    twitterTags.forEach(tag => {
      if (tag.content) {
        this.meta.updateTag({ name: tag.name, content: tag.content });
      }
    });
  }

  /**
   * Update canonical URL
   */
  private updateCanonicalUrl(url?: string): void {
    if (url) {
      // Remove existing canonical link
      const existingCanonical = document.querySelector('link[rel="canonical"]');
      if (existingCanonical) {
        existingCanonical.remove();
      }

      // Add new canonical link
      const canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      canonicalLink.href = url;
      document.head.appendChild(canonicalLink);
    }
  }

  /**
   * Reset meta tags to default values
   */
  resetToDefault(): void {
    this.updateMetaTags(this.defaultTags);
  }

  /**
   * Generate meta tags for blog posts
   */
  generateBlogMetaTags(blog: any, currentUrl: string): MetaTags {
    return {
      title: `${blog.title} - Tech Trends Talks`,
      description: blog.excerpt || blog.content?.substring(0, 160) || this.defaultTags.description,
      keywords: blog.tags?.join(', ') || this.defaultTags.keywords,
      ogTitle: blog.title,
      ogDescription: blog.excerpt || blog.content?.substring(0, 160),
      ogImage: blog.featured_image,
      ogUrl: currentUrl,
      ogType: 'article',
      twitterTitle: blog.title,
      twitterDescription: blog.excerpt || blog.content?.substring(0, 160),
      twitterImage: blog.featured_image,
      canonicalUrl: currentUrl
    };
  }

  /**
   * Generate meta tags for calculator pages
   */
  generateCalculatorMetaTags(calculatorType: CalculatorType, currentUrl: string): MetaTags {
    const calculatorTitles: Record<CalculatorType, string> = {
      'emi-calculator': 'EMI Calculator - Calculate Loan EMI & Repayment Schedule',
      'sip-calculator': 'SIP Calculator - Calculate Mutual Fund Returns & Investment Growth | Free Online Tool',
      'loan-eligibility': 'Loan Eligibility Calculator - Check Your Loan Approval Chances',
      'grade-calculator': 'Student Grade Calculator - Calculate SGPA & CGPA Online'
    };

      const calculatorDescriptions: Record<CalculatorType, string> = {
    'emi-calculator': 'Free EMI calculator for home, car, personal loans. Calculate monthly EMI, total interest, and view complete repayment schedule with PDF download.',
    'sip-calculator': 'Free SIP calculator to estimate mutual fund returns and investment growth. Calculate monthly SIP amounts, track wealth creation, and plan your financial future with our comprehensive investment calculator.',
    'loan-eligibility': 'Check your loan eligibility instantly. Calculate loan amount, EMI, and get personalized loan recommendations based on your income and credit score.',
    'grade-calculator': 'Free online Grade Calculator for students to calculate SGPA and CGPA. Convert marks to grades using SASTRA grading system, calculate semester GPA, and cumulative GPA with detailed analysis.'
  };

    const calculatorKeywords: Record<CalculatorType, string> = {
      'emi-calculator': 'emi calculator, loan calculator, home loan emi, car loan calculator, personal loan emi, interest calculator, loan repayment',
      'sip-calculator': 'sip calculator, mutual fund calculator, investment calculator, sip returns calculator, monthly investment calculator, wealth calculator, compound interest calculator, mutual fund sip',
      'loan-eligibility': 'loan eligibility calculator, loan approval chances, loan amount calculator, credit score calculator, personal loan eligibility',
      'grade-calculator': 'grade calculator, SGPA calculator, CGPA calculator, GPA calculator, marks to grade converter, semester grade point average, cumulative grade point average, SASTRA grading system, student grade calculator'
    };

    return {
      title: calculatorTitles[calculatorType] || this.defaultTags.title,
      description: calculatorDescriptions[calculatorType] || this.defaultTags.description,
      keywords: calculatorKeywords[calculatorType] || this.defaultTags.keywords,
      ogTitle: calculatorTitles[calculatorType],
      ogDescription: calculatorDescriptions[calculatorType],
      ogUrl: currentUrl,
      ogType: 'website',
      twitterTitle: calculatorTitles[calculatorType],
      twitterDescription: calculatorDescriptions[calculatorType],
      canonicalUrl: currentUrl
    };
  }
}
