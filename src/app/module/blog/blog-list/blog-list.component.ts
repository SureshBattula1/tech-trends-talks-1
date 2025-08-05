import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { BlogListItemComponent } from '../blog-list-item/blog-list-item.component';
import { ActivatedRoute } from '@angular/router';
import { PageComingSoonComponent } from '../../../core/page-coming-soon/page-coming-soon.component';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [BlogListItemComponent,PageComingSoonComponent],
  templateUrl: './blog-list.component.html',
  styleUrl: './blog-list.component.scss'
})
export class BlogListComponent implements OnInit {

  @Input() blogListItem: any;

  public categoryName = '';

  public route = inject(ActivatedRoute);


    blogList =  signal([
      {
        id: 1,
        title: 'Exploring Angular 17 Features',
        subtitle: 'A comprehensive overview of the new features introduced in Angular 17.',
        description: 'A comprehensive overview of the new features introduced in Angular 17.',
        image: 'https://miro.medium.com/v2/resize:fill:200:134/1*zi5kKBES0aB0PwCjU7JQcw.jpeg',
        date: '2023-10-01',
        user: {
              userName: "Suresh Dev",
              userHandle: "@admin_dev",
              profileImage: "assets/images/image.png",
              blogDate: "Jul 22, 2025",
              readDuration: "2 min read ",
        },
        category : this.categoryName
      },
      
    ]);

    ngOnInit() {

      this.categoryName = this.fromKebabToTitle(this.route.snapshot.paramMap.get('categoryName') || '');
        
      const tempList = [];

      for (let i = 1; i <= 15; i++) {
        tempList.push({
          id: i,
          title: `Blog Post ${i}`,
          subtitle: `Subtitle for Blog ${i}`,
          description: `Description for Blog ${i}`,
          image: 'https://placehold.co/600x400',
          date: '2023-10-01',
          category: this.categoryName,
          user: {
            userName: `User ${i}`,
            userHandle: `@user${i}`,
            profileImage: 'assets/images/image.png',
            blogDate: 'Jul 22, 2025',
            readDuration: '2 min read',
          }
        });
      }

      this.blogList.set(tempList);

    }

    fromKebabToTitle(name: string): string {
      return name
        .split('-') 
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) 
        .join(' '); 
    }

}
