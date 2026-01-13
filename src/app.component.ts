import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { StoreService } from './services/store.service';
import { AddTransactionModalComponent } from './components/add-transaction-modal.component';
import { GoalsModalComponent } from './components/goals-modal.component';
import { ToastComponent } from './components/toast.component';
import { WelcomeComponent } from './components/welcome.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, AddTransactionModalComponent, GoalsModalComponent, ToastComponent, WelcomeComponent],
  templateUrl: './app.component.html',
  styles: [`
    @keyframes slide-right {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    .animate-slide-right { animation: slide-right 0.3s ease-out; }
  `]
})
export class AppComponent {
  store = inject(StoreService);
  router = inject(Router);
  
  isMobileMenuOpen = signal(false);
  showSidebar = signal(false);

  constructor() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Hide sidebar on welcome, register, and login pages
        const hiddenRoutes = ['/welcome', '/register', '/login'];
        const shouldHide = hiddenRoutes.some(route => event.urlAfterRedirects.startsWith(route));
        this.showSidebar.set(!shouldHide);
        this.isMobileMenuOpen.set(false);
      }
    });
  }
}