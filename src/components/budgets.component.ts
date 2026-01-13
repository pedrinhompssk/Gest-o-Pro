import { Component, inject, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, PercentPipe } from '@angular/common';
import { StoreService } from '../services/store.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, PercentPipe, FormsModule],
  template: `
    <div class="space-y-8 animate-fade-in pb-12">
      <header>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{{ store.dict().budgets.title }}</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-2 text-lg">{{ store.dict().budgets.subtitle }}</p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         @for (item of budgetItems(); track item.id) {
            <div class="bg-white dark:bg-dark-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm p-8 flex flex-col group transition hover:shadow-xl duration-300">
               <div class="flex justify-between items-start mb-6">
                  <div class="flex items-center gap-4">
                     <div [class]="'w-14 h-14 rounded-2xl flex items-center justify-center ' + (item.color)">
                        <span class="material-symbols-rounded text-2xl">{{ item.icon }}</span>
                     </div>
                     <div>
                        <h3 class="font-bold text-xl text-gray-900 dark:text-white">{{ item.id }}</h3>
                        <p [class]="'text-xs font-bold uppercase tracking-wide mt-1 ' + getStatusColor(item.percentage)">
                           {{ getStatusText(item.percentage) }}
                        </p>
                     </div>
                  </div>
                  
                  <button (click)="item.isEditing = !item.isEditing" class="p-2.5 text-gray-400 hover:text-brand-500 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition">
                     <span class="material-symbols-rounded text-xl">{{ item.isEditing ? 'check' : 'edit' }}</span>
                  </button>
               </div>

               <div class="mb-6">
                  <div class="flex justify-between text-sm mb-2">
                     <span class="font-medium text-gray-500 dark:text-gray-400">{{ store.dict().budgets.spent }}</span>
                     <span class="font-bold text-gray-900 dark:text-white text-lg">{{ item.spent | currency:store.currencyCode():'symbol':'1.0-0' }}</span>
                  </div>
                  
                  <div class="h-4 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden p-0.5">
                     <div [class]="'h-full rounded-full transition-all duration-1000 ' + getProgressColor(item.percentage)" [style.width.%]="Math.min(item.percentage, 100)"></div>
                  </div>
               </div>

               <div class="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-700 mt-auto">
                  <span class="text-sm font-medium text-gray-500">{{ store.dict().budgets.remaining }}:</span>
                  @if (item.isEditing) {
                     <div class="flex items-center gap-2">
                        <input 
                           type="number" 
                           [ngModel]="item.limit" 
                           (ngModelChange)="updateLimit(item.id, $event)"
                           class="w-28 px-3 py-2 text-right text-base font-bold bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                        >
                     </div>
                  } @else {
                     <span class="text-lg font-bold text-gray-900 dark:text-white">{{ (item.limit - item.spent) | currency:store.currencyCode():'symbol':'1.0-0' }}</span>
                  }
               </div>
               
               @if (!item.isEditing) {
                  <div class="flex justify-between items-center mt-3">
                     <div class="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50 dark:bg-gray-700/50" title="Valor sugerido por dia até o fim do mês">
                        <span class="material-symbols-rounded text-xs text-brand-500">calendar_today</span>
                        <span class="text-[10px] font-bold text-gray-500 uppercase">{{ store.dict().budgets.daily }}:</span>
                        <span class="text-xs font-bold text-gray-900 dark:text-white">{{ item.dailySafeSpend | currency:store.currencyCode():'symbol':'1.0-0' }}</span>
                     </div>
                     <div class="text-xs text-right text-gray-400 font-medium">
                        {{ store.dict().budgets.limit }}: {{ item.limit | currency:store.currencyCode():'symbol':'1.0-0' }}
                     </div>
                  </div>
               }
            </div>
         }
      </div>
    </div>
  `
})
export class BudgetsComponent {
  store = inject(StoreService);
  Math = Math;

  budgetItems = computed(() => {
    const transactions = this.store.transactions();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = now.getDate();
    const daysRemaining = Math.max(1, daysInMonth - today + 1);

    // Calculate spent per category for current month
    const spendingMap = new Map<string, number>();
    transactions.forEach(t => {
      const d = new Date(t.date);
      if (t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        spendingMap.set(t.category, (spendingMap.get(t.category) || 0) + t.amount);
      }
    });

    return this.store.categories().map(cat => {
       const budget = this.store.budgets().find(b => b.categoryId === cat.id);
       const limit = budget ? budget.limit : 1000;
       const spent = spendingMap.get(cat.id) || 0;
       const percentage = limit > 0 ? (spent / limit) * 100 : 0;
       
       const remaining = Math.max(0, limit - spent);
       const dailySafeSpend = remaining / daysRemaining;
       
       return {
          ...cat,
          limit,
          spent,
          percentage,
          dailySafeSpend,
          isEditing: false
       };
    });
  });

  updateLimit(categoryId: string, limit: number) {
     this.store.updateBudgetLimit(categoryId, limit);
  }

  getProgressColor(percentage: number): string {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-amber-500';
    return 'bg-emerald-500';
  }

  getStatusColor(percentage: number): string {
    if (percentage >= 100) return 'text-red-600 dark:text-red-400';
    if (percentage >= 80) return 'text-amber-600 dark:text-amber-400';
    return 'text-emerald-600 dark:text-emerald-400';
  }

  getStatusText(percentage: number): string {
    const dict = this.store.dict().budgets.status;
    if (percentage >= 100) return dict.danger;
    if (percentage >= 80) return dict.warning;
    return dict.good;
  }
}