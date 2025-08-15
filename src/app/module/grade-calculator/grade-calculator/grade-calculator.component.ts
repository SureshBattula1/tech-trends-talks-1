import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface GradeInfo {
  grade: string;
  percentage: number;
  gpa: number;
  description: string;
  color: string;
}

interface Course {
  id: string;
  name: string;
  credits: number;
  grade: string;
  percentage: number;
  gpa: number;
  semester: string;
  year: string;
}

interface Semester {
  id: string;
  name: string;
  year: string;
  courses: Course[];
  totalCredits: number;
  semesterGPA: number;
  semesterPercentage: number;
}

interface AcademicRecord {
  totalCredits: number;
  cumulativeGPA: number;
  overallPercentage: number;
  totalCourses: number;
  gradeDistribution: { [key: string]: number };
  academicStanding: string;
  deanListEligible: boolean;
  academicWarning: boolean;
}

@Component({
  selector: 'app-grade-calculator',
  templateUrl: './grade-calculator.component.html',
  styleUrls: ['./grade-calculator.component.scss']
})
export class GradeCalculatorComponent implements OnInit {
  gradeForm: FormGroup;
  courseForm: FormGroup;
  finalGradeForm: FormGroup;
  uniGradeForm: FormGroup;
  selectedSystem: string = 'percentage';
  calculatedGrade: GradeInfo | null = null;
  finalGradeResult: any = null;
  uniGradeResult: any = null;
  showSummary: boolean = false;
  showCourseManager: boolean = false;
  showAcademicRecord: boolean = false;
  showFinalGradeCalculator: boolean = false;
  showUniGradeCalculator: boolean = false;
  
  // Student data
  studentName: string = '';
  studentId: string = '';
  currentSemester: string = '';
  currentYear: string = '';
  
  // Academic data
  semesters: Semester[] = [];
  academicRecord: AcademicRecord = {
    totalCredits: 0,
    cumulativeGPA: 0,
    overallPercentage: 0,
    totalCourses: 0,
    gradeDistribution: {},
    academicStanding: 'Good Standing',
    deanListEligible: false,
    academicWarning: false
  };

  gradingSystems = [
    { value: 'percentage', label: 'Percentage to Grade', icon: '📊' },
    { value: 'gpa', label: 'GPA to Grade', icon: '🎯' },
    { value: 'letter', label: 'Letter Grade to GPA', icon: '📝' },
    { value: 'course', label: 'Course Management', icon: '📚' },
    { value: 'semester', label: 'Semester Overview', icon: '📅' },
    { value: 'academic', label: 'Academic Record', icon: '🏆' },
    { value: 'final-grade', label: 'Final Grade Calculator', icon: '🎯' },
    { value: 'uni-grade', label: 'University Grade Calculator', icon: '🎓' }
  ];

  letterGrades = [
    { grade: 'A+', percentage: 97, gpa: 4.0, description: 'Excellent', color: '#28a745' },
    { grade: 'A', percentage: 93, gpa: 4.0, description: 'Excellent', color: '#28a745' },
    { grade: 'A-', percentage: 90, gpa: 3.7, description: 'Excellent', color: '#28a745' },
    { grade: 'B+', percentage: 87, gpa: 3.3, description: 'Good', color: '#17a2b8' },
    { grade: 'B', percentage: 83, gpa: 3.0, description: 'Good', color: '#17a2b8' },
    { grade: 'B-', percentage: 80, gpa: 2.7, description: 'Good', color: '#17a2b8' },
    { grade: 'C+', percentage: 77, gpa: 2.3, description: 'Average', color: '#ffc107' },
    { grade: 'C', percentage: 73, gpa: 2.0, description: 'Average', color: '#ffc107' },
    { grade: 'C-', percentage: 70, gpa: 1.7, description: 'Average', color: '#ffc107' },
    { grade: 'D+', percentage: 67, gpa: 1.3, description: 'Below Average', color: '#fd7e14' },
    { grade: 'D', percentage: 63, gpa: 1.0, description: 'Below Average', color: '#fd7e14' },
    { grade: 'D-', percentage: 60, gpa: 0.7, description: 'Below Average', color: '#fd7e14' },
    { grade: 'F', percentage: 0, gpa: 0.0, description: 'Failing', color: '#dc3545' }
  ];

  semesterOptions = [
    'Fall', 'Spring', 'Summer I', 'Summer II', 'Winter'
  ];

  yearOptions = ['2024', '2025', '2026', '2027', '2028'];

  // University Grade Calculator data
  uniAssignments: Array<{id: string, name: string, mark: number, weight: number, credits?: number}> = [];
  uniGradeFormData = { name: '', mark: '', weight: '', credits: '' };

  constructor(private fb: FormBuilder) {
    this.gradeForm = this.fb.group({
      percentage: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      gpa: ['', [Validators.required, Validators.min(0), Validators.max(4)]],
      letterGrade: ['', Validators.required]
    });

    this.courseForm = this.fb.group({
      courseName: ['', [Validators.required, Validators.minLength(2)]],
      credits: ['', [Validators.required, Validators.min(0.5), Validators.max(6)]],
      grade: ['', Validators.required],
      semester: ['', Validators.required],
      year: ['', Validators.required]
    });

    this.finalGradeForm = this.fb.group({
      currentGrade: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      targetGrade: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      finalExamWeight: ['', [Validators.required, Validators.min(1), Validators.max(100)]]
    });

    this.uniGradeForm = this.fb.group({
      targetMark: ['', [Validators.min(0), Validators.max(100)]]
    });

    this.initializeStudentData();
  }

  ngOnInit(): void {
    this.onSystemChange();
    this.loadSampleData();
  }

  initializeStudentData(): void {
    this.studentName = 'John Doe';
    this.studentId = 'STU2024001';
    this.currentSemester = 'Spring';
    this.currentYear = '2025';
  }

  loadSampleData(): void {
    // Sample semester data
    this.semesters = [
      {
        id: '1',
        name: 'Fall 2024',
        year: '2024',
        courses: [
          { id: '1', name: 'Mathematics 101', credits: 3, grade: 'A', percentage: 95, gpa: 4.0, semester: 'Fall', year: '2024' },
          { id: '2', name: 'English 101', credits: 3, grade: 'B+', percentage: 87, gpa: 3.3, semester: 'Fall', year: '2024' },
          { id: '3', name: 'Physics 101', credits: 4, grade: 'A-', percentage: 92, gpa: 3.7, semester: 'Fall', year: '2024' }
        ],
        totalCredits: 10,
        semesterGPA: 3.67,
        semesterPercentage: 91.3
      },
      {
        id: '2',
        name: 'Spring 2025',
        year: '2025',
        courses: [
          { id: '4', name: 'Chemistry 101', credits: 4, grade: 'B', percentage: 85, gpa: 3.0, semester: 'Spring', year: '2025' },
          { id: '5', name: 'History 101', credits: 3, grade: 'A', percentage: 94, gpa: 4.0, semester: 'Spring', year: '2025' }
        ],
        totalCredits: 7,
        semesterGPA: 3.57,
        semesterPercentage: 89.5
      }
    ];

    this.calculateAcademicRecord();
  }

  onSystemChange(): void {
    this.calculatedGrade = null;
    this.finalGradeResult = null;
    this.uniGradeResult = null;
    this.showSummary = false;
    this.showCourseManager = false;
    this.showAcademicRecord = false;
    this.showFinalGradeCalculator = false;
    this.showUniGradeCalculator = false;
    
    // Reset form controls based on selected system
    if (this.selectedSystem === 'percentage') {
      this.gradeForm.get('percentage')?.enable();
      this.gradeForm.get('gpa')?.disable();
      this.gradeForm.get('letterGrade')?.disable();
    } else if (this.selectedSystem === 'gpa') {
      this.gradeForm.get('percentage')?.disable();
      this.gradeForm.get('gpa')?.enable();
      this.gradeForm.get('letterGrade')?.disable();
    } else if (this.selectedSystem === 'letter') {
      this.gradeForm.get('percentage')?.disable();
      this.gradeForm.get('gpa')?.disable();
      this.gradeForm.get('letterGrade')?.enable();
    } else if (this.selectedSystem === 'course') {
      this.showCourseManager = true;
    } else if (this.selectedSystem === 'semester' || this.selectedSystem === 'academic') {
      this.showAcademicRecord = true;
    } else if (this.selectedSystem === 'final-grade') {
      this.showFinalGradeCalculator = true;
    } else if (this.selectedSystem === 'uni-grade') {
      this.showUniGradeCalculator = true;
    }
  }

  calculateGrade(): void {
    if (this.gradeForm.valid) {
      if (this.selectedSystem === 'percentage') {
        const percentage = this.gradeForm.get('percentage')?.value;
        this.calculatedGrade = this.percentageToGrade(percentage);
      } else if (this.selectedSystem === 'gpa') {
        const gpa = this.gradeForm.get('gpa')?.value;
        this.calculatedGrade = this.gpaToGrade(gpa);
      } else {
        const letterGrade = this.gradeForm.get('letterGrade')?.value;
        this.calculatedGrade = this.letterToGrade(letterGrade);
      }
      this.showSummary = true;
    }
  }

  calculateFinalGrade(): void {
    if (this.finalGradeForm.valid) {
      const currentGrade = this.finalGradeForm.get('currentGrade')?.value;
      const targetGrade = this.finalGradeForm.get('targetGrade')?.value;
      const finalExamWeight = this.finalGradeForm.get('finalExamWeight')?.value;
      
      // Formula from The Calculator Site:
      // Final goal grade = [Target Grade - Current Grade × (100% - Weight of Final %)] ÷ Weight of Final %
      
      const currentWeight = 100 - finalExamWeight;
      const currentContribution = currentGrade * (currentWeight / 100);
      const targetContribution = targetGrade - currentContribution;
      const requiredFinalGrade = targetContribution / (finalExamWeight / 100);
      
      this.finalGradeResult = {
        currentGrade,
        targetGrade,
        finalExamWeight,
        currentWeight,
        currentContribution,
        targetContribution,
        requiredFinalGrade,
        isAchievable: requiredFinalGrade >= 0 && requiredFinalGrade <= 100,
        message: this.getFinalGradeMessage(requiredFinalGrade, targetGrade)
      };
      
      console.log('Final grade calculation result:', this.finalGradeResult);
    } else {
      console.log('Final grade form is invalid:', this.finalGradeForm.errors);
      this.markFormGroupTouched(this.finalGradeForm);
    }
  }

  getFinalGradeMessage(requiredGrade: number, targetGrade: number): string {
    if (requiredGrade < 0) {
      return `Your current grade is already above your target of ${targetGrade}%. You don't need to take the final exam to achieve your goal!`;
    } else if (requiredGrade > 100) {
      return `Unfortunately, it's impossible to achieve ${targetGrade}% with your current grade. The highest possible grade would be ${(this.finalGradeForm.get('currentGrade')?.value * (1 - this.finalGradeForm.get('finalExamWeight')?.value / 100) + this.finalGradeForm.get('finalExamWeight')?.value).toFixed(1)}%`;
    } else if (requiredGrade >= 90) {
      return `You need to score ${requiredGrade.toFixed(1)}% on your final exam. This is a challenging but achievable goal. Study hard!`;
    } else if (requiredGrade >= 80) {
      return `You need to score ${requiredGrade.toFixed(1)}% on your final exam. This is a good target - focus on your weak areas.`;
    } else if (requiredGrade >= 70) {
      return `You need to score ${requiredGrade.toFixed(1)}% on your final exam. This is achievable with consistent effort.`;
    } else {
      return `You need to score ${requiredGrade.toFixed(1)}% on your final exam. This should be manageable with proper preparation.`;
    }
  }

  // University Grade Calculator Methods
  addUniAssignment(): void {
    if (this.uniGradeFormData.name && this.uniGradeFormData.mark && this.uniGradeFormData.weight) {
      const newAssignment = {
        id: Date.now().toString(),
        name: this.uniGradeFormData.name,
        mark: parseFloat(this.uniGradeFormData.mark),
        weight: parseFloat(this.uniGradeFormData.weight),
        credits: this.uniGradeFormData.credits ? parseFloat(this.uniGradeFormData.credits) : undefined
      };
      
      this.uniAssignments.push(newAssignment);
      
      // Reset form data
      this.uniGradeFormData = { name: '', mark: '', weight: '', credits: '' };
      
      // Recalculate results
      this.calculateUniGrade();
      
      console.log('Assignment added:', newAssignment);
      console.log('All assignments:', this.uniAssignments);
    }
  }

  removeUniAssignment(id: string): void {
    this.uniAssignments = this.uniAssignments.filter(assignment => assignment.id !== id);
    this.calculateUniGrade();
    console.log('Assignment removed. Remaining assignments:', this.uniAssignments);
  }

  calculateUniGrade(): void {
    if (this.uniAssignments.length === 0) {
      this.uniGradeResult = null;
      return;
    }

    // Calculate weighted average using the formula from The Calculator Site:
    // Weighted Average = (Mark1 × Weight1 + Mark2 × Weight2 + ...) / (Weight1 + Weight2 + ...)
    
    const totalWeightedMarks = this.uniAssignments.reduce((sum, assignment) => 
      sum + (assignment.mark * assignment.weight), 0
    );
    
    const totalWeight = this.uniAssignments.reduce((sum, assignment) => 
      sum + assignment.weight, 0
    );
    
    const weightedAverage = totalWeight > 0 ? totalWeightedMarks / totalWeight : 0;
    
    // Calculate unweighted average
    const unweightedAverage = this.uniAssignments.reduce((sum, assignment) => 
      sum + assignment.mark, 0
    ) / this.uniAssignments.length;
    
    // Calculate total credits if available
    const totalCredits = this.uniAssignments.reduce((sum, assignment) => 
      sum + (assignment.credits || 0), 0
    );
    
    // Determine grade classification based on weighted average
    const gradeClassification = this.getGradeClassification(weightedAverage);
    
    // Calculate what's needed for target mark if specified
    let targetAnalysis = null;
    const targetMark = this.uniGradeForm.get('targetMark')?.value;
    if (targetMark && targetMark > 0) {
      targetAnalysis = this.calculateTargetAnalysis(weightedAverage, parseFloat(targetMark), totalWeight);
    }
    
    this.uniGradeResult = {
      weightedAverage: weightedAverage,
      unweightedAverage: unweightedAverage,
      totalWeight: totalWeight,
      totalCredits: totalCredits,
      assignmentCount: this.uniAssignments.length,
      gradeClassification: gradeClassification,
      targetAnalysis: targetAnalysis,
      assignments: [...this.uniAssignments]
    };
    
    console.log('University grade calculation result:', this.uniGradeResult);
  }

  getGradeClassification(average: number): string {
    if (average >= 70) return 'First Class (1st)';
    if (average >= 60) return 'Upper Second Class (2:1)';
    if (average >= 50) return 'Lower Second Class (2:2)';
    if (average >= 40) return 'Third Class (3rd)';
    return 'Fail';
  }

  calculateTargetAnalysis(currentAverage: number, targetMark: number, totalWeight: number): any {
    if (currentAverage >= targetMark) {
      return {
        isAchieved: true,
        message: `Congratulations! You've already achieved your target of ${targetMark}%`,
        requiredForRemaining: 0
      };
    }
    
    // Calculate what's needed for remaining assignments to reach target
    // This is a simplified calculation - in reality, it depends on how many assignments are left
    const remainingWeight = 100 - totalWeight;
    if (remainingWeight <= 0) {
      return {
        isAchieved: false,
        message: `Unfortunately, you cannot achieve ${targetMark}% with your current assignments. The highest possible grade would be ${currentAverage.toFixed(1)}%`,
        requiredForRemaining: null
      };
    }
    
    const requiredForRemaining = ((targetMark * 100) - (currentAverage * totalWeight)) / remainingWeight;
    
    return {
      isAchieved: false,
      message: `To achieve ${targetMark}%, you need an average of ${requiredForRemaining.toFixed(1)}% on your remaining assignments (${remainingWeight}% weight)`,
      requiredForRemaining: requiredForRemaining,
      remainingWeight: remainingWeight
    };
  }

  clearUniAssignments(): void {
    this.uniAssignments = [];
    this.uniGradeResult = null;
    console.log('All assignments cleared');
  }

  addCourse(): void {
    console.log('Adding course...', this.courseForm.value);
    console.log('Form valid:', this.courseForm.valid);
    console.log('Form errors:', this.courseForm.errors);
    
    if (this.courseForm.valid) {
      const courseData = this.courseForm.value;
      const gradeInfo = this.letterGrades.find(g => g.grade === courseData.grade);
      
      if (gradeInfo) {
        const newCourse: Course = {
          id: Date.now().toString(),
          name: courseData.courseName,
          credits: courseData.credits,
          grade: courseData.grade,
          percentage: gradeInfo.percentage,
          gpa: gradeInfo.gpa,
          semester: courseData.semester,
          year: courseData.year
        };

        console.log('New course created:', newCourse);

        // Find or create semester
        let semester = this.semesters.find(s => 
          s.name === `${courseData.semester} ${courseData.year}`
        );

        if (!semester) {
          semester = {
            id: Date.now().toString(),
            name: `${courseData.semester} ${courseData.year}`,
            year: courseData.year,
            courses: [],
            totalCredits: 0,
            semesterGPA: 0,
            semesterPercentage: 0
          };
          this.semesters.push(semester);
          console.log('New semester created:', semester);
        }

        semester.courses.push(newCourse);
        console.log('Course added to semester:', semester);
        
        this.calculateSemesterStats(semester);
        this.calculateAcademicRecord();
        this.courseForm.reset();
        
        // Show success message or feedback
        console.log('Course added successfully:', newCourse);
        console.log('Updated semesters:', this.semesters);
        console.log('Updated academic record:', this.academicRecord);
      }
    } else {
      console.log('Form is invalid:', this.courseForm.errors);
      this.markFormGroupTouched(this.courseForm);
    }
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  removeCourse(courseId: string, semesterId: string): void {
    const semester = this.semesters.find(s => s.id === semesterId);
    if (semester) {
      semester.courses = semester.courses.filter(c => c.id !== courseId);
      if (semester.courses.length === 0) {
        this.semesters = this.semesters.filter(s => s.id !== semesterId);
      } else {
        this.calculateSemesterStats(semester);
      }
      this.calculateAcademicRecord();
      console.log('Course removed successfully');
    }
  }

  calculateSemesterStats(semester: Semester): void {
    console.log('Calculating stats for semester:', semester.name);
    console.log('Courses in semester:', semester.courses);
    
    if (semester.courses.length === 0) {
      semester.totalCredits = 0;
      semester.semesterGPA = 0;
      semester.semesterPercentage = 0;
      console.log('No courses, stats reset to 0');
      return;
    }

    semester.totalCredits = semester.courses.reduce((sum, course) => sum + course.credits, 0);
    
    const totalGradePoints = semester.courses.reduce((sum, course) => 
      sum + (course.gpa * course.credits), 0
    );
    semester.semesterGPA = totalGradePoints / semester.totalCredits;
    
    const totalPercentage = semester.courses.reduce((sum, course) => 
      sum + (course.percentage * course.credits), 0
    );
    semester.semesterPercentage = totalPercentage / semester.totalCredits;
    
    console.log('Semester stats calculated:', {
      totalCredits: semester.totalCredits,
      semesterGPA: semester.semesterGPA,
      semesterPercentage: semester.semesterPercentage
    });
  }

  calculateAcademicRecord(): void {
    console.log('Calculating academic record...');
    console.log('Current semesters:', this.semesters);
    
    this.academicRecord.totalCredits = this.semesters.reduce((sum, semester) => 
      sum + semester.totalCredits, 0
    );
    
    this.academicRecord.totalCourses = this.semesters.reduce((sum, semester) => 
      sum + semester.courses.length, 0
    );

    if (this.academicRecord.totalCredits > 0) {
      const totalGradePoints = this.semesters.reduce((sum, semester) => 
        sum + (semester.semesterGPA * semester.totalCredits), 0
      );
      this.academicRecord.cumulativeGPA = totalGradePoints / this.academicRecord.totalCredits;
      
      const totalPercentage = this.semesters.reduce((sum, semester) => 
        sum + (semester.semesterPercentage * semester.totalCredits), 0
      );
      this.academicRecord.overallPercentage = totalPercentage / this.academicRecord.totalCredits;
    } else {
      this.academicRecord.cumulativeGPA = 0;
      this.academicRecord.overallPercentage = 0;
    }

    // Calculate grade distribution
    this.academicRecord.gradeDistribution = {};
    this.semesters.forEach(semester => {
      semester.courses.forEach(course => {
        this.academicRecord.gradeDistribution[course.grade] = 
          (this.academicRecord.gradeDistribution[course.grade] || 0) + 1;
      });
    });

    // Determine academic standing
    if (this.academicRecord.cumulativeGPA >= 3.5) {
      this.academicRecord.academicStanding = 'Dean\'s List';
      this.academicRecord.deanListEligible = true;
      this.academicRecord.academicWarning = false;
    } else if (this.academicRecord.cumulativeGPA >= 2.0) {
      this.academicRecord.academicStanding = 'Good Standing';
      this.academicRecord.deanListEligible = false;
      this.academicRecord.academicWarning = false;
    } else {
      this.academicRecord.academicStanding = 'Academic Warning';
      this.academicRecord.deanListEligible = false;
      this.academicRecord.academicWarning = true;
    }
    
    console.log('Academic record calculated:', this.academicRecord);
  }

  percentageToGrade(percentage: number): GradeInfo {
    if (percentage >= 97) return { grade: 'A+', percentage, gpa: 4.0, description: 'Excellent', color: '#28a745' };
    if (percentage >= 93) return { grade: 'A', percentage, gpa: 4.0, description: 'Excellent', color: '#28a745' };
    if (percentage >= 90) return { grade: 'A-', percentage, gpa: 3.7, description: 'Excellent', color: '#28a745' };
    if (percentage >= 87) return { grade: 'B+', percentage, gpa: 3.3, description: 'Good', color: '#17a2b8' };
    if (percentage >= 83) return { grade: 'B', percentage, gpa: 3.0, description: 'Good', color: '#17a2b8' };
    if (percentage >= 80) return { grade: 'B-', percentage, gpa: 2.7, description: 'Good', color: '#17a2b8' };
    if (percentage >= 77) return { grade: 'C+', percentage, gpa: 2.3, description: 'Average', color: '#ffc107' };
    if (percentage >= 73) return { grade: 'C', percentage, gpa: 2.0, description: 'Average', color: '#ffc107' };
    if (percentage >= 70) return { grade: 'C-', percentage, gpa: 1.7, description: 'Average', color: '#ffc107' };
    if (percentage >= 67) return { grade: 'D+', percentage, gpa: 1.3, description: 'Below Average', color: '#fd7e14' };
    if (percentage >= 63) return { grade: 'D', percentage, gpa: 1.0, description: 'Below Average', color: '#fd7e14' };
    if (percentage >= 60) return { grade: 'D-', percentage, gpa: 0.7, description: 'Below Average', color: '#fd7e14' };
    return { grade: 'F', percentage, gpa: 0.0, description: 'Failing', color: '#dc3545' };
  }

  gpaToGrade(gpa: number): GradeInfo {
    if (gpa >= 3.7) return { grade: 'A- to A+', percentage: 90, gpa, description: 'Excellent', color: '#28a745' };
    if (gpa >= 3.3) return { grade: 'B+', percentage: 87, gpa, description: 'Good', color: '#17a2b8' };
    if (gpa >= 3.0) return { grade: 'B', percentage: 83, gpa, description: 'Good', color: '#17a2b8' };
    if (gpa >= 2.7) return { grade: 'B-', percentage: 80, gpa, description: 'Good', color: '#17a2b8' };
    if (gpa >= 2.3) return { grade: 'C+', percentage: 77, gpa, description: 'Average', color: '#ffc107' };
    if (gpa >= 2.0) return { grade: 'C', percentage: 73, gpa, description: 'Average', color: '#ffc107' };
    if (gpa >= 1.7) return { grade: 'C-', percentage: 70, gpa, description: 'Average', color: '#ffc107' };
    if (gpa >= 1.3) return { grade: 'D+', percentage: 67, gpa, description: 'Below Average', color: '#fd7e14' };
    if (gpa >= 1.0) return { grade: 'D', percentage: 63, gpa, description: 'Below Average', color: '#fd7e14' };
    if (gpa >= 0.7) return { grade: 'D-', percentage: 60, gpa, description: 'Below Average', color: '#fd7e14' };
    return { grade: 'F', percentage: 0, gpa, description: 'Failing', color: '#dc3545' };
  }

  letterToGrade(letterGrade: string): GradeInfo {
    const grade = this.letterGrades.find(g => g.grade === letterGrade);
    return grade || { grade: letterGrade, percentage: 0, gpa: 0, description: 'Unknown', color: '#6c757d' };
  }

  resetForm(): void {
    this.gradeForm.reset();
    this.calculatedGrade = null;
    this.showSummary = false;
  }

  getGradeColor(grade: string): string {
    const gradeInfo = this.letterGrades.find(g => g.grade === grade);
    return gradeInfo ? gradeInfo.color : '#6c757d';
  }

  exportTranscript(): void {
    // Implementation for exporting transcript
    console.log('Exporting transcript...');
    alert('Transcript export functionality will be implemented soon!');
  }

  printAcademicRecord(): void {
    // Implementation for printing academic record
    console.log('Printing academic record...');
    window.print();
  }

  // Helper method to check if a form field is invalid
  isFieldInvalid(fieldName: string, form: FormGroup): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  // Helper method to get field error message
  getFieldErrorMessage(fieldName: string, form: FormGroup): string {
    const field = form.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['min']) return `${fieldName} must be at least ${field.errors['min'].min}`;
      if (field.errors['max']) return `${fieldName} must not exceed ${field.errors['max'].max}`;
    }
    return '';
  }

  // Test method to verify calculations
  testCalculations(): void {
    console.log('=== Testing Calculations ===');
    console.log('Current semesters:', this.semesters);
    console.log('Current academic record:', this.academicRecord);
    
    // Test adding a sample course
    const testCourse = {
      courseName: 'Test Course',
      credits: 3,
      grade: 'A',
      semester: 'Fall',
      year: '2025'
    };
    
    console.log('Testing with course:', testCourse);
    
    // Manually set form values for testing
    this.courseForm.patchValue(testCourse);
    
    console.log('Form values set:', this.courseForm.value);
    console.log('Form valid:', this.courseForm.valid);
    
    // Test the add course method
    this.addCourse();
  }

  // Method to clear all data for testing
  clearAllData(): void {
    this.semesters = [];
    this.academicRecord = {
      totalCredits: 0,
      cumulativeGPA: 0,
      overallPercentage: 0,
      totalCourses: 0,
      gradeDistribution: {},
      academicStanding: 'Good Standing',
      deanListEligible: false,
      academicWarning: false
    };
    console.log('All data cleared');
  }
}
