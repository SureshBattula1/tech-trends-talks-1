import { Component, Input, signal } from '@angular/core';
import { BlogListItemComponent } from '../blog-list-item/blog-list-item.component';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [BlogListItemComponent],
  templateUrl: './blog-list.component.html',
  styleUrl: './blog-list.component.scss'
})
export class BlogListComponent {
  @Input() blogListItem: any;
  blogList =  signal([
    {
      id: 1,
      title: 'Exploring Angular 17 Features',
      subtitle: 'A comprehensive overview of the new features introduced in Angular 17.',
      description: 'A comprehensive overview of the new features introduced in Angular 17.',
      image: 'https://miro.medium.com/v2/resize:fill:200:134/1*zi5kKBES0aB0PwCjU7JQcw.jpeg',
      date: '2023-10-01'  
    },
    {
      id: 2,
      title: 'Building Scalable Applications with Angular',
      subtitle: 'A comprehensive overview of the new features introduced in Angular 17.',
      description: 'Best practices for building scalable applications using Angular.',
      image: 'https://media.licdn.com/dms/image/v2/D560BAQHuQqdWGsFM9Q/company-logo_100_100/B56ZaB.PV5HgAQ-/0/1745937299380/pwc_acs_in_india_logo?e=1756944000&v=beta&t=nWrjCULyqhD4GW0JxUgqtH6YrG4iAOMednGb1wDHidM',
      date: '2023-10-01'  
    },
    {     
      id: 3,
      title: 'Understanding Angular Signals',
      subtitle: 'A comprehensive overview of the new features introduced in Angular 17.',
      description: 'A deep dive into Angular Signals and their benefits over traditional state management.',
      image: 'https://media.licdn.com/dms/image/v2/D560BAQHuQqdWGsFM9Q/company-logo_100_100/B56ZaB.PV5HgAQ-/0/1745937299380/pwc_acs_in_india_logo?e=1756944000&v=beta&t=nWrjCULyqhD4GW0JxUgqtH6YrG4iAOMednGb1wDHidM',
      date: '2023-10-01'  
    },
      {
      id: 1,
      title: 'Exploring Angular 17 Features',
      description: 'A comprehensive overview of the new features introduced in Angular 17.',
      subtitle: 'A comprehensive overview of the new features introduced in Angular 17.',
      image: 'https://miro.medium.com/v2/resize:fill:100:66/1*AdBCKbDbACORa66Fhq7a5g.png',
      date: '2023-10-01'  
    },
    {
      id: 1,
      title: 'Exploring Angular 17 Features',
      subtitle: 'A comprehensive overview of the new features introduced in Angular 17.',
      description: 'A comprehensive overview of the new features introduced in Angular 17.',
      image: 'https://miro.medium.com/v2/resize:fill:200:134/1*zi5kKBES0aB0PwCjU7JQcw.jpeg',
      date: '2023-10-01'  
    },
    {
      id: 2,
      title: 'Building Scalable Applications with Angular',
      subtitle: 'A comprehensive overview of the new features introduced in Angular 17.',
      description: 'Best practices for building scalable applications using Angular.',
      image: 'https://media.licdn.com/dms/image/v2/D560BAQHuQqdWGsFM9Q/company-logo_100_100/B56ZaB.PV5HgAQ-/0/1745937299380/pwc_acs_in_india_logo?e=1756944000&v=beta&t=nWrjCULyqhD4GW0JxUgqtH6YrG4iAOMednGb1wDHidM',
      date: '2023-10-01'  
    },
    {     
      id: 3,
      title: 'Understanding Angular Signals',
      subtitle: 'A comprehensive overview of the new features introduced in Angular 17.',
      description: 'A deep dive into Angular Signals and their benefits over traditional state management.',
      image: 'https://media.licdn.com/dms/image/v2/D560BAQHuQqdWGsFM9Q/company-logo_100_100/B56ZaB.PV5HgAQ-/0/1745937299380/pwc_acs_in_india_logo?e=1756944000&v=beta&t=nWrjCULyqhD4GW0JxUgqtH6YrG4iAOMednGb1wDHidM',
      date: '2023-10-01'  
    },
      {
      id: 1,
      title: 'Exploring Angular 17 Features',
      description: 'A comprehensive overview of the new features introduced in Angular 17.',
      subtitle: 'A comprehensive overview of the new features introduced in Angular 17.',
      image: 'https://miro.medium.com/v2/resize:fill:100:66/1*AdBCKbDbACORa66Fhq7a5g.png',
      date: '2023-10-01'  
    },
   
  ])
}
