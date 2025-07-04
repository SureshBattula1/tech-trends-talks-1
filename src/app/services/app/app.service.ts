import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppService {
 
  private _isSidebarVisible = signal(false);

  isSidebarVisible = this._isSidebarVisible;

  toggleSidenav() {
    this._isSidebarVisible.set(!this._isSidebarVisible());
  }

}
