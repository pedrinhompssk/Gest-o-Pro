import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { StoreService } from './services/store.service';
import { AddTransactionModalComponent } from './components/add-transaction-modal.component';
import { ToastComponent } from './components/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, AddTransactionModalComponent, ToastComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  store = inject(StoreService);
  isMobileMenuOpen = signal(false);
}