import { Component, computed, effect, inject, input, OnInit, OnDestroy } from '@angular/core';
import { SharedModule } from '../../module/shared/shared.module';
import { RouterModule } from '@angular/router';
import { AppService } from '../../services/app/app.service';
import { AuthService } from '../auth/auth.service';
import { User } from '../auth/auth.interfaces';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [SharedModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {

  moduleName = input<string>('');
  module = computed(() => this.moduleName());

  private appService = inject(AppService);
  public authService = inject(AuthService);
  
  user: User | null = null;
  isAuthenticated = false;
  private authSubscription: Subscription | null = null;

  ngOnInit(): void {
      // console.log('module changed:', this.module());
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

  toggle() {
    this.appService.toggleSidenav();
  }

  logout(): void {
    this.authService.logout();
  }

  get userDisplayName(): string {
    if (this.user) {
      return this.user.firstname || this.user.name;
    }
    return '';
  }
}
