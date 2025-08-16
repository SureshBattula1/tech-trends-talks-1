import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';
import { Meta, Title } from '@angular/platform-browser';

interface Course {
  name: string;
  credits: number;
  marks: number;
  grade: string;
  gradePoint: number;
  performance: string;
}

interface Semester {
  name: string;
  courses: Course[];
  sgpa: number;
  credits: number;
}

@Component({
  selector: 'app-grade-calculator',
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
    ])
  ]
})
export class GradeCalculatorComponent implements OnInit, AfterViewInit {
  @ViewChild('resultSection') resultSection!: ElementRef;

  gradeCalculatorForm!: FormGroup;
  semesters: Semester[] = [];
  cgpa: number = 0;
  percentage: number = 0;
  showResults: boolean = false;
  animationState: string = 'normal';
  isFormReady: boolean = false;

  // Grading system based on the image - For students admitted in academic year 2015-16 and afterwards
  readonly gradingSystem = [
    { min: 91, max: 100, grade: 'S', gradePoint: 10, performance: 'Outstanding' },
    { min: 86, max: 90, grade: 'A+', gradePoint: 9, performance: 'Excellent' },
    { min: 75, max: 85, grade: 'A', gradePoint: 8, performance: 'Very Good' },
    { min: 66, max: 74, grade: 'B', gradePoint: 7, performance: 'Good' },
    { min: 55, max: 65, grade: 'C', gradePoint: 6, performance: 'Satisfactory' },
    { min: 50, max: 54, grade: 'D', gradePoint: 5, performance: 'Pass' },
    { min: 0, max: 49, grade: 'F', gradePoint: 0, performance: 'Fail' },
    { min: -1, max: -1, grade: 'E', gradePoint: 0, performance: 'Exposure' } // Absent
  ];

  constructor(
    private fb: FormBuilder,
    private meta: Meta,
    private title: Title
  ) {
    this.setupSEO();
  }

  ngOnInit(): void {
    this.initializeForm();
    // Wait for next tick to ensure form is ready
    setTimeout(() => {
      this.addSemester();
      this.isFormReady = true;
    }, 0);
  }

  ngAfterViewInit(): void {
    this.animateOnScroll();
  }

  private setupSEO(): void {
    this.title.setTitle('Grade Calculator - Calculate SGPA & CGPA Online | Tech Trends Talks');
    
    this.meta.addTags([
      { name: 'description', content: 'Free online Grade Calculator to calculate SGPA and CGPA. Convert marks to grades, calculate semester GPA, and cumulative GPA with our professional grade calculator tool.' },
      { name: 'keywords', content: 'grade calculator, SGPA calculator, CGPA calculator, GPA calculator, marks to grade converter, semester grade point average, cumulative grade point average' },
      { name: 'robots', content: 'index, follow' },
      { property: 'og:title', content: 'Grade Calculator - Calculate SGPA & CGPA Online' },
      { property: 'og:description', content: 'Free online Grade Calculator to calculate SGPA and CGPA. Professional tool for students to calculate grades and GPA.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Grade Calculator - Calculate SGPA & CGPA Online' },
      { name: 'twitter:description', content: 'Free online Grade Calculator to calculate SGPA and CGPA. Professional tool for students.' }
    ]);

    this.addStructuredData();
  }

  private addStructuredData(): void {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Grade Calculator - SGPA & CGPA Calculator",
      "description": "Free online Grade Calculator to calculate SGPA and CGPA. Convert marks to grades, calculate semester GPA, and cumulative GPA with our professional grade calculator tool.",
      "url": window.location.href,
      "applicationCategory": "EducationalApplication",
      "featureList": [
        "SGPA Calculator",
        "CGPA Calculator", 
        "Grade Converter",
        "Performance Analysis",
        "Mobile Responsive",
        "Print Results"
      ]
    });
    document.head.appendChild(script);
  }

  private initializeForm(): void {
    this.gradeCalculatorForm = this.fb.group({
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
      name: ['', Validators.required],
      courses: this.fb.array([])
    });

    this.semestersArray.push(semesterGroup);
    this.addCourse(this.semestersArray.length - 1);
  }

  removeSemester(index: number): void {
    if (this.semestersArray.length > 1) {
      this.semestersArray.removeAt(index);
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
      credits: [0, [Validators.required, Validators.min(1), Validators.max(10)]],
      marks: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
    });

    coursesArray.push(courseGroup);
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
      this.calculateResults();
    }
  }

  getGradeInfo(marks: number): { grade: string; gradePoint: number; performance: string } {
    if (marks === -1) {
      return { grade: 'E', gradePoint: 0, performance: 'Exposure' };
    }
    const gradeInfo = this.gradingSystem.find(g => marks >= g.min && marks <= g.max);
    return gradeInfo || { grade: 'F', gradePoint: 0, performance: 'Fail' };
  }

  calculateResults(): void {
    if (!this.gradeCalculatorForm || !this.gradeCalculatorForm.valid) {
      return;
    }

    this.semesters = [];
    let totalCredits = 0;
    let weightedSGPA = 0;

    for (let semesterIndex = 0; semesterIndex < this.semestersArray.length; semesterIndex++) {
      const semesterControl = this.semestersArray.at(semesterIndex);
      if (!semesterControl) continue;

      const semester = semesterControl.value;
      const courses: Course[] = [];
      let semesterCredits = 0;
      let semesterGradePoints = 0;

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
          performance: gradeInfo.performance
        });

        semesterCredits += (course.credits || 0);
        semesterGradePoints += ((course.credits || 0) * gradeInfo.gradePoint);
      }

      const sgpa = semesterCredits > 0 ? semesterGradePoints / semesterCredits : 0;
      
      this.semesters.push({
        name: semester.name || `Semester ${semesterIndex + 1}`,
        courses: courses,
        sgpa: sgpa,
        credits: semesterCredits
      });

      totalCredits += semesterCredits;
      weightedSGPA += (sgpa * semesterCredits);
    }

    this.cgpa = totalCredits > 0 ? weightedSGPA / totalCredits : 0;
    this.percentage = this.cgpa * 10;
    this.showResults = true;

    // Scroll to results
    setTimeout(() => {
      if (this.resultSection?.nativeElement) {
        this.resultSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 300);

    // Trigger pulse animation
    this.animationState = 'pulse';
    setTimeout(() => {
      this.animationState = 'normal';
    }, 200);
  }

  private animateOnScroll(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observer.observe(el));
  }

  resetCalculator(): void {
    this.gradeCalculatorForm.reset();
    this.semesters = [];
    this.cgpa = 0;
    this.percentage = 0;
    this.showResults = false;
    this.semestersArray.clear();
    this.addSemester();
  }

  loadDemoData(): void {
    this.resetCalculator();
    
    // Add demo data
    const demoData = [
      {
        name: 'Semester 1',
        courses: [
          { name: 'Mathematics', credits: 4, marks: 85 },
          { name: 'Physics', credits: 3, marks: 78 },
          { name: 'Chemistry', credits: 3, marks: 82 }
        ]
      },
      {
        name: 'Semester 2',
        courses: [
          { name: 'Advanced Mathematics', credits: 4, marks: 88 },
          { name: 'Engineering Drawing', credits: 2, marks: 75 },
          { name: 'Programming', credits: 3, marks: 90 }
        ]
      }
    ];

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
    });
    
    setTimeout(() => {
      this.calculateResults();
    }, 100);
  }

  getGradeColor(grade: string): string {
    const colors: { [key: string]: string } = {
      'S': '#4CAF50',
      'A+': '#8BC34A',
      'A': '#CDDC39',
      'B': '#FFEB3B',
      'C': '#FF9800',
      'D': '#FF5722',
      'F': '#F44336',
      'E': '#9E9E9E'
    };
    return colors[grade] || '#9E9E9E';
  }

  getPerformanceColor(performance: string): string {
    const colors: { [key: string]: string } = {
      'Outstanding': '#4CAF50',
      'Excellent': '#8BC34A',
      'Very Good': '#CDDC39',
      'Good': '#FFEB3B',
      'Satisfactory': '#FF9800',
      'Pass': '#FF5722',
      'Fail': '#F44336',
      'Exposure': '#9E9E9E'
    };
    return colors[performance] || '#9E9E9E';
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

  downloadResults(): void {
    let content = 'GRADE CALCULATOR RESULTS\n';
    content += '========================\n\n';
    content += `Overall CGPA: ${this.cgpa.toFixed(2)}\n`;
    content += `Percentage: ${this.percentage.toFixed(1)}%\n\n`;
    
    this.semesters.forEach(semester => {
      content += `${semester.name}\n`;
      content += `SGPA: ${semester.sgpa.toFixed(2)} | Credits: ${semester.credits}\n`;
      content += 'Courses:\n';
      
      semester.courses.forEach(course => {
        content += `  ${course.name}: ${course.marks}% → ${course.grade} (${course.gradePoint}) - ${course.performance}\n`;
      });
      content += '\n';
    });
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grade-results.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
