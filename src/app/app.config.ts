import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';

import { registerLocaleData } from '@angular/common';
import localeIndia from '@angular/common/locales/en-IN';
import { LoadingInterceptor } from './services/loading-bar/loading.interceptor';

registerLocaleData(localeIndia);

export const appConfig: ApplicationConfig = {
  providers: [
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideRouter(routes), 
      provideAnimationsAsync(), 
      provideAnimationsAsync(),  
      provideHttpClient(withInterceptorsFromDi(),), 
      provideClientHydration(),
      { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
      { provide: LOCALE_ID, useValue: 'en-IN' },
  ]
};
