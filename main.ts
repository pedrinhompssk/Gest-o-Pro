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
import { WelcomeComponent } from './src/components/welcome.component';
import { DashboardComponent } from './src/components/dashboard.component';
import { TransactionsComponent } from './src/components/transactions.component';
import { AnalyticsComponent } from './src/components/analytics.component';
import { AiAdvisorComponent } from './src/components/ai-advisor.component';
import { CalendarComponent } from './src/components/calendar.component';
import { RegisterComponent } from './src/components/register.component';
import { LoginComponent } from './src/components/login.component';
import { SettingsComponent } from './src/components/settings.component';
import { BudgetsComponent } from './src/components/budgets.component';

// Safely register locales
try {
  registerLocaleData(localePt, 'pt-BR');
  registerLocaleData(localeEs, 'es-ES');
  registerLocaleData(localeFr, 'fr-FR');
  registerLocaleData(localeDe, 'de-DE');
} catch (e) {
  console.warn('Locale data registration failed', e);
}

const routes: Routes = [
  { path: '', redirectTo: 'welcome', pathMatch: 'full' },
  { path: 'welcome', component: WelcomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'transactions', component: TransactionsComponent },
  { path: 'calendar', component: CalendarComponent },
  { path: 'analytics', component: AnalyticsComponent },
  { path: 'budgets', component: BudgetsComponent },
  { path: 'advisor', component: AiAdvisorComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: 'welcome' }
];

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withHashLocation())
  ]
}).catch((err) => {
  console.error('Angular Bootstrap Failed:', err);
  const root = document.querySelector('app-root');
  if (root) {
     root.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; padding:20px; text-align:center; font-family:sans-serif; color:#ef4444;">
        <h1 style="font-size:24px; margin-bottom:10px;">Erro ao Iniciar</h1>
        <p style="color:#374151;">Ocorreu um problema técnico na inicialização do aplicativo.</p>
        <p style="font-size:12px; margin-top:20px; background:#f3f4f6; padding:10px; border-radius:8px;">${err.message}</p>
      </div>
     `;
  }
});