import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { StoreService, Transaction } from '../services/store.service';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, ReactiveFormsModule, FormsModule, DatePipe],
  template: `
    <div class="space-y-8 animate-fade-in pb-20 md:pb-8">
      <header class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{{ store.dict().transactions.title }}</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-2 text-lg">{{ store.dict().transactions.subtitle }}</p>
        </div>
      </header>

      <!-- Advanced Filter Bar -->
      <div class="bg-white dark:bg-dark-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-6">
         
         <!-- Top Row: Search and Type -->
         <div class="flex flex-col md:flex-row gap-5 items-center">
            <!-- Search -->
            <div class="relative group w-full md:w-80">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-rounded text-xl">search</span>
              <input 
                [formControl]="searchControl"
                type="text" 
                [placeholder]="store.dict().transactions.search" 
                class="pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-2xl text-sm focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 outline-none w-full shadow-sm transition"
              >
            </div>

            <div class="h-10 w-px bg-gray-200 dark:bg-gray-700 hidden md:block"></div>

            <!-- Type Filter -->
            <div class="flex bg-gray-50 dark:bg-gray-700/50 p-1.5 rounded-2xl w-full md:w-auto">
                <button (click)="filterType.set('all')" [class]="'flex-1 md:flex-none px-6 py-2.5 text-sm font-bold rounded-xl transition ' + (filterType() === 'all' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400')">{{ store.dict().transactions.filters.all }}</button>
                <button (click)="filterType.set('income')" [class]="'flex-1 md:flex-none px-6 py-2.5 text-sm font-bold rounded-xl transition ' + (filterType() === 'income' ? 'bg-white dark:bg-gray-600 shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400')">{{ store.dict().transactions.filters.income }}</button>
                <button (click)="filterType.set('expense')" [class]="'flex-1 md:flex-none px-6 py-2.5 text-sm font-bold rounded-xl transition ' + (filterType() === 'expense' ? 'bg-white dark:bg-gray-600 shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400')">{{ store.dict().transactions.filters.expense }}</button>
            </div>
         </div>

         <!-- Bottom Row: Date & Category -->
         <div class="flex flex-col md:flex-row gap-5 items-center">
             <!-- Category Filter -->
             <div class="relative w-full md:w-auto">
               <select [(ngModel)]="filterCategory" class="w-full md:w-64 px-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-2xl text-sm focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-gray-700 dark:text-gray-200 appearance-none cursor-pointer">
                  <option value="">{{ store.dict().transactions.filters.all }} (Categorias)</option>
                  @for(cat of store.categories(); track cat.id) {
                     <option [value]="cat.id">{{ cat.id }}</option>
                  }
               </select>
               <span class="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-rounded text-gray-400 pointer-events-none">expand_more</span>
             </div>
             
             <!-- Quick Date Filters -->
             <div class="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                <button (click)="setRange('thisMonth')" [class]="'px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap border transition ' + (activeRange() === 'thisMonth' ? 'bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' : 'bg-gray-50 border-gray-200 dark:bg-gray-700/50 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700')">
                   {{ store.dict().transactions.ranges.thisMonth }}
                </button>
                <button (click)="setRange('lastMonth')" [class]="'px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap border transition ' + (activeRange() === 'lastMonth' ? 'bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' : 'bg-gray-50 border-gray-200 dark:bg-gray-700/50 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700')">
                   {{ store.dict().transactions.ranges.lastMonth }}
                </button>
                <button (click)="setRange('last3Months')" [class]="'px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap border transition ' + (activeRange() === 'last3Months' ? 'bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' : 'bg-gray-50 border-gray-200 dark:bg-gray-700/50 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700')">
                   {{ store.dict().transactions.ranges.last3Months }}
                </button>
             </div>

             <!-- Manual Date -->
             <div class="relative w-full md:w-auto">
               <input type="month" [(ngModel)]="filterMonth" (change)="activeRange.set('custom')" class="w-full md:w-auto px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-2xl text-sm focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-gray-700 dark:text-gray-200 cursor-pointer">
             </div>
         </div>

      </div>

      <!-- Filtered Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
         <div class="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-3xl border border-emerald-100 dark:border-emerald-800/50">
            <p class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-1">{{ store.dict().transactions.summary.income }}</p>
            <p class="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{{ transactionSummary().income | currency:store.currencyCode():'symbol':'1.2-2':store.localeCode() }}</p>
         </div>
         <div class="bg-red-50 dark:bg-red-900/20 p-5 rounded-3xl border border-red-100 dark:border-red-800/50">
            <p class="text-xs font-bold text-red-600 dark:text-red-400 uppercase mb-1">{{ store.dict().transactions.summary.expense }}</p>
            <p class="text-2xl font-bold text-red-700 dark:text-red-300">{{ transactionSummary().expense | currency:store.currencyCode():'symbol':'1.2-2':store.localeCode() }}</p>
         </div>
         <div class="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-3xl border border-blue-100 dark:border-blue-800/50">
            <p class="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">{{ store.dict().transactions.summary.balance }}</p>
            <p [class]="'text-2xl font-bold ' + (transactionSummary().balance >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-red-600 dark:text-red-400')">
               {{ transactionSummary().balance | currency:store.currencyCode():'symbol':'1.2-2':store.localeCode() }}
            </p>
         </div>
      </div>

      <!-- Grouped Transactions List -->
      <div class="space-y-8">
        @for (group of groupedTransactions(); track group.date) {
           <div class="animate-slide-up">
              <!-- Date Header with Sticky Position -->
              <div class="sticky top-0 z-10 bg-gray-50/95 dark:bg-dark-900/95 backdrop-blur-md py-4 mb-2 flex justify-between items-end border-b border-gray-200 dark:border-gray-700">
                 <div class="flex items-center gap-3">
                    <span class="text-3xl font-bold text-gray-900 dark:text-white">{{ getDay(group.date) }}</span>
                    <div class="flex flex-col">
                       <span class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{{ getMonth(group.date) }}</span>
                       <span class="text-xs text-gray-400 font-medium">{{ getWeekDay(group.date) }}</span>
                    </div>
                 </div>
                 <span [class]="'text-base font-bold bg-white dark:bg-gray-800 px-3 py-1 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 ' + (group.total >= 0 ? 'text-emerald-600' : 'text-gray-500')">
                    {{ group.total >= 0 ? '+' : '' }}{{ group.total | currency:store.currencyCode():'symbol' }}
                 </span>
              </div>

              <!-- Transactions Card List -->
              <div class="bg-white dark:bg-dark-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
                 @for (t of group.items; track t.id) {
                    <div class="group flex items-center p-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition cursor-default">
                       <!-- Icon -->
                       <div class="flex-shrink-0 mr-6">
                          <div [class]="'w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ' + (t.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300')">
                             <span class="material-symbols-rounded text-2xl">{{ getIcon(t.category) }}</span>
                          </div>
                       </div>

                       <!-- Details -->
                       <div class="flex-1 min-w-0 mr-6">
                          <p class="text-base font-bold text-gray-900 dark:text-white truncate mb-1">{{ t.description }}</p>
                          <div class="flex items-center gap-3">
                             <span class="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-lg uppercase tracking-wide">{{ t.category }}</span>
                             @if (t.paymentMethod === 'card') {
                                <span class="text-xs px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg flex items-center gap-1 font-medium">
                                   <span class="material-symbols-rounded text-sm">credit_card</span>
                                   {{ t.installments ? t.installments + 'x' : 'Crédito' }}
                                </span>
                             }
                          </div>
                       </div>

                       <!-- Amount -->
                       <div class="text-right whitespace-nowrap">
                          <p [class]="'text-lg font-bold ' + (t.type === 'income' ? 'text-emerald-600' : 'text-gray-900 dark:text-white')">
                             {{ t.type === 'income' ? '+' : '-' }}{{ t.amount | currency:store.currencyCode():'symbol' }}
                          </p>
                          
                          <!-- Actions (Visible on Hover/Focus) -->
                          <div class="flex justify-end gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity md:translate-x-0">
                             <button (click)="edit(t)" class="text-gray-400 hover:text-brand-600 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="Editar">
                                <span class="material-symbols-rounded text-xl">edit</span>
                             </button>
                             <button (click)="delete(t.id)" class="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition" title="Excluir">
                                <span class="material-symbols-rounded text-xl">delete</span>
                             </button>
                          </div>
                       </div>
                    </div>
                 }
              </div>
           </div>
        } @empty {
           <div class="flex flex-col items-center justify-center py-24 opacity-60">
              <div class="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 text-gray-400">
                 <span class="material-symbols-rounded text-4xl">filter_list_off</span>
              </div>
              <p class="text-lg text-gray-500 dark:text-gray-400 font-medium">{{ store.dict().transactions.empty }}</p>
           </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    .animate-slide-up { animation: slideUp 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class TransactionsComponent {
  store = inject(StoreService);
  searchControl = new FormControl('');
  
  // Filters
  filterType = signal<'all' | 'income' | 'expense'>('all');
  filterCategory = signal<string>('');
  filterMonth = signal<string>(''); // YYYY-MM
  activeRange = signal<'custom' | 'thisMonth' | 'lastMonth' | 'last3Months'>('all' as any); // hack for init

  // Helper to format date parts
  getDay(dateStr: string) { return dateStr.split('-')[2]; }
  getMonth(dateStr: string) { 
     const date = new Date(dateStr);
     return date.toLocaleString(this.store.language() === 'pt' ? 'pt-BR' : 'en-US', { month: 'long' });
  }
  getWeekDay(dateStr: string) {
     const date = new Date(dateStr);
     const userTimezoneOffset = date.getTimezoneOffset() * 60000;
     const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
     return adjustedDate.toLocaleString(this.store.language() === 'pt' ? 'pt-BR' : 'en-US', { weekday: 'long' });
  }

  setRange(range: 'thisMonth' | 'lastMonth' | 'last3Months') {
     this.activeRange.set(range);
     const now = new Date();
     
     if (range === 'thisMonth') {
        this.filterMonth.set(now.toISOString().slice(0, 7)); // YYYY-MM
     } else if (range === 'lastMonth') {
        now.setMonth(now.getMonth() - 1);
        this.filterMonth.set(now.toISOString().slice(0, 7));
     } else if (range === 'last3Months') {
        this.filterMonth.set(''); // Custom logic for last 3 months handling in computed if needed, or just clear specific month
        // Actually, for simplicity in this computed, let's treat last3Months as a special case in the computed or just unset month and let it show all? 
        // Let's implement specific logic in computed.
     }
  }

  filteredList = computed(() => {
    const term = this.searchControl.value?.toLowerCase() || '';
    const type = this.filterType();
    const cat = this.filterCategory();
    const month = this.filterMonth();
    const range = this.activeRange();

    const now = new Date();

    return this.store.transactions()
      .filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(term) || t.category.toLowerCase().includes(term);
        const matchesType = type === 'all' || t.type === type;
        const matchesCategory = cat === '' || t.category === cat;
        
        let matchesDate = true;
        if (range === 'last3Months') {
           const d = new Date(t.date);
           const threeMonthsAgo = new Date();
           threeMonthsAgo.setMonth(now.getMonth() - 3);
           matchesDate = d >= threeMonthsAgo && d <= now;
        } else if (month) {
           matchesDate = t.date.startsWith(month);
        }

        return matchesSearch && matchesType && matchesCategory && matchesDate;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  });

  transactionSummary = computed(() => {
     const list = this.filteredList();
     const income = list.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
     const expense = list.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
     return { income, expense, balance: income - expense };
  });

  groupedTransactions = computed(() => {
    const filtered = this.filteredList();

    // Grouping
    const groups: { [key: string]: { date: string, items: Transaction[], total: number } } = {};
    
    filtered.forEach(t => {
       if (!groups[t.date]) {
          groups[t.date] = { date: t.date, items: [], total: 0 };
       }
       groups[t.date].items.push(t);
       groups[t.date].total += (t.type === 'income' ? t.amount : -t.amount);
    });

    return Object.values(groups).sort((a,b) => b.date.localeCompare(a.date));
  });

  getIcon(category: string): string {
    const cat = this.store.categories().find(c => c.id === category);
    return cat ? cat.icon : 'receipt';
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