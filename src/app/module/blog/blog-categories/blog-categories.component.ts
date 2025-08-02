import { Component, signal } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-blog-categories',
  standalone: true,
  imports: [SharedModule, RouterModule],
  templateUrl: './blog-categories.component.html',
  styleUrl: './blog-categories.component.scss'
})
export class BlogCategoriesComponent {
  public blogCategories = signal([
    { id: 1,  name: "Angular" },
    { id: 1,  name: "Javascript" },
    { id: 1,  name: "PHP" },
    { id: 1,  name: "Java" },
    { id: 1,  name: "DBMS" },
    { id: 1,  name: "DevOps" },
    { id: 1,  name: "React" },
    { id: 1,  name: "Node js" },
    { id: 1,  name: "React Native" },
    { id: 1,  name: "Kotlin" },
    { id: 1,  name: "Artificial intelligence" },
  ]);

  toKebabCase(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-'); 
  }

}
