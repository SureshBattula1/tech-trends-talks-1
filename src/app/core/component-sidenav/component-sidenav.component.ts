import { Component, computed, effect, inject, Inject, signal  } from '@angular/core';
import { SharedModule } from '../../module/shared/shared.module';
import { FooterComponent } from '../footer/footer.component';
import { ComponentNavComponent } from '../component-nav/component-nav.component';
import { ComponentViewerComponent } from '../component-viewer/component-viewer.component';
import { RouterOutlet } from '@angular/router';
import { AppService } from '../../services/app/app.service';
import { LoaderComponent } from '../loader/loader.component';
import { LoaderService } from '../../services/loading-bar/loader.service';

@Component({
  selector: 'app-component-sidenav',
  standalone: true,
  imports: [RouterOutlet,SharedModule,FooterComponent,ComponentNavComponent,ComponentViewerComponent,LoaderComponent],
  templateUrl: './component-sidenav.component.html',
  styleUrl: './component-sidenav.component.scss'
})
export class ComponentSidenavComponent {

  private appService = inject(AppService);
  public loader = inject(LoaderService);
  
  isVisible = computed(() => this.appService.isSidebarVisible());
  
}
