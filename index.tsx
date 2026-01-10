import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation, Routes } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import localeEs from '@angular/common/locales/es';
import localeFr from '@angular/common/locales/fr';
import localeDe from '@angular/common/locales/de';

import { AppComponent } from './src/app.component';
import { DashboardComponent } from './src/components/dashboard.component';
import { TransactionsComponent } from './src/components/transactions.component';
import { AnalyticsComponent } from './src/components/analytics.component';
import { AiAdvisorComponent } from './src/components/ai-advisor.component';
import { CalendarComponent } from './src/components/calendar.component';

// Register Locale Data
registerLocaleData(localePt, 'pt-BR');
registerLocaleData(localeEs, 'es-ES');
registerLocaleData(localeFr, 'fr-FR');
registerLocaleData(localeDe, 'de-DE');

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'transactions', component: TransactionsComponent },
  { path: 'calendar', component: CalendarComponent },
  { path: 'analytics', component: AnalyticsComponent },
  { path: 'advisor', component: AiAdvisorComponent },
  { path: '**', redirectTo: 'dashboard' }
];

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withHashLocation())
  ]
}).catch((err) => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.