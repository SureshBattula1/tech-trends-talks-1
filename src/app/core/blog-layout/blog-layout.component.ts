import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SharedModule } from '../../module/shared/shared.module';
import { FooterComponent } from '../footer/footer.component';
import { ComponentViewerComponent } from '../component-viewer/component-viewer.component';
import { AppService } from '../../services/app/app.service';
import { LoaderService } from '../../services/loading-bar/loader.service';
import { ComponentNavComponent } from '../component-nav/component-nav.component';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-blog-layout',
  standalone: true,
  imports: [RouterOutlet,SharedModule,LoaderComponent,FooterComponent,ComponentNavComponent,ComponentViewerComponent],
  templateUrl: './blog-layout.component.html',
  styleUrl: './blog-layout.component.scss'
})
export class BlogLayoutComponent {
  private appService = inject(AppService);
  public loader = inject(LoaderService);
  
  isVisible = computed(() => this.appService.isSidebarVisible());
  
}
