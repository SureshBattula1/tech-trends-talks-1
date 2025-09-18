import { Component, inject, Input, OnInit } from '@angular/core';
import { SharedModule } from '../../module/shared/shared.module';
import { BreadcrumbService } from '../../services/breadcrumb/breadcrumb.service';
import { ActivatedRoute, Router, RouterModule, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [SharedModule, RouterModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent implements OnInit {
 public breadcrumbs: Array<{ label: string, url: string }> = [];
 public shouldShowBreadcrumbs: boolean = true;

 @Input() hideBreadcrumbs: boolean = false;

 public breadcrumbService = inject(BreadcrumbService);
 public route = inject(ActivatedRoute);
 public router = inject(Router);

  ngOnInit() {
    this.breadcrumbs = this.breadcrumbService.buildBreadcrumbs(this.route?.root);
    this.breadcrumbService.getBreadcrumbs(this.route).subscribe(bc => {
      this.breadcrumbs = bc;
      this.checkBreadcrumbVisibility();
    });
    
    // Listen to router events to update breadcrumb visibility
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkBreadcrumbVisibility();
    });
    
    this.checkBreadcrumbVisibility();
  }

  private checkBreadcrumbVisibility() {
    // Check if breadcrumbs should be hidden via input
    if (this.hideBreadcrumbs) {
      this.shouldShowBreadcrumbs = false;
      return;
    }

    // Simple URL-based check first
    const currentUrl = this.router.url;
    const hiddenUrls = ['/blogs/home'];
    
    if (hiddenUrls.includes(currentUrl)) {
      this.shouldShowBreadcrumbs = false;
      return;
    }

    // Use breadcrumb service to determine visibility
    this.shouldShowBreadcrumbs = !this.breadcrumbService.shouldHideBreadcrumbs(this.route);
  }

}
