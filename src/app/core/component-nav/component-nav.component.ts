import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { SharedModule } from '../../module/shared/shared.module';
import { RouterModule } from '@angular/router';
import { AppService } from '../../services/app/app.service';
import { AuthService, User } from '../auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-component-nav',
  standalone: true,
  imports: [SharedModule, RouterModule],
  templateUrl: './component-nav.component.html',
  styleUrl: './component-nav.component.scss'
})
export class ComponentNavComponent implements OnInit, OnDestroy{
private appService = inject(AppService);
public authService = inject(AuthService);

  
user: User | null = null;
isAuthenticated = false;
private authSubscription: Subscription | null = null;

ngOnInit(): void {
  this.subscribeToAuthState();
}

ngOnDestroy(): void {
  if (this.authSubscription) {
      this.authSubscription.unsubscribe();
  }
}

private subscribeToAuthState(): void {
  this.authSubscription = this.authService.authState$.subscribe(authState => {
      this.user = authState.user;
      this.isAuthenticated = authState.isAuthenticated;
  });
}

  menuClose(){
    this.appService.toggleSidenav();
  }

  logout(): void {
    this.authService.logout();
  }

}
