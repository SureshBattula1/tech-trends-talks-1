import { Component, computed, input, signal } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms'; // for ngModel
import { UserInfo } from '../blog-list-item/blog-list-item.component';

@Component({
  selector: 'app-blog-user-info',
  standalone: true,
  imports: [SharedModule, FormsModule],
  templateUrl: './blog-user-info.component.html',
  styleUrl: './blog-user-info.component.scss'
})
export class BlogUserInfoComponent {

 public defaultUser = {
    userName: "Admin Dev",
    userHandle: "@admin_dev",
    profileImage: "assets/images/image.png",
    blogDate: "Jul 22, 2025",
    readDuration: "2 min read ",
  }

  userInfo = input<UserInfo | undefined>();
  user = computed(() => this.userInfo() ?? this.defaultUser ); 

}