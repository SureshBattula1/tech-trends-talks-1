import { Component, inject } from '@angular/core';
import { SharedModule } from '../../module/shared/shared.module';
import { BreadcrumbService } from '../../services/breadcrumb/breadcrumb.service';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [SharedModule, RouterModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent {
 public breadcrumbs: Array<{ label: string, url: string }> = [];

 public breadcrumbService = inject(BreadcrumbService);
 public route = inject(ActivatedRoute);

  ngOnInit() {
    this.breadcrumbs = this.breadcrumbService.buildBreadcrumbs(this.route?.root);
    this.breadcrumbService.getBreadcrumbs(this.route).subscribe(bc => this.breadcrumbs = bc);
  }

}
