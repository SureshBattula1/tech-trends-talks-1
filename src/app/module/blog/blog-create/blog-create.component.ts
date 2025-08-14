import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-blog-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatCardModule
  ],
  template: `
    <div class="blog-create-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Create New Blog Post</mat-card-title>
          <mat-card-subtitle>Add new content to improve SEO</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="blogForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Blog Title</mat-label>
                <input matInput formControlName="title" placeholder="Enter blog title">
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Excerpt</mat-label>
                <textarea matInput formControlName="excerpt" rows="3" placeholder="Enter blog excerpt"></textarea>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Content</mat-label>
                <textarea matInput formControlName="content" rows="15" placeholder="Enter blog content"></textarea>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Tags (comma separated)</mat-label>
                <input matInput formControlName="tags" placeholder="Enter tags separated by commas">
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button 
                mat-raised-button 
                color="primary" 
                type="submit"
                [disabled]="isSubmitting">
                {{ isSubmitting ? 'Creating...' : 'Create Blog Post' }}
              </button>
              
              <button 
                mat-stroked-button 
                type="button"
                (click)="createEMICalculatorBlog()"
                [disabled]="isSubmitting">
                Create EMI Calculator SEO Blog
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .blog-create-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .form-row {
      margin-bottom: 20px;
    }
    
    .full-width {
      width: 100%;
    }
    
    .form-actions {
      display: flex;
      gap: 15px;
      margin-top: 30px;
    }
    
    .form-actions button {
      flex: 1;
    }
  `]
})
export class BlogCreateComponent implements OnInit {
  blogForm!: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.blogForm = this.fb.group({
      title: ['', [Validators.required]],
      excerpt: ['', [Validators.required]],
      content: ['', [Validators.required]],
      tags: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.blogForm.valid) {
      this.isSubmitting = true;
      
      const blogData = {
        title: this.blogForm.get('title')?.value,
        excerpt: this.blogForm.get('excerpt')?.value,
        content: this.blogForm.get('content')?.value,
        tags: this.blogForm.get('tags')?.value.split(',').map((tag: string) => tag.trim()),
        category_id: 1,
        author: "Tech Trends Talks",
        is_published: true,
        is_featured: false
      };

      this.apiService.createBlog(blogData).subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open('Blog post created successfully!', 'Close', {
              duration: 5000
            });
            this.blogForm.reset();
          } else {
            this.snackBar.open('Failed to create blog post', 'Close', {
              duration: 3000
            });
          }
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error creating blog:', error);
          this.snackBar.open('Error creating blog post', 'Close', {
            duration: 3000
          });
          this.isSubmitting = false;
        }
      });
    }
  }

  createEMICalculatorBlog(): void {
    this.isSubmitting = true;
    
    const emiBlogData = {
      title: "Complete Guide to EMI Calculator - Calculate Loan EMI, Interest & Repayment Schedule",
      excerpt: "Learn everything about EMI calculators, how they work, different types of loans, and how to use our free EMI calculator tool. Get expert tips on reducing EMI and planning your loan repayment.",
      content: `
# Complete Guide to EMI Calculator - Calculate Loan EMI, Interest & Repayment Schedule

## What is EMI Calculator?

An **EMI Calculator** is an essential financial tool that helps borrowers calculate their monthly loan payments. EMI stands for **Equated Monthly Installment**, which is the fixed amount you pay every month until your loan is fully repaid.

## How Does EMI Calculator Work?

The EMI calculator uses a mathematical formula to determine your monthly payment:

**EMI = P × R × (1 + R)^N / [(1 + R)^N - 1]**

Where:
- **P** = Principal Loan Amount
- **R** = Monthly Interest Rate (Annual Rate ÷ 12 ÷ 100)
- **N** = Total Number of Months

## Types of Loans You Can Calculate

### 1. Home Loan EMI Calculator
- **Interest Rates**: Starting from 8.5% p.a.
- **Features**: Long tenure options, tax benefits
- **Best For**: Property purchase, construction, renovation

### 2. Car Loan EMI Calculator
- **Interest Rates**: Starting from 9.2% p.a.
- **Features**: Quick disbursal, minimal documentation
- **Best For**: New and used car purchases

### 3. Personal Loan EMI Calculator
- **Interest Rates**: Starting from 11.75% p.a.
- **Features**: No collateral required, flexible usage
- **Best For**: Medical emergencies, education, travel

### 4. Education Loan EMI Calculator
- **Interest Rates**: Starting from 7.8% p.a.
- **Features**: Extended repayment period, lower rates
- **Best For**: Domestic and international education

### 5. Gold Loan EMI Calculator
- **Interest Rates**: Starting from 10.5% p.a.
- **Features**: Quick processing, gold as collateral
- **Best For**: Short-term financial needs

### 6. Business Loan EMI Calculator
- **Interest Rates**: Starting from 12.0% p.a.
- **Features**: Business expansion, working capital
- **Best For**: Entrepreneurs and business owners

## Factors Affecting EMI Amount

### 1. Principal Amount
- Higher loan amount = Higher EMI
- Consider your actual needs vs. borrowing capacity

### 2. Interest Rate
- Higher interest rate = Higher EMI
- Maintain good credit score for better rates

### 3. Loan Tenure
- Longer tenure = Lower EMI but higher total interest
- Shorter tenure = Higher EMI but lower total cost

### 4. Processing Fees
- Additional costs ranging from 0.5% to 2%
- Factor these into your total loan cost

## Tips to Reduce EMI Amount

### 1. Choose Longer Tenure
- Reduces monthly payment burden
- Increases total interest cost
- Better for long-term financial planning

### 2. Improve Credit Score
- Maintain good payment history
- Keep credit utilization low
- Regular credit report monitoring

### 3. Compare Lenders
- Research multiple banks and NBFCs
- Negotiate for better rates
- Consider online lenders for competitive rates

### 4. Make Larger Down Payment
- Reduces principal amount
- Lowers EMI and total interest
- Improves loan approval chances

### 5. Consider Prepayment Options
- Pay extra amounts when possible
- Reduces total interest burden
- Helps become debt-free faster

## How to Use Our EMI Calculator

### Step 1: Enter Loan Details
- Input the loan amount you need
- Select the loan type (home, car, personal, etc.)
- Choose your preferred loan tenure

### Step 2: Get Instant Results
- View your monthly EMI amount
- See total interest and total payment
- Download detailed repayment schedule

### Step 3: Plan Your Budget
- Compare different loan scenarios
- Adjust tenure to fit your budget
- Plan for additional costs

## Benefits of Using Our EMI Calculator

### 1. Free and Accurate
- No registration required
- Instant calculations
- Professional-grade accuracy

### 2. Multiple Loan Types
- Support for all major loan categories
- Customized interest rates
- Real-time market rates

### 3. Complete Breakdown
- Monthly payment details
- Principal and interest split
- Outstanding balance tracking

### 4. PDF Download
- Save calculation results
- Share with family members
- Keep for future reference

### 5. Mobile Friendly
- Works on all devices
- Responsive design
- Touch-friendly interface

## Common EMI Calculator Mistakes to Avoid

### 1. Ignoring Processing Fees
- Factor in all additional costs
- Calculate total loan cost, not just EMI
- Compare total cost across lenders

### 2. Not Considering Prepayment
- Check prepayment terms
- Calculate potential savings
- Plan for early closure

### 3. Ignoring Rate Changes
- Fixed vs. floating rates
- Rate reset periods
- Impact on future EMIs

### 4. Not Planning for Rate Hikes
- Build buffer in your budget
- Consider worst-case scenarios
- Plan for rate fluctuations

## EMI Calculator vs. Other Tools

### EMI Calculator vs. SIP Calculator
- **EMI**: For loan repayment planning
- **SIP**: For investment growth planning
- **Use Both**: For comprehensive financial planning

### EMI Calculator vs. Interest Calculator
- **EMI**: Monthly payment amount
- **Interest**: Total interest cost
- **Combined**: Complete loan understanding

## When to Use EMI Calculator

### 1. Before Taking a Loan
- Assess affordability
- Compare loan options
- Plan your budget

### 2. During Loan Repayment
- Track progress
- Plan prepayments
- Monitor interest savings

### 3. For Financial Planning
- Debt management
- Budget allocation
- Long-term planning

## Expert Tips for EMI Management

### 1. Emergency Fund
- Maintain 3-6 months of EMI
- Protects against job loss
- Covers unexpected expenses

### 2. Multiple Income Sources
- Diversify income streams
- Reduce dependency on salary
- Better EMI management

### 3. Regular Review
- Monitor loan progress
- Check for better rates
- Optimize repayment strategy

## Conclusion

An EMI calculator is an essential tool for anyone planning to take a loan or currently repaying one. Our free EMI calculator provides accurate calculations, comprehensive breakdowns, and helps you make informed financial decisions.

Use it to:
- Plan your loan budget
- Compare different loan options
- Track your repayment progress
- Optimize your loan strategy

Start using our EMI calculator today and take control of your financial future!

---

**Keywords**: EMI Calculator, Loan Calculator, Home Loan EMI, Car Loan Calculator, Personal Loan EMI, Interest Calculator, Loan Repayment, Monthly Installment, Financial Planning, Debt Management

**Related Tools**: [SIP Calculator](/calculator/sip-calculator), [Loan Eligibility Calculator](/loan-eligibility-calculator/checker), [Financial Blog](/blogs/home)
      `,
      tags: ["emi calculator", "loan calculator", "home loan emi", "car loan calculator", "personal loan emi", "interest calculator", "loan repayment", "monthly installment", "financial planning", "debt management"],
      category_id: 1,
      author: "Tech Trends Talks",
      is_published: true,
      is_featured: false
    };

    // Create the blog post
    this.apiService.createBlog(emiBlogData).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('EMI Calculator SEO blog created successfully!', 'Close', {
            duration: 5000
          });
        } else {
          this.snackBar.open('Failed to create blog post', 'Close', {
            duration: 3000
          });
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error creating blog:', error);
        this.snackBar.open('Error creating blog post', 'Close', {
          duration: 3000
        });
        this.isSubmitting = false;
      }
    });
  }
}