import { Component } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { BlogUserInfoComponent } from '../blog-user-info/blog-user-info.component';

@Component({
  selector: 'app-blog-view',
  standalone: true,
  imports: [SharedModule, BlogUserInfoComponent],
  templateUrl: './blog-view.component.html',
  styleUrl: './blog-view.component.scss'
})
export class BlogViewComponent {

}
