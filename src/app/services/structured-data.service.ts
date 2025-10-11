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
    const calculatorData: Record<CalculatorType, { name: string; description: string; category: string; keywords: string[]; aggregateRating?: any; offers?: any }> = {
      'emi-calculator': {
        name: 'EMI Calculator Online - Free Loan EMI Calculator',
        description: 'Free online EMI calculator to calculate monthly loan installments for home loans, car loans, personal loans, business loans with accurate results and detailed repayment schedule.',
        category: 'FinanceApplication',
        keywords: ['emi calculator', 'loan calculator', 'home loan emi calculator', 'car loan calculator', 'personal loan calculator', 'monthly installment calculator', 'loan repayment calculator'],
        aggregateRating: {
          '@type': 'AggregateRating',
          'ratingValue': '4.8',
          'ratingCount': '2547',
          'bestRating': '5',
          'worstRating': '1'
        },
        offers: {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'INR',
          'availability': 'https://schema.org/InStock',
          'description': 'Free EMI Calculator with no registration required'
        }
      },
      'sip-calculator': {
        name: 'SIP Calculator Online - Free Mutual Fund SIP Calculator',
        description: 'Free online SIP calculator to calculate mutual fund returns and investment growth. Plan your SIP investments with accurate calculations, detailed analysis, and wealth creation tracking.',
        category: 'FinanceApplication',
        keywords: ['sip calculator', 'mutual fund calculator', 'investment calculator', 'sip returns calculator', 'systematic investment plan calculator', 'wealth calculator', 'retirement planning calculator'],
        aggregateRating: {
          '@type': 'AggregateRating',
          'ratingValue': '4.7',
          'ratingCount': '1892',
          'bestRating': '5',
          'worstRating': '1'
        },
        offers: {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'INR',
          'availability': 'https://schema.org/InStock',
          'description': 'Free SIP Calculator with no registration required'
        }
      },
      'swp-calculator': {
        name: 'SWP Calculator Online - Free Systematic Withdrawal Plan Calculator',
        description: 'Free online SWP calculator to plan systematic withdrawals from your investments. Calculate monthly withdrawals, remaining corpus, and plan your retirement income with accurate projections.',
        category: 'FinanceApplication',
        keywords: ['swp calculator', 'systematic withdrawal plan calculator', 'retirement income calculator', 'pension calculator', 'withdrawal calculator', 'retirement planning calculator', 'monthly income calculator'],
        aggregateRating: {
          '@type': 'AggregateRating',
          'ratingValue': '4.7',
          'ratingCount': '1543',
          'bestRating': '5',
          'worstRating': '1'
        },
        offers: {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'INR',
          'availability': 'https://schema.org/InStock',
          'description': 'Free SWP Calculator with no registration required'
        }
      },
      'loan-eligibility': {
        name: 'Loan Eligibility Calculator Online - Check Loan Approval Chances',
        description: 'Free loan eligibility calculator to check your loan approval chances instantly. Calculate maximum loan amount, EMI, and get personalized recommendations for home loans, personal loans, car loans.',
        category: 'FinanceApplication',
        keywords: ['loan eligibility calculator', 'loan approval chances', 'loan amount calculator', 'credit score calculator', 'loan qualification calculator', 'affordability calculator'],
        aggregateRating: {
          '@type': 'AggregateRating',
          'ratingValue': '4.6',
          'ratingCount': '1456',
          'bestRating': '5',
          'worstRating': '1'
        },
        offers: {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'INR',
          'availability': 'https://schema.org/InStock',
          'description': 'Free Loan Eligibility Calculator with instant results'
        }
      },
      'grade-calculator': {
        name: 'Grade Calculator Online - Free SGPA & CGPA Calculator',
        description: 'Free online grade calculator for students to calculate SGPA, CGPA, and GPA. Convert marks to grades, calculate semester grade point average with detailed analysis and performance tracking.',
        category: 'EducationApplication',
        keywords: ['grade calculator', 'SGPA calculator', 'CGPA calculator', 'GPA calculator', 'student grade calculator', 'marks to grade converter', 'semester grade calculator'],
        aggregateRating: {
          '@type': 'AggregateRating',
          'ratingValue': '4.5',
          'ratingCount': '987',
          'bestRating': '5',
          'worstRating': '1'
        },
        offers: {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'INR',
          'availability': 'https://schema.org/InStock',
          'description': 'Free Grade Calculator for students with instant results'
        }
      }
    };

    const data = calculatorData[calculatorType] || calculatorData['emi-calculator'];

    const baseStructuredData: any = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: data.name,
      description: data.description,
      url: currentUrl,
      applicationCategory: data.category,
      operatingSystem: 'Web Browser',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      keywords: data.keywords.join(', '),
      offers: data.offers || {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
        description: 'Free online calculator tool'
      },
      provider: {
        '@type': 'Organization',
        name: 'Tech Trends Talks',
        url: 'https://techtrendstalks.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://techtrendstalks.com/assets/images/techtrendstalks-logo.jpeg'
        },
        sameAs: [
          'https://twitter.com/techtrendstalks',
          'https://linkedin.com/company/techtrendstalks',
          'https://facebook.com/techtrendstalks'
        ]
      },
      featureList: [
        'Free online calculator',
        'Instant calculations',
        'Downloadable reports',
        'Mobile responsive',
        'No registration required',
        'Multiple loan types supported',
        'Detailed amortization schedule'
      ],
      datePublished: '2024-01-01T00:00:00Z',
      dateModified: new Date().toISOString(),
      inLanguage: 'en-IN',
      isAccessibleForFree: true
    };

    // Add aggregateRating if available
    if (data.aggregateRating) {
      baseStructuredData['aggregateRating'] = data.aggregateRating;
    }

    return baseStructuredData;
  }

  /**
   * Generate FAQ structured data for better search visibility
   */
  generateFAQStructuredData(calculatorType?: CalculatorType): StructuredData {
    const calculatorFAQs: Record<CalculatorType, any[]> = {
      'emi-calculator': [
        {
          '@type': 'Question',
          name: 'How to calculate EMI using EMI calculator?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'To calculate EMI, enter loan amount, interest rate, and tenure in our EMI calculator. The calculator uses the formula: EMI = [P x R x (1+R)^N] / [(1+R)^N-1], where P is principal, R is monthly interest rate, and N is number of months.'
          }
        },
        {
          '@type': 'Question',
          name: 'What is EMI in loan?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'EMI stands for Equated Monthly Installment. It is the fixed monthly payment amount that borrowers pay to lenders to repay their loans. EMI includes both principal and interest components.'
          }
        },
        {
          '@type': 'Question',
          name: 'Is EMI calculator accurate?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, our EMI calculator provides 100% accurate results using the standard EMI calculation formula. The results match with bank calculations and help you plan your finances effectively.'
          }
        }
      ],
      'swp-calculator': [
        {
          '@type': 'Question',
          name: 'What is SWP calculator and how does it work?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'SWP calculator helps you plan systematic withdrawals from your investments. Enter your initial investment amount, desired monthly withdrawal, expected return rate, and tenure. The calculator shows how long your corpus will last and the remaining balance after withdrawals.'
          }
        },
        {
          '@type': 'Question',
          name: 'What is Systematic Withdrawal Plan (SWP)?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'SWP or Systematic Withdrawal Plan allows investors to withdraw a fixed amount regularly from their mutual fund investments. It provides a steady income stream while keeping the remaining corpus invested to earn returns.'
          }
        },
        {
          '@type': 'Question',
          name: 'Is SWP good for retirement planning?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, SWP is excellent for retirement planning as it provides regular income while your investment continues to grow. It offers tax efficiency, flexibility, and helps maintain purchasing power through inflation-beating returns.'
          }
        },
        {
          '@type': 'Question',
          name: 'How is SWP different from SIP?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'SIP (Systematic Investment Plan) involves regular investments to build corpus, while SWP (Systematic Withdrawal Plan) involves regular withdrawals from existing corpus. SIP is for wealth creation, SWP is for generating regular income from accumulated wealth.'
          }
        }
      ],
      'sip-calculator': [
        {
          '@type': 'Question',
          name: 'How to calculate SIP returns using SIP calculator?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Enter your monthly SIP amount, expected annual return rate, and investment tenure in our SIP calculator. It calculates the maturity amount using compound interest formula and shows wealth creation over time.'
          }
        },
        {
          '@type': 'Question',
          name: 'What is SIP in mutual funds?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'SIP stands for Systematic Investment Plan. It allows you to invest a fixed amount regularly in mutual funds, helping you build wealth through rupee cost averaging and the power of compounding.'
          }
        },
        {
          '@type': 'Question',
          name: 'Is SIP calculator accurate for mutual fund planning?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, our SIP calculator provides accurate projections based on the expected return rate. However, actual returns may vary as mutual fund investments are subject to market risks.'
          }
        }
      ],
      'loan-eligibility': [
        {
          '@type': 'Question',
          name: 'How to check loan eligibility online?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Enter your monthly income, existing EMIs, desired loan amount, and tenure in our loan eligibility calculator. It instantly calculates your eligibility based on income, debt-to-income ratio, and credit profile.'
          }
        },
        {
          '@type': 'Question',
          name: 'What factors affect loan eligibility?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Key factors include monthly income, credit score, existing EMIs, employment type, age, loan amount, and tenure. Our calculator considers all these factors to determine your loan eligibility.'
          }
        },
        {
          '@type': 'Question',
          name: 'What is the minimum income required for loan eligibility?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Minimum income requirements vary by loan type. Generally, ₹15,000-₹25,000 monthly income is required for personal loans, while home loans may require ₹25,000-₹40,000 depending on the loan amount.'
          }
        }
      ],
      'grade-calculator': [
        {
          '@type': 'Question',
          name: 'How to calculate SGPA and CGPA using grade calculator?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Enter your subject marks or grades along with credit hours in our grade calculator. It automatically converts marks to grades and calculates SGPA for the semester and cumulative CGPA.'
          }
        },
        {
          '@type': 'Question',
          name: 'What is the difference between SGPA and CGPA?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'SGPA (Semester Grade Point Average) is the average grade points for one semester, while CGPA (Cumulative Grade Point Average) is the overall average across all completed semesters.'
          }
        },
        {
          '@type': 'Question',
          name: 'How are grades converted to grade points?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Our calculator uses standard grading scales where A+ = 10, A = 9, B+ = 8, B = 7, C+ = 6, C = 5, D = 4, and F = 0. The exact scale may vary by institution.'
          }
        }
      ]
    };

    const defaultFAQs = calculatorFAQs['emi-calculator'];
    const faqs = calculatorType ? calculatorFAQs[calculatorType] || defaultFAQs : defaultFAQs;
    
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs
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
   * Generate WebSite structured data with search action
   */
  generateWebSiteStructuredData(baseUrl: string): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'Tech Trends Talks',
      'alternateName': 'TechTrendsTalks',
      'url': baseUrl,
      'description': 'Free online financial calculators for EMI, SIP, loan eligibility, and investment planning in India',
      'inLanguage': 'en-IN',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': {
          '@type': 'EntryPoint',
          'urlTemplate': `${baseUrl}/search?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      },
      'sameAs': [
        'https://www.facebook.com/techtrendstalks',
        'https://twitter.com/techtrendstalks',
        'https://www.instagram.com/techtrendstalks',
        'https://www.linkedin.com/company/techtrendstalks',
        'https://www.youtube.com/techtrendstalks'
      ],
      'publisher': {
        '@type': 'Organization',
        'name': 'Tech Trends Talks',
        'logo': {
          '@type': 'ImageObject',
          'url': `${baseUrl}/assets/images/techtrendstalks-logo.jpeg`
        }
      }
    };
  }

  /**
   * Add multiple structured data scripts (for website, organization, breadcrumbs, etc.)
   */
  addMultipleStructuredData(dataArray: StructuredData[]): void {
    // Remove all existing structured data scripts
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => {
      if (script.id !== 'structured-data') {
        script.remove();
      }
    });

    // Add each structured data with unique IDs
    dataArray.forEach((data, index) => {
      const id = `structured-data-${index}`;
      const existingScript = document.getElementById(id);
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = id;
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
    });
  }

  /**
   * Generate HowTo structured data for tutorial pages
   */
  generateHowToStructuredData(
    name: string,
    description: string,
    steps: Array<{ name: string; text: string; image?: string }>,
    totalTime?: string
  ): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      'name': name,
      'description': description,
      'totalTime': totalTime || 'PT5M',
      'step': steps.map((step, index) => ({
        '@type': 'HowToStep',
        'position': index + 1,
        'name': step.name,
        'text': step.text,
        'image': step.image
      }))
    };
  }

  /**
   * Generate Product structured data for calculators as tools
   */
  generateProductStructuredData(
    name: string,
    description: string,
    url: string,
    image: string
  ): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': name,
      'description': description,
      'url': url,
      'image': image,
      'brand': {
        '@type': 'Brand',
        'name': 'Tech Trends Talks'
      },
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'INR',
        'availability': 'https://schema.org/InStock',
        'url': url
      },
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.8',
        'reviewCount': '2547',
        'bestRating': '5',
        'worstRating': '1'
      }
    };
  }

}
