import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, signal, ViewChild, ElementRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { trigger, state, style, transition, animate, keyframes, query, stagger } from '@angular/animations';
import { Meta, Title } from '@angular/platform-browser';
import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MetaTagsService, CalculatorType } from '../../../services/meta-tags.service';
import { StructuredDataService } from '../../../services/structured-data.service';
import { Router } from '@angular/router';
import { LoaderService } from '../../../services/loading-bar/loader.service';
import { SharedModule } from '../../shared/shared.module';
import { PriceProgressBarComponent } from '../price-progress-bar/price-progress-bar.component';

interface Course {
  name: string;
  credits: number;
  marks: number;
  grade: string;
  gradePoint: number;
  performance: string;
  color: string;
}

interface Semester {
  name: string;
  courses: Course[];
  sgpa: number;
  credits: number;
  totalMarks: number;
  averageMarks: number;
  gradeDistribution: { [key: string]: number };
}

interface GradeAnalysis {
  totalCourses: number;
  totalCredits: number;
  averageSGPA: number;
  bestSemester: string;
  worstSemester: string;
  gradeDistribution: { [key: string]: number };
  performanceTrend: 'improving' | 'declining' | 'stable';
  recommendations: string[];
}

@Component({
  selector: 'app-grade-calculator',
  standalone: true,
  imports: [ SharedModule, PriceProgressBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './grade-calculator.component.html',
  styleUrls: ['./grade-calculator.component.scss'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('600ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ])
    ]),
    trigger('fadeInUp', [
      transition(':enter', [
        style({ transform: 'translateY(30px)', opacity: 0 }),
        animate('500ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('bounceIn', [
      transition(':enter', [
        animate('800ms ease-out', keyframes([
          style({ transform: 'scale(0.3)', opacity: 0, offset: 0 }),
          style({ transform: 'scale(1.05)', offset: 0.8 }),
          style({ transform: 'scale(1)', opacity: 1, offset: 1 })
        ]))
      ])
    ]),
    trigger('pulse', [
      state('normal', style({ transform: 'scale(1)' })),
      state('pulse', style({ transform: 'scale(1.05)' })),
      transition('normal <=> pulse', animate('200ms ease-in-out'))
    ]),
    trigger('staggerList', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('expandCollapse', [
      state('collapsed', style({ height: '0px', opacity: 0 })),
      state('expanded', style({ height: '*', opacity: 1 })),
      transition('collapsed <=> expanded', animate('300ms ease-in-out'))
    ])
  ]
})
export class GradeCalculatorComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  @ViewChild('resultSection') resultSection!: ElementRef;

  public loader = inject(LoaderService);
  private cd = inject(ChangeDetectorRef);
  private metaTagsService = inject(MetaTagsService);
  private structuredDataService = inject(StructuredDataService);
  private router = inject(Router);
  private meta = inject(Meta);
  private title = inject(Title);
  private fb = inject(FormBuilder);

  // Add Object property for template
  Object = Object;

  // Form and Data
  gradeCalculatorForm!: FormGroup;
  semesters: Semester[] = [];
  cgpa: number = 0;
  percentage: number = 0;
  showResults: boolean = false;
  animationState: string = 'normal';
  isFormReady: boolean = false;
  expandedSemesters: Set<number> = new Set();
  activeFaqIndex: number | null = null;

  // Advanced Analysis
  gradeAnalysis: GradeAnalysis | null = null;
  performanceInsights: string[] = [];
  improvementSuggestions: string[] = [];

  // Chart Configuration
  chartType: ChartType = 'doughnut';
  chartData: ChartConfiguration['data'] = {
    labels: ['S (Outstanding)', 'A+ (Excellent)', 'A (Very Good)', 'B (Good)', 'C (Satisfactory)', 'D (Pass)', 'F (Fail)'],
    datasets: [{
      data: [0, 0, 0, 0, 0, 0, 0],
      backgroundColor: ['#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FF9800', '#FF5722', '#F44336'],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#333',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const data = context.dataset.data as number[];
            const total = data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : '0.0';
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    }
  };

  // SASTRA Grading System (2015-16 onwards) - Based on the reference image
  readonly gradingSystem = [
    { min: 91, max: 100, grade: 'S', gradePoint: 10, performance: 'Outstanding', color: '#4CAF50' },
    { min: 86, max: 90, grade: 'A+', gradePoint: 9, performance: 'Excellent', color: '#8BC34A' },
    { min: 75, max: 85, grade: 'A', gradePoint: 8, performance: 'Very Good', color: '#CDDC39' },
    { min: 66, max: 74, grade: 'B', gradePoint: 7, performance: 'Good', color: '#FFEB3B' },
    { min: 55, max: 65, grade: 'C', gradePoint: 6, performance: 'Satisfactory', color: '#FF9800' },
    { min: 50, max: 54, grade: 'D', gradePoint: 5, performance: 'Pass', color: '#FF5722' },
    { min: 0, max: 49, grade: 'F', gradePoint: 0, performance: 'Fail', color: '#F44336' },
    { min: -1, max: -1, grade: 'E', gradePoint: 0, performance: 'Exposure', color: '#9E9E9E' } // Absent
  ];

  // Predefined course templates
  readonly courseTemplates = {
    'Computer Science': [
      { name: 'Programming Fundamentals', credits: 4 },
      { name: 'Data Structures', credits: 4 },
      { name: 'Database Management', credits: 3 },
      { name: 'Computer Networks', credits: 3 },
      { name: 'Software Engineering', credits: 3 }
    ],
    'Mechanical Engineering': [
      { name: 'Engineering Mechanics', credits: 4 },
      { name: 'Thermodynamics', credits: 3 },
      { name: 'Machine Design', credits: 4 },
      { name: 'Manufacturing Processes', credits: 3 },
      { name: 'Fluid Mechanics', credits: 3 }
    ],
    'Electrical Engineering': [
      { name: 'Circuit Theory', credits: 4 },
      { name: 'Electromagnetic Theory', credits: 3 },
      { name: 'Power Systems', credits: 4 },
      { name: 'Control Systems', credits: 3 },
      { name: 'Digital Electronics', credits: 3 }
    ],
    'Civil Engineering': [
      { name: 'Structural Analysis', credits: 4 },
      { name: 'Concrete Technology', credits: 3 },
      { name: 'Transportation Engineering', credits: 3 },
      { name: 'Geotechnical Engineering', credits: 4 },
      { name: 'Environmental Engineering', credits: 3 }
    ]
  };

  ngOnInit(): void {
    this.initializeForm();
    this.updateMetaTags();
    this.injectStructuredData();
    
    // Initialize with first semester
    setTimeout(() => {
      this.addSemester();
      this.isFormReady = true;
      this.cd.detectChanges();
    }, 0);
    
    // Subscribe to form value changes to ensure UI updates
    this.gradeCalculatorForm.valueChanges.subscribe(() => {
      this.cd.detectChanges();
    });
  }

  private updateMetaTags(): void {
    const currentUrl = `${window.location.origin}${this.router.url}`;
    const calculatorType: CalculatorType = 'grade-calculator';
    const metaTags = this.metaTagsService.generateCalculatorMetaTags(calculatorType, currentUrl);
    this.metaTagsService.updateMetaTags(metaTags);
    
    // Add enhanced structured data for grade calculator
    const enhancedStructuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Student Grade Calculator - SGPA & CGPA Calculator",
      "description": "Free online Grade Calculator for students to calculate SGPA and CGPA. Convert marks to grades using SASTRA grading system, calculate semester GPA, and cumulative GPA with detailed analysis.",
      "url": currentUrl,
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "INR",
        "description": "Free Grade Calculator Tool"
      },
      "featureList": [
        "SGPA Calculator",
        "CGPA Calculator", 
        "Grade Converter",
        "Performance Analysis",
        "Grade Distribution Charts",
        "Academic Insights",
        "Mobile Responsive",
        "Export Results"
      ],
      "screenshot": `${window.location.origin}/assets/images/grade-calculator.png`,
      "softwareVersion": "2.0",
      "author": {
        "@type": "Organization",
        "name": "Tech Trends Talks",
        "url": "https://techtrendstalks.com"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Tech Trends Talks",
        "url": "https://techtrendstalks.com"
      },
      "mainEntity": {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How to calculate SGPA?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "SGPA = (Σ Ci × Pi) / (Σ Ci) where Ci is credit assigned to i-th course and Pi is grade point secured in i-th course."
            }
          },
          {
            "@type": "Question",
            "name": "How to calculate CGPA?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "CGPA = (Σ (SGPA)i × Ni) / (Σ Ni) where (SGPA)i is SGPA of i-th semester and Ni is number of credits in i-th semester."
            }
          },
          {
            "@type": "Question",
            "name": "What is the grading system?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "S (91-100%): Outstanding, A+ (86-90%): Excellent, A (75-85%): Very Good, B (66-74%): Good, C (55-65%): Satisfactory, D (50-54%): Pass, F (0-49%): Fail"
            }
          }
        ]
      }
    };
    
    this.structuredDataService.addStructuredData(enhancedStructuredData);
  }

  private injectStructuredData(): void {
    // Add grading system structured data
    const gradingSystemData = {
      "@context": "https://schema.org",
      "@type": "Table",
      "name": "SASTRA Grading System (2015-16 onwards)",
      "description": "Complete grading system for students admitted in academic year 2015-16 and afterwards",
      "about": "University grading system",
      "tableSchema": {
        "@type": "TableSchema",
        "columns": [
          { "@type": "Column", "name": "Marks Secured", "datatype": "number" },
          { "@type": "Column", "name": "Letter Grade", "datatype": "text" },
          { "@type": "Column", "name": "Grade Point", "datatype": "number" },
          { "@type": "Column", "name": "Description", "datatype": "text" }
        ]
      }
    };
    
    this.structuredDataService.addStructuredData(gradingSystemData);
  }

  private initializeForm(): void {
    this.gradeCalculatorForm = this.fb.group({
      studentName: ['', Validators.required],
      studentId: [''],
      academicYear: ['2024-25'],
      semesters: this.fb.array([])
    });
  }

  get semestersArray(): FormArray {
    return this.gradeCalculatorForm.get('semesters') as FormArray;
  }

  addSemester(): void {
    if (!this.gradeCalculatorForm) {
      this.initializeForm();
    }

    const semesterGroup = this.fb.group({
      name: [`Semester ${this.semestersArray.length + 1}`, Validators.required],
      courses: this.fb.array([])
    });

    this.semestersArray.push(semesterGroup);
    this.addCourse(this.semestersArray.length - 1);
    
    // Force update validity and trigger change detection
    this.semestersArray.updateValueAndValidity({ emitEvent: true });
    this.gradeCalculatorForm.updateValueAndValidity({ emitEvent: true });
    
    // Force change detection
    this.cd.detectChanges();
  }

  removeSemester(index: number): void {
    if (this.semestersArray.length > 1) {
      this.semestersArray.removeAt(index);
      this.expandedSemesters.delete(index);
      
      // Force update validity and trigger change detection
      this.semestersArray.updateValueAndValidity({ emitEvent: true });
      this.gradeCalculatorForm.updateValueAndValidity({ emitEvent: true });
      
      // Force change detection
      this.cd.detectChanges();
      
      if (this.semestersArray.length > 0) {
        this.calculateResults();
      }
    }
  }

  addCourse(semesterIndex: number): void {
    if (!this.gradeCalculatorForm || semesterIndex < 0 || semesterIndex >= this.semestersArray.length) {
      return;
    }

    const semesterControl = this.semestersArray.at(semesterIndex);
    if (!semesterControl) {
      return;
    }

    const coursesArray = semesterControl.get('courses') as FormArray;
    if (!coursesArray) {
      return;
    }

    const courseGroup = this.fb.group({
      name: ['', Validators.required],
      credits: [3, [Validators.required, Validators.min(1), Validators.max(10)]],
      marks: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
    });

    coursesArray.push(courseGroup);
    
    // Force update validity and trigger change detection
    coursesArray.updateValueAndValidity({ emitEvent: true });
    semesterControl.updateValueAndValidity({ emitEvent: true });
    
    // Force change detection
    this.cd.detectChanges();
  }

  removeCourse(semesterIndex: number, courseIndex: number): void {
    if (!this.gradeCalculatorForm || semesterIndex < 0 || semesterIndex >= this.semestersArray.length) {
      return;
    }

    const semesterControl = this.semestersArray.at(semesterIndex);
    if (!semesterControl) {
      return;
    }

    const coursesArray = semesterControl.get('courses') as FormArray;
    if (!coursesArray || courseIndex < 0 || courseIndex >= coursesArray.length) {
      return;
    }
    if (coursesArray.length > 1) {
      coursesArray.removeAt(courseIndex);
      
      // Force update validity and trigger change detection
      coursesArray.updateValueAndValidity({ emitEvent: true });
      semesterControl.updateValueAndValidity({ emitEvent: true });
      
      // Force change detection
      this.cd.detectChanges();
      
      this.calculateResults();
    }
  }

  getGradeInfo(marks: number): { grade: string; gradePoint: number; performance: string; color: string } {
    if (marks === -1) {
      return { grade: 'E', gradePoint: 0, performance: 'Exposure', color: '#9E9E9E' };
    }
    const gradeInfo = this.gradingSystem.find(g => marks >= g.min && marks <= g.max);
    return gradeInfo || { grade: 'F', gradePoint: 0, performance: 'Fail', color: '#F44336' };
  }

  calculateResults(): void {
    this.loader.show();
    
    if (!this.gradeCalculatorForm || !this.gradeCalculatorForm.valid) {
      this.loader.hide();
      return;
    }

    this.semesters = [];
    let totalCredits = 0;
    let weightedSGPA = 0;
    let allGrades: { [key: string]: number } = {};

    for (let semesterIndex = 0; semesterIndex < this.semestersArray.length; semesterIndex++) {
      const semesterControl = this.semestersArray.at(semesterIndex);
      if (!semesterControl) continue;

      const semester = semesterControl.value;
      const courses: Course[] = [];
      let semesterCredits = 0;
      let semesterGradePoints = 0;
      let semesterTotalMarks = 0;
      let semesterGradeDistribution: { [key: string]: number } = {};

      const coursesArray = semesterControl.get('courses') as FormArray;
      if (!coursesArray) continue;

      for (let courseIndex = 0; courseIndex < coursesArray.length; courseIndex++) {
        const courseControl = coursesArray.at(courseIndex);
        if (!courseControl) continue;

        const course = courseControl.value;
        const gradeInfo = this.getGradeInfo(course.marks);
        
        courses.push({
          name: course.name || 'Unnamed Course',
          credits: course.credits || 0,
          marks: course.marks || 0,
          grade: gradeInfo.grade,
          gradePoint: gradeInfo.gradePoint,
          performance: gradeInfo.performance,
          color: gradeInfo.color
        });

        semesterCredits += (course.credits || 0);
        semesterGradePoints += ((course.credits || 0) * gradeInfo.gradePoint);
        semesterTotalMarks += (course.marks || 0);
        
        // Update grade distribution
        semesterGradeDistribution[gradeInfo.grade] = (semesterGradeDistribution[gradeInfo.grade] || 0) + 1;
        allGrades[gradeInfo.grade] = (allGrades[gradeInfo.grade] || 0) + 1;
      }

      const sgpa = semesterCredits > 0 ? semesterGradePoints / semesterCredits : 0;
      const averageMarks = courses.length > 0 ? semesterTotalMarks / courses.length : 0;
      
      this.semesters.push({
        name: semester.name || `Semester ${semesterIndex + 1}`,
        courses: courses,
        sgpa: sgpa,
        credits: semesterCredits,
        totalMarks: semesterTotalMarks,
        averageMarks: averageMarks,
        gradeDistribution: semesterGradeDistribution
      });

      totalCredits += semesterCredits;
      weightedSGPA += (sgpa * semesterCredits);
    }

    this.cgpa = totalCredits > 0 ? weightedSGPA / totalCredits : 0;
    this.percentage = this.cgpa * 10;
    this.showResults = true;

    // Generate advanced analysis
    this.generateGradeAnalysis(allGrades);
    
    // Update chart data
    this.updateChartData(allGrades);

    // Scroll to results
    setTimeout(() => {
      if (this.resultSection?.nativeElement) {
        this.resultSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }
      this.loader.hide();
      this.cd.detectChanges();
    }, 300);

    // Trigger pulse animation
    this.animationState = 'pulse';
    setTimeout(() => {
      this.animationState = 'normal';
      this.cd.detectChanges();
    }, 200);
  }

  private generateGradeAnalysis(allGrades: { [key: string]: number }): void {
    const totalCourses = this.semesters.reduce((sum, semester) => sum + semester.courses.length, 0);
    const totalCredits = this.semesters.reduce((sum, semester) => sum + semester.credits, 0);
    const averageSGPA = this.semesters.reduce((sum, semester) => sum + semester.sgpa, 0) / this.semesters.length;

    // Find best and worst semesters
    const bestSemester = this.semesters.reduce((best, current) => 
      current.sgpa > best.sgpa ? current : best, this.semesters[0]);
    const worstSemester = this.semesters.reduce((worst, current) => 
      current.sgpa < worst.sgpa ? current : worst, this.semesters[0]);

    // Determine performance trend
    let performanceTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (this.semesters.length >= 2) {
      const firstHalf = this.semesters.slice(0, Math.ceil(this.semesters.length / 2));
      const secondHalf = this.semesters.slice(Math.ceil(this.semesters.length / 2));
      const firstAvg = firstHalf.reduce((sum, s) => sum + s.sgpa, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, s) => sum + s.sgpa, 0) / secondHalf.length;
      
      if (secondAvg > firstAvg + 0.5) performanceTrend = 'improving';
      else if (secondAvg < firstAvg - 0.5) performanceTrend = 'declining';
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (this.cgpa < 7.0) {
      recommendations.push('Focus on improving performance in core subjects');
      recommendations.push('Consider additional study time for difficult courses');
    }
    if (allGrades['F'] > 0) {
      recommendations.push('Address failed courses immediately');
      recommendations.push('Seek academic counseling for improvement strategies');
    }
    if (performanceTrend === 'declining') {
      recommendations.push('Review study habits and time management');
      recommendations.push('Consider reducing course load if necessary');
    }
    if (this.cgpa >= 8.5) {
      recommendations.push('Excellent performance! Maintain consistency');
      recommendations.push('Consider advanced courses or research opportunities');
    }

    this.gradeAnalysis = {
      totalCourses,
      totalCredits,
      averageSGPA,
      bestSemester: bestSemester.name,
      worstSemester: worstSemester.name,
      gradeDistribution: allGrades,
      performanceTrend,
      recommendations
    };

    // Generate performance insights
    this.generatePerformanceInsights();
  }

  private generatePerformanceInsights(): void {
    this.performanceInsights = [];
    
    if (!this.gradeAnalysis) return;

    // Grade-based insights
    if (this.gradeAnalysis.gradeDistribution['S'] > 0) {
      this.performanceInsights.push(`Outstanding performance in ${this.gradeAnalysis.gradeDistribution['S']} course(s)`);
    }
    if (this.gradeAnalysis.gradeDistribution['F'] > 0) {
      this.performanceInsights.push(`Need attention: ${this.gradeAnalysis.gradeDistribution['F']} failed course(s)`);
    }

    // CGPA-based insights
    if (this.cgpa >= 9.0) {
      this.performanceInsights.push('Exceptional academic performance!');
    } else if (this.cgpa >= 8.0) {
      this.performanceInsights.push('Very good academic standing');
    } else if (this.cgpa >= 7.0) {
      this.performanceInsights.push('Good academic performance');
    } else if (this.cgpa >= 6.0) {
      this.performanceInsights.push('Satisfactory performance - room for improvement');
    } else {
      this.performanceInsights.push('Needs significant improvement');
    }

    // Trend insights
    if (this.gradeAnalysis.performanceTrend === 'improving') {
      this.performanceInsights.push('Positive academic trend - keep up the good work!');
    } else if (this.gradeAnalysis.performanceTrend === 'declining') {
      this.performanceInsights.push('Declining performance trend - review study strategies');
    }
  }

  private updateChartData(allGrades: { [key: string]: number }): void {
    const gradeOrder = ['S', 'A+', 'A', 'B', 'C', 'D', 'F'];
    const data = gradeOrder.map(grade => allGrades[grade] || 0);
    
    this.chartData.datasets[0].data = data;
    this.chart?.update();
  }

  toggleSemesterExpansion(index: number): void {
    if (this.expandedSemesters.has(index)) {
      this.expandedSemesters.delete(index);
    } else {
      this.expandedSemesters.add(index);
    }
    this.cd.detectChanges();
  }

  isSemesterExpanded(index: number): boolean {
    return this.expandedSemesters.has(index);
  }

  toggleFaq(index: number): void {
    if (this.activeFaqIndex === index) {
      this.activeFaqIndex = null;
    } else {
      this.activeFaqIndex = index;
    }
    this.cd.detectChanges();
  }

  loadCourseTemplate(template: string): void {
    if (!this.courseTemplates[template as keyof typeof this.courseTemplates]) {
      return;
    }

    this.resetCalculator();
    const templateCourses = this.courseTemplates[template as keyof typeof this.courseTemplates];
    
    // Use setTimeout to ensure form is properly initialized
    setTimeout(() => {
      templateCourses.forEach((course, index) => {
        if (index > 0) {
          this.addCourse(0);
        }
        
        const semesterControl = this.semestersArray.at(0);
        if (!semesterControl) return;

        const coursesArray = semesterControl.get('courses') as FormArray;
        if (!coursesArray || index >= coursesArray.length) return;

        const courseControl = coursesArray.at(index);
        if (!courseControl) return;

        courseControl.patchValue({
          name: course.name,
          credits: course.credits,
          marks: 0
        });
        
        // Force update validity and trigger change detection
        courseControl.updateValueAndValidity({ emitEvent: true });
      });
      
      // Update the entire form
      this.gradeCalculatorForm.updateValueAndValidity({ emitEvent: true });
      
      // Force change detection
      this.cd.detectChanges();
    }, 50);
  }

  loadDemoData(): void {
    this.resetCalculator();
    
    const demoData = [
      {
        name: 'Semester 1',
        courses: [
          { name: 'Mathematics', credits: 4, marks: 85 },
          { name: 'Physics', credits: 3, marks: 78 },
          { name: 'Chemistry', credits: 3, marks: 82 },
          { name: 'Programming', credits: 4, marks: 90 }
        ]
      },
      {
        name: 'Semester 2',
        courses: [
          { name: 'Advanced Mathematics', credits: 4, marks: 88 },
          { name: 'Engineering Drawing', credits: 2, marks: 75 },
          { name: 'Data Structures', credits: 4, marks: 92 },
          { name: 'Digital Logic', credits: 3, marks: 85 }
        ]
      },
      {
        name: 'Semester 3',
        courses: [
          { name: 'Database Management', credits: 3, marks: 87 },
          { name: 'Computer Networks', credits: 3, marks: 83 },
          { name: 'Software Engineering', credits: 3, marks: 89 },
          { name: 'Operating Systems', credits: 4, marks: 86 }
        ]
      }
    ];

    // Use setTimeout to ensure form is properly initialized
    setTimeout(() => {
      demoData.forEach((demoSemester, semesterIndex) => {
        if (semesterIndex > 0) {
          this.addSemester();
        }
        
        const semesterControl = this.semestersArray.at(semesterIndex);
        if (!semesterControl) return;

        semesterControl.patchValue({
          name: demoSemester.name
        });      
        
        const coursesArray = semesterControl.get('courses') as FormArray;
        if (!coursesArray) return;

        coursesArray.clear();
        
        demoSemester.courses.forEach(course => {
          const courseGroup = this.fb.group({
            name: [course.name, Validators.required],
            credits: [course.credits, [Validators.required, Validators.min(1), Validators.max(10)]],
            marks: [course.marks, [Validators.required, Validators.min(0), Validators.max(100)]]
          });
          coursesArray.push(courseGroup);
        });
        
        // Force update validity and trigger change detection
        coursesArray.updateValueAndValidity({ emitEvent: true });
        semesterControl.updateValueAndValidity({ emitEvent: true });
        
        // Force change detection for this specific semester
        this.cd.detectChanges();
      });
      
      // Update the entire form
      this.gradeCalculatorForm.updateValueAndValidity({ emitEvent: true });
      
      // Force change detection
      this.cd.detectChanges();
      
      setTimeout(() => {
        this.calculateResults();
      }, 50);
    }, 50);
  }

  resetCalculator(): void {
    this.gradeCalculatorForm.reset();
    this.semesters = [];
    this.cgpa = 0;
    this.percentage = 0;
    this.showResults = false;
    this.gradeAnalysis = null;
    this.performanceInsights = [];
    this.expandedSemesters.clear();
    this.activeFaqIndex = null;
    this.semestersArray.clear();
    
    // Force update validity and trigger change detection
    this.gradeCalculatorForm.updateValueAndValidity({ emitEvent: true });
    
    // Force change detection
    this.cd.detectChanges();
    
    this.addSemester();
  }

  getGradeColor(grade: string): string {
    const gradeInfo = this.gradingSystem.find(g => g.grade === grade);
    return gradeInfo?.color || '#9E9E9E';
  }

  getPerformanceColor(performance: string): string {
    const performanceColors: { [key: string]: string } = {
      'Outstanding': '#4CAF50',
      'Excellent': '#8BC34A',
      'Very Good': '#CDDC39',
      'Good': '#FFEB3B',
      'Satisfactory': '#FF9800',
      'Pass': '#FF5722',
      'Fail': '#F44336',
      'Exposure': '#9E9E9E'
    };
    return performanceColors[performance] || '#9E9E9E';
  }

  getCoursesArray(semester: any): any[] {
    if (semester && semester.get) {
      const coursesArray = semester.get('courses') as FormArray;
      return coursesArray ? coursesArray.controls : [];
    }
    return [];
  }

  trackByIndex(index: number): number {
    return index;
  }

  // Method to handle course value changes and ensure UI updates
  onCourseValueChange(semesterIndex: number, courseIndex: number): void {
    const semesterControl = this.semestersArray.at(semesterIndex);
    if (!semesterControl) return;

    const coursesArray = semesterControl.get('courses') as FormArray;
    if (!coursesArray) return;

    const courseControl = coursesArray.at(courseIndex);
    if (!courseControl) return;

    // Force update validity and trigger change detection
    courseControl.updateValueAndValidity({ emitEvent: true });
    coursesArray.updateValueAndValidity({ emitEvent: true });
    semesterControl.updateValueAndValidity({ emitEvent: true });
    
    // Force change detection
    this.cd.detectChanges();
  }

  // Method to handle semester value changes and ensure UI updates
  onSemesterValueChange(semesterIndex: number): void {
    const semesterControl = this.semestersArray.at(semesterIndex);
    if (!semesterControl) return;

    // Force update validity and trigger change detection
    semesterControl.updateValueAndValidity({ emitEvent: true });
    this.semestersArray.updateValueAndValidity({ emitEvent: true });
    
    // Force change detection
    this.cd.detectChanges();
  }

  // Method to handle student info changes and ensure UI updates
  onStudentInfoChange(): void {
    // Force update validity and trigger change detection
    this.gradeCalculatorForm.updateValueAndValidity({ emitEvent: true });
    
    // Force change detection
    this.cd.detectChanges();
  }

  // Enhanced export functionality
  exportToExcel(): void {
    const wb = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
      ['STUDENT GRADE CALCULATOR REPORT'],
      ['Generated on: ' + new Date().toLocaleDateString()],
      [''],
      ['STUDENT INFORMATION'],
      ['Name', this.gradeCalculatorForm.get('studentName')?.value || 'N/A'],
      ['Student ID', this.gradeCalculatorForm.get('studentId')?.value || 'N/A'],
      ['Academic Year', this.gradeCalculatorForm.get('academicYear')?.value || 'N/A'],
      [''],
      ['OVERALL RESULTS'],
      ['CGPA', this.cgpa.toFixed(2)],
      ['Percentage', this.percentage.toFixed(1) + '%'],
      ['Total Credits', (this.gradeAnalysis?.totalCredits || 0).toString()],
      ['Total Courses', (this.gradeAnalysis?.totalCourses || 0).toString()],
      [''],
      ['PERFORMANCE ANALYSIS'],
      ['Best Semester', this.gradeAnalysis?.bestSemester || 'N/A'],
      ['Worst Semester', this.gradeAnalysis?.worstSemester || 'N/A'],
      ['Performance Trend', this.gradeAnalysis?.performanceTrend || 'N/A'],
      [''],
      ['GRADE DISTRIBUTION']
    ];

    // Add grade distribution
    Object.entries(this.gradeAnalysis?.gradeDistribution || {}).forEach(([grade, count]) => {
      summaryData.push([grade, count]);
    });

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

    // Detailed Results Sheet
    const detailedData = [
      ['SEMESTER DETAILS'],
      ['Semester', 'Course', 'Credits', 'Marks', 'Grade', 'Grade Point', 'Performance']
    ];

    this.semesters.forEach(semester => {
      detailedData.push([semester.name, '', '', '', '', '', '']);
      semester.courses.forEach(course => {
        detailedData.push([
          '',
          course.name,
          course.credits.toString(),
          course.marks.toString(),
          course.grade,
          course.gradePoint.toString(),
          course.performance
        ]);
      });
      detailedData.push(['SGPA: ' + semester.sgpa.toFixed(2), '', '', '', '', '', '']);
      detailedData.push(['', '', '', '', '', '', '']);
    });

    const detailedWs = XLSX.utils.aoa_to_sheet(detailedData);
    XLSX.utils.book_append_sheet(wb, detailedWs, 'Detailed Results');

    // Save file
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    XLSX.writeFile(wb, `Grade_Calculator_Report_${timestamp}.xlsx`);
  }

  exportToPDF(): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Header
    doc.setFillColor(44, 62, 80);
    doc.rect(0, 0, pageWidth, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('STUDENT GRADE CALCULATOR', pageWidth / 2, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('Comprehensive Academic Performance Report', pageWidth / 2, 25, { align: 'center' });

    // Student Information
    doc.setFillColor(236, 240, 241);
    doc.roundedRect(12, 40, pageWidth - 24, 30, 2, 2, 'F');
    
    doc.setTextColor(44, 62, 80);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Student Information', 14, 52);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Name:', 16, 62);
    doc.text('Student ID:', 16, 68);
    doc.text('Academic Year:', 16, 74);
    
    doc.setFont('helvetica', 'bold');
    doc.text(this.gradeCalculatorForm.get('studentName')?.value || 'N/A', 60, 62);
    doc.text(this.gradeCalculatorForm.get('studentId')?.value || 'N/A', 60, 68);
    doc.text(this.gradeCalculatorForm.get('academicYear')?.value || 'N/A', 60, 74);

    // Overall Results
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(44, 62, 80);
    doc.text('Overall Results', 14, 90);
  
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(12, 94, pageWidth - 24, 25, 2, 2, 'F');
  
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('CGPA:', 16, 102);
    doc.setFont('helvetica', 'bold');
    doc.text(this.cgpa.toFixed(2), 60, 102);
  
    doc.setFont('helvetica', 'normal');
    doc.text('Percentage:', 16, 108);
    doc.setFont('helvetica', 'bold');
    doc.text(this.percentage.toFixed(1) + '%', 60, 108);
  
    doc.setFont('helvetica', 'normal');
    doc.text('Total Credits:', 16, 114);
    doc.setFont('helvetica', 'bold');
    doc.text((this.gradeAnalysis?.totalCredits || 0).toString(), 60, 114);

    // Semester Results Table
    const semesterData = this.semesters.map(semester => [
      semester.name,
      semester.sgpa.toFixed(2),
      semester.credits.toString(),
      semester.averageMarks.toFixed(1) + '%'
    ]);

    autoTable(doc, {
      head: [['Semester', 'SGPA', 'Credits', 'Avg Marks']],
      body: semesterData,
      startY: 130,
      theme: 'grid',
      styles: {
        fontSize: 9,
        font: 'helvetica',
        cellPadding: { top: 3, right: 2, bottom: 3, left: 2 },
        valign: 'middle',
        halign: 'center',
      },
      headStyles: {
        fillColor: [44, 62, 80],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 40, halign: 'left' },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 30, halign: 'center' },
      },
      didDrawPage: () => {
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`© ${new Date().getFullYear()} Tech Trends Talks. All rights reserved.`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }
    });

    // Save PDF
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    doc.save(`Grade_Calculator_Report_${timestamp}.pdf`);
  }

  shareResults(): void {
    if (navigator.share) {
      navigator.share({
        title: 'My Grade Results',
        text: `My CGPA: ${this.cgpa.toFixed(2)} (${this.percentage.toFixed(1)}%)`,
        url: window.location.href
      });
    } else {
      const text = `My CGPA: ${this.cgpa.toFixed(2)} (${this.percentage.toFixed(1)}%)`;
      navigator.clipboard.writeText(text).then(() => {
        alert('Results copied to clipboard!');
      });
    }
  }

  // SEO Content Methods
  scrollToCalculator(): void {
    const calculatorElement = document.querySelector('.calculator-main');
    if (calculatorElement) {
      calculatorElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  downloadGuide(): void {
    const guideContent = `
Student Grade Calculator Guide - Tech Trends Talks

What is SGPA and CGPA?
- SGPA (Semester Grade Point Average): Average grade points for a semester
- CGPA (Cumulative Grade Point Average): Overall average across all semesters

Grading System (SASTRA 2015-16 onwards):
- S (91-100%): Outstanding (10 points)
- A+ (86-90%): Excellent (9 points)
- A (75-85%): Very Good (8 points)
- B (66-74%): Good (7 points)
- C (55-65%): Satisfactory (6 points)
- D (50-54%): Pass (5 points)
- F (0-49%): Fail (0 points)

Formulas:
- SGPA = (Σ Ci × Pi) / (Σ Ci)
- CGPA = (Σ (SGPA)i × Ni) / (Σ Ni)

Visit: https://techtrendstalks.com/calculator/grade-calculator
    `;

    const blob = new Blob([guideContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Grade-Calculator-Guide.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  @HostListener('window:resize')
  onResize(): void {
    // Handle responsive chart updates
    this.chart?.update();
  }
}
