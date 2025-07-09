import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';

import { registerLocaleData } from '@angular/common';
import localeIndia from '@angular/common/locales/en-IN';

registerLocaleData(localeIndia);

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideAnimationsAsync(), provideAnimationsAsync(),   provideHttpClient(
      withInterceptorsFromDi(),
    ), provideClientHydration(),
    { provide: LOCALE_ID, useValue: 'en-IN' },
  ]
};
