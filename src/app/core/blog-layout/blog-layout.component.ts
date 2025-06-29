import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SharedModule } from '../../module/shared/shared.module';
import { FooterComponent } from '../footer/footer.component';
import { ComponentViewerComponent } from '../component-viewer/component-viewer.component';

@Component({
  selector: 'app-blog-layout',
  standalone: true,
  imports: [RouterOutlet,SharedModule,FooterComponent,ComponentViewerComponent],
  templateUrl: './blog-layout.component.html',
  styleUrl: './blog-layout.component.scss'
})
export class BlogLayoutComponent {

}
