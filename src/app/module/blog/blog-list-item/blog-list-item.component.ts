import { Component, computed, input, OnInit } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';

interface BlogListItem {
  title: string;
  subtitle: string;   
  description: string;
  image: string;
  date: string;
}

@Component({
  selector: 'app-blog-list-item',
  standalone: true,
  imports: [SharedModule, RouterModule],
  templateUrl: './blog-list-item.component.html',
  styleUrl: './blog-list-item.component.scss'
})
export class BlogListItemComponent implements OnInit {

  blogListItem = input<BlogListItem>();
  blog = computed(() => this.blogListItem());

  ngOnInit() {
    console.log('BlogListItemComponent initialized with blog:', this.blog());
  } 
}
