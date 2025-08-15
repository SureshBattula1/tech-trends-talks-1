import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogAdminLayoutComponent } from './blog-admin-layout.component';

describe('BlogAdminLayoutComponent', () => {
  let component: BlogAdminLayoutComponent;
  let fixture: ComponentFixture<BlogAdminLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogAdminLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogAdminLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
