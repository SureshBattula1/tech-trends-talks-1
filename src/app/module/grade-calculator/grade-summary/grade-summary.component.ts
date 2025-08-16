import { Component, Input } from '@angular/core';

export interface GradeSummaryData {
  grade: string;
  percentage: number;
  gpa: number;
  description: string;
  color: string;
  subject?: string;
  semester?: string;
  year?: string;
}

@Component({
  selector: 'app-grade-summary',
  templateUrl: './grade-summary.component.html',
  styleUrls: ['./grade-summary.component.scss']
})
export class GradeSummaryComponent {
  @Input() gradeData: GradeSummaryData | null = null;
  @Input() showDetails: boolean = true;

  getGradeClass(grade: string): string {
    if (grade.includes('A')) return 'excellent';
    if (grade.includes('B')) return 'good';
    if (grade.includes('C')) return 'average';
    if (grade.includes('D')) return 'below-average';
    if (grade.includes('F')) return 'failing';
    return 'unknown';
  }

  getPerformanceMessage(grade: string): string {
    if (grade.includes('A')) return 'Outstanding performance! Keep up the excellent work.';
    if (grade.includes('B')) return 'Good work! You\'re on the right track.';
    if (grade.includes('C')) return 'Average performance. Consider seeking additional help.';
    if (grade.includes('D')) return 'Below average. Focus on improving your understanding.';
    if (grade.includes('F')) return 'Failing grade. Please seek academic support immediately.';
    return 'Grade information not available.';
  }
}
