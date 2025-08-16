import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Meta, Title } from '@angular/platform-browser';
import { GradeCalculatorComponent } from './grade-calculator.component';

describe('GradeCalculatorComponent', () => {
  let component: GradeCalculatorComponent;
  let fixture: ComponentFixture<GradeCalculatorComponent>;
  let mockMeta: jasmine.SpyObj<Meta>;
  let mockTitle: jasmine.SpyObj<Title>;

  beforeEach(async () => {
    mockMeta = jasmine.createSpyObj('Meta', ['addTags']);
    mockTitle = jasmine.createSpyObj('Title', ['setTitle']);

    await TestBed.configureTestingModule({
      declarations: [ GradeCalculatorComponent ],
      imports: [
        ReactiveFormsModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: Meta, useValue: mockMeta },
        { provide: Title, useValue: mockTitle }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GradeCalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with one semester', () => {
    expect(component.semestersArray.length).toBe(1);
  });

  it('should add semester when addSemester is called', () => {
    const initialLength = component.semestersArray.length;
    component.addSemester();
    expect(component.semestersArray.length).toBe(initialLength + 1);
  });

  it('should add course when addCourse is called', () => {
    const semesterIndex = 0;
    const coursesArray = component.semestersArray.at(semesterIndex).get('courses');
    const initialLength = coursesArray?.length || 0;
    
    component.addCourse(semesterIndex);
    expect(coursesArray?.length).toBe(initialLength + 1);
  });

  it('should calculate correct grade info for marks', () => {
    const gradeInfo = component.getGradeInfo(95);
    expect(gradeInfo.grade).toBe('S');
    expect(gradeInfo.gradePoint).toBe(10);
    expect(gradeInfo.performance).toBe('Outstanding');
  });

  it('should calculate results correctly', () => {
    // Set up test data
    const semesterControl = component.semestersArray.at(0);
    semesterControl.patchValue({
      name: 'Test Semester',
      courses: [
        { name: 'Test Course', credits: 3, marks: 85 }
      ]
    });

    component.calculateResults();

    expect(component.showResults).toBe(true);
    expect(component.semesters.length).toBe(1);
    expect(component.semesters[0].sgpa).toBe(8); // A grade = 8 points
  });

  it('should reset calculator correctly', () => {
    component.addSemester();
    component.calculateResults();
    
    component.resetCalculator();
    
    expect(component.semestersArray.length).toBe(1);
    expect(component.showResults).toBe(false);
    expect(component.cgpa).toBe(0);
    expect(component.percentage).toBe(0);
  });

  it('should return correct grade colors', () => {
    expect(component.getGradeColor('S')).toBe('#4CAF50');
    expect(component.getGradeColor('A+')).toBe('#8BC34A');
    expect(component.getGradeColor('F')).toBe('#F44336');
  });

  it('should return correct performance colors', () => {
    expect(component.getPerformanceColor('Outstanding')).toBe('#4CAF50');
    expect(component.getPerformanceColor('Excellent')).toBe('#8BC34A');
    expect(component.getPerformanceColor('Fail')).toBe('#F44336');
  });

  it('should track by index correctly', () => {
    const index = 5;
    expect(component.trackByIndex(index)).toBe(index);
  });

  it('should setup SEO on initialization', () => {
    expect(mockTitle.setTitle).toHaveBeenCalledWith('Grade Calculator - Calculate SGPA & CGPA Online | Tech Trends Talks');
    expect(mockMeta.addTags).toHaveBeenCalled();
  });

  it('should validate form correctly', () => {
    const semesterControl = component.semestersArray.at(0);
    semesterControl.patchValue({
      name: 'Test Semester',
      courses: [
        { name: 'Test Course', credits: 3, marks: 85 }
      ]
    });

    expect(component.gradeCalculatorForm.valid).toBe(true);
  });

  it('should handle invalid form data', () => {
    const semesterControl = component.semestersArray.at(0);
    semesterControl.patchValue({
      name: '', // Invalid: empty name
      courses: [
        { name: 'Test Course', credits: 0, marks: 101 } // Invalid: credits 0, marks > 100
      ]
    });

    expect(component.gradeCalculatorForm.valid).toBe(false);
  });

  it('should calculate CGPA correctly for multiple semesters', () => {
    // Add two semesters with different SGPA values
    component.addSemester();
    
    const semester1 = component.semestersArray.at(0);
    const semester2 = component.semestersArray.at(1);
    
    semester1.patchValue({
      name: 'Semester 1',
      courses: [
        { name: 'Course 1', credits: 3, marks: 85 }, // A grade = 8 points
        { name: 'Course 2', credits: 3, marks: 90 }  // A+ grade = 9 points
      ]
    });
    
    semester2.patchValue({
      name: 'Semester 2',
      courses: [
        { name: 'Course 3', credits: 3, marks: 95 }, // S grade = 10 points
        { name: 'Course 4', credits: 3, marks: 80 }  // A grade = 8 points
      ]
    });

    component.calculateResults();

    // Semester 1: (3*8 + 3*9) / 6 = 8.5
    // Semester 2: (3*10 + 3*8) / 6 = 9.0
    // CGPA: (8.5*6 + 9.0*6) / 12 = 8.75
    expect(component.cgpa).toBeCloseTo(8.75, 2);
    expect(component.percentage).toBeCloseTo(87.5, 1);
  });
});
