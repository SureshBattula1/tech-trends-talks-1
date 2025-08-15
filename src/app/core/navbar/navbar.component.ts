import { Component, computed, effect, inject, input, OnInit } from '@angular/core';
import { SharedModule } from '../../module/shared/shared.module';
import { RouterModule } from '@angular/router';
import { AppService } from '../../services/app/app.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [SharedModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {

  moduleName = input<string>('');
  module = computed(() => this.moduleName());

  private appService = inject(AppService);

  ngOnInit(): void {
      console.log('module changed:', this.module());
  }

  toggle() {
    this.appService.toggleSidenav();
  }

}
