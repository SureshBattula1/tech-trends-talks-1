import { Component } from '@angular/core';
import { SharedModule } from '../../module/shared/shared.module';
import { RouterOutlet } from '@angular/router';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-component-viewer',
  standalone: true,
  imports: [RouterOutlet,SharedModule, BreadcrumbComponent  ],
  templateUrl: './component-viewer.component.html',
  styleUrl: './component-viewer.component.scss'
})
export class ComponentViewerComponent {
  shouldHideBreadcrumbs = false; // Set this to true if you want to hide breadcrumbs for specific components
}
