import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { StoreService, Transaction } from '../services/store.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, ReactiveFormsModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{{ store.dict().transactions.title }}</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">{{ store.dict().transactions.subtitle }}</p>
        </div>
        <div class="relative group">
           <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-rounded">search</span>
           <input 
             [formControl]="searchControl"
             type="text" 
             [placeholder]="store.dict().transactions.search" 
             class="pl-10 pr-4 py-2.5 bg-white dark:bg-dark-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none w-full sm:w-72 shadow-sm transition"
           >
        </div>
      </header>

      <div class="bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 dark:bg-dark-900/50 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-xs border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th class="px-6 py-4">{{ store.dict().transactions.table.date }}</th>
                <th class="px-6 py-4">{{ store.dict().transactions.table.description }}</th>
                <th class="px-6 py-4">{{ store.dict().transactions.table.category }}</th>
                <th class="px-6 py-4">{{ store.dict().transactions.table.method }}</th>
                <th class="px-6 py-4 text-right">{{ store.dict().transactions.table.amount }}</th>
                <th class="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              @for (t of filteredTransactions(); track t.id) {
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition group">
                  <td class="px-6 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">{{ t.date }}</td>
                  <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300">
                         <span class="material-symbols-rounded text-lg">{{ getIcon(t.category) }}</span>
                      </div>
                      {{ t.description }}
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                      {{ t.category }}
                    </span>
                  </td>
                   <td class="px-6 py-4 text-gray-500 dark:text-gray-400">
                    <div class="flex flex-col text-xs">
                       <span class="font-medium text-gray-700 dark:text-gray-300">{{ getPaymentMethodLabel(t.paymentMethod) }}</span>
                       @if (t.paymentMethod === 'card' && t.installments) {
                         <span class="text-brand-600 dark:text-brand-400 font-bold">{{ t.installments }}x</span>
                       }
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right font-bold">
                     <span [class]="t.type === 'income' ? 'text-green-600' : 'text-gray-900 dark:text-white'">
                        {{ t.type === 'income' ? '+' : '-' }}{{ t.amount | currency:store.currencyCode():'symbol' }}
                     </span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                      <button (click)="edit(t)" class="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30 rounded-lg transition" [title]="store.dict().common.edit">
                        <span class="material-symbols-rounded text-lg">edit</span>
                      </button>
                      <button (click)="delete(t.id)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition" [title]="store.dict().common.delete">
                        <span class="material-symbols-rounded text-lg">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                     <div class="flex flex-col items-center gap-2 opacity-60">
                       <span class="material-symbols-rounded text-4xl">search_off</span>
                       <p>{{ store.dict().transactions.empty }}</p>
                     </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class TransactionsComponent {
  store = inject(StoreService);
  searchControl = new FormControl('');

  filteredTransactions() {
    const term = this.searchControl.value?.toLowerCase() || '';
    return this.store.transactions().filter(t => 
      t.description.toLowerCase().includes(term) || 
      t.category.toLowerCase().includes(term)
    );
  }

  getIcon(category: string): string {
    const map: Record<string, string> = {
      'Alimentação': 'shopping_cart',
      'Habitação': 'home',
      'Transporte': 'directions_car',
      'Lazer': 'movie',
      'Saúde': 'medical_services',
      'Receitas': 'payments',
      'Restaurantes': 'restaurant'
    };
    return map[category] || 'receipt';
  }

  getPaymentMethodLabel(method?: string): string {
    if (!method) return '-';
    // Access dictionary directly
    const dict = this.store.dict().modal.methods as any;
    return dict[method] || method;
  }

  delete(id: string) {
    if(confirm('Tem certeza que deseja excluir esta transação?')) {
      this.store.deleteTransaction(id);
    }
  }

  edit(t: Transaction) {
    this.store.openModal(t);
  }
}