import { Component, computed, input, OnInit } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { BlogUserInfoComponent } from '../blog-user-info/blog-user-info.component';

interface BlogListItem {
  title: string;
  subtitle: string;   
  description: string;
  image: string;
  date: string;
  user?: UserInfo
}

export interface UserInfo {
  userName: string;
  userHandle: string;
  profileImage: string;
  blogDate: string;
  readDuration: string;
}


@Component({
  selector: 'app-blog-list-item',
  standalone: true,
  imports: [SharedModule, RouterModule, BlogUserInfoComponent],
  templateUrl: './blog-list-item.component.html',
  styleUrl: './blog-list-item.component.scss'
})
export class BlogListItemComponent implements OnInit {

  blogListItem = input<BlogListItem>();
  blog = computed(() => this.blogListItem());

  ngOnInit() {
    // console.log('BlogListItemComponent initialized with blog:', this.blog());
  } 
}
