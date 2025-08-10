import { Component, inject, OnInit, signal } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-blog-categories',
  standalone: true,
  imports: [SharedModule, RouterModule],
  templateUrl: './blog-categories.component.html',
  styleUrl: './blog-categories.component.scss'
})
export class BlogCategoriesComponent implements OnInit{
  public blogCategories:any = signal([
    
  ]);

  borderColors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6'];

  getBorderStyle(index: number): string {
    const color = this.borderColors[index % this.borderColors.length];
    return `4px solid ${color}`;
  }

  toKebabCase(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-'); 
  }

  public apiService = inject(ApiService);

  ngOnInit(): void {
    this.apiService.getCategories().subscribe((response:any) => { 
      this.blogCategories.set(response.data);
    });
  }

}
