import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogCategoryViewComponent } from './blog-category-view.component';

describe('BlogCategoryViewComponent', () => {
  let component: BlogCategoryViewComponent;
  let fixture: ComponentFixture<BlogCategoryViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogCategoryViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogCategoryViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
