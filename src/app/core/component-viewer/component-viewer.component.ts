import { Component } from '@angular/core';
import { SharedModule } from '../../module/shared/shared.module';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-component-viewer',
  standalone: true,
  imports: [RouterOutlet,SharedModule],
  templateUrl: './component-viewer.component.html',
  styleUrl: './component-viewer.component.scss'
})
export class ComponentViewerComponent {

}
