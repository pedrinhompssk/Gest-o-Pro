import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      @for (toast of notificationService.toasts(); track toast.id) {
        <div 
          class="pointer-events-auto min-w-[300px] p-4 rounded-xl shadow-lg border backdrop-blur-md transform transition-all animate-slide-in flex items-center gap-3"
          [class.bg-white]="true"
          [class.dark:bg-dark-800]="true"
          [class.border-green-100]="toast.type === 'success'"
          [class.dark:border-green-900]="toast.type === 'success'"
          [class.border-red-100]="toast.type === 'error'"
          [class.dark:border-red-900]="toast.type === 'error'"
        >
          <div [class]="'p-2 rounded-full ' + (toast.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600')">
            <span class="material-symbols-rounded text-sm">
              {{ toast.type === 'success' ? 'check' : 'error' }}
            </span>
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ toast.message }}</p>
          </div>
          <button (click)="notificationService.remove(toast.id)" class="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <span class="material-symbols-rounded text-sm">close</span>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    .animate-slide-in { animation: slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
  `]
})
export class ToastComponent {
  notificationService = inject(NotificationService);
}