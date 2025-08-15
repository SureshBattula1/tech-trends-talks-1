import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface GradeInfo {
  grade: string;
  percentage: number;
  gpa: number;
  description: string;
  color: string;
}

@Component({
  selector: 'app-grade-calculator',
  templateUrl: './grade-calculator.component.html',
  styleUrls: ['./grade-calculator.component.scss']
})
export class GradeCalculatorComponent implements OnInit {
  gradeForm: FormGroup;
  selectedSystem: string = 'percentage';
  calculatedGrade: GradeInfo | null = null;
  showSummary: boolean = false;

  gradingSystems = [
    { value: 'percentage', label: 'Percentage to Grade', icon: '📊' },
    { value: 'gpa', label: 'GPA to Grade', icon: '🎯' },
    { value: 'letter', label: 'Letter Grade to GPA', icon: '📝' }
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

  constructor(private fb: FormBuilder) {
    this.gradeForm = this.fb.group({
      percentage: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      gpa: ['', [Validators.required, Validators.min(0), Validators.max(4)]],
      letterGrade: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.onSystemChange();
  }

  onSystemChange(): void {
    this.calculatedGrade = null;
    this.showSummary = false;
    
    // Reset form controls based on selected system
    if (this.selectedSystem === 'percentage') {
      this.gradeForm.get('percentage')?.enable();
      this.gradeForm.get('gpa')?.disable();
      this.gradeForm.get('letterGrade')?.disable();
    } else if (this.selectedSystem === 'gpa') {
      this.gradeForm.get('percentage')?.disable();
      this.gradeForm.get('gpa')?.enable();
      this.gradeForm.get('letterGrade')?.disable();
    } else {
      this.gradeForm.get('percentage')?.disable();
      this.gradeForm.get('gpa')?.disable();
      this.gradeForm.get('letterGrade')?.enable();
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
}
