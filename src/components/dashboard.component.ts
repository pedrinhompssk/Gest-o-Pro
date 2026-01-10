import { Component, inject, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { StoreService, Transaction } from '../services/store.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink, DecimalPipe],
  template: `
    <div class="space-y-6 animate-fade-in pb-12">
      <!-- Header -->
      <header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{{ store.dict().dashboard.title }}</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">{{ store.dict().dashboard.subtitle }}</p>
        </div>
        <div class="flex gap-3">
          <button (click)="store.openModal()" class="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-500 transition shadow-lg shadow-brand-500/20 active:scale-95 flex items-center gap-2">
            <span class="material-symbols-rounded text-lg">add</span>
            {{ store.dict().common.add }}
          </button>
          <button routerLink="/advisor" class="px-4 py-2.5 bg-white dark:bg-dark-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm flex items-center gap-2">
            <span class="material-symbols-rounded text-xl text-brand-500">auto_awesome</span>
            <span class="hidden sm:inline">{{ store.dict().dashboard.aiButton }}</span>
          </button>
        </div>
      </header>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <!-- Total Balance (Featured) -->
        <div class="relative overflow-hidden p-8 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-black dark:to-dark-800 rounded-[2rem] shadow-2xl text-white group ring-1 ring-white/10 transition-transform hover:scale-[1.01]">
          <!-- Decorative Blur -->
          <div class="absolute -top-24 -right-24 w-64 h-64 bg-brand-500/20 rounded-full blur-[80px]"></div>
          
          <div class="relative z-10 flex flex-col h-full justify-between">
            <div class="flex justify-between items-start mb-6">
              <div class="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/5 shadow-inner">
                <span class="material-symbols-rounded text-2xl text-brand-300">account_balance_wallet</span>
              </div>
              
              <!-- Trend Pill -->
              <div [class]="'flex items-center px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md ' + (store.financialTrend() >= 0 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30')">
                 <span class="material-symbols-rounded text-sm mr-1">{{ store.financialTrend() >= 0 ? 'trending_up' : 'trending_down' }}</span>
                 {{ store.financialTrend() | number:'1.1-1' }}%
              </div>
            </div>
            
            <div>
              <p class="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">{{ store.dict().dashboard.cards.balance }}</p>
              <h3 class="text-4xl font-bold tracking-tight text-white">{{ store.totalBalance() | currency:store.currencyCode():'symbol':'1.2-2':store.localeCode() }}</h3>
            </div>
          </div>
        </div>

        <!-- Income Card -->
        <div class="relative p-6 bg-white dark:bg-dark-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between">
           <div class="flex items-start justify-between mb-4">
              <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition border border-blue-100 dark:border-blue-800">
                <span class="material-symbols-rounded text-2xl">arrow_upward</span>
              </div>
              <span class="text-xs font-bold text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-lg">MÊS</span>
           </div>
           
           <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{{ store.dict().dashboard.cards.income }}</p>
              <h3 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mt-1">{{ store.monthlyIncome() | currency:store.currencyCode():'symbol':'1.2-2':store.localeCode() }}</h3>
           </div>
        </div>

        <!-- Expenses Card -->
        <div class="relative p-6 bg-white dark:bg-dark-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between">
           <div class="flex items-start justify-between mb-4">
              <div class="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl text-red-600 dark:text-red-400 group-hover:scale-110 transition border border-red-100 dark:border-red-800">
                <span class="material-symbols-rounded text-2xl">arrow_downward</span>
              </div>
              <span class="text-xs font-bold text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-lg">MÊS</span>
           </div>
           
           <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{{ store.dict().dashboard.cards.expenses }}</p>
              <h3 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mt-1">{{ store.monthlyExpenses() | currency:store.currencyCode():'symbol':'1.2-2':store.localeCode() }}</h3>
           </div>
        </div>
      </div>

      <!-- Financial Health Bar -->
      <div class="bg-white dark:bg-dark-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
         <div class="flex justify-between items-center mb-4">
            <h3 class="font-bold text-gray-900 dark:text-white">Fluxo do Mês</h3>
            <span class="text-sm text-gray-500">{{ calculateSavingsRate() | number:'1.0-0' }}% economizado</span>
         </div>
         
         <div class="h-4 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
            <!-- Income Bar (Green) -->
            <div class="h-full bg-emerald-500 transition-all duration-1000" [style.width.%]="getIncomePercentage()"></div>
            <!-- Expense Bar (Red - visually showing how much of income was eaten) -->
         </div>
         <div class="flex justify-between mt-2 text-xs font-medium text-gray-400">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
         </div>
         <div class="mt-2 text-xs text-gray-500 text-center">
            Gastos representam <b>{{ getExpensePercentage() | number:'1.0-0' }}%</b> das suas entradas.
         </div>
      </div>

      <!-- Recent Transactions List -->
      <div class="bg-white dark:bg-dark-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-dark-800/50">
          <h2 class="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
             <span class="material-symbols-rounded text-gray-400">history</span>
             {{ store.dict().dashboard.recent }}
          </h2>
          <a routerLink="/transactions" class="text-sm text-brand-600 hover:text-brand-700 font-bold hover:underline transition">{{ store.dict().dashboard.viewAll }}</a>
        </div>
        
        <div class="divide-y divide-gray-100 dark:divide-gray-700">
          @for (t of recentTransactions(); track t.id) {
            <div class="p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30 transition group cursor-default">
              <div class="flex items-center gap-5">
                <!-- Icon with solid background -->
                <div [class]="'w-12 h-12 flex items-center justify-center rounded-2xl shadow-sm border border-black/5 transition-transform group-hover:scale-105 ' + (t.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300')">
                  <span class="material-symbols-rounded text-xl">{{ getIcon(t.category) }}</span>
                </div>
                <div>
                  <p class="font-bold text-sm text-gray-900 dark:text-white">{{ t.description }}</p>
                  <div class="flex items-center gap-2 mt-1">
                     <span class="text-xs text-gray-500 font-medium bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md">{{ t.category }}</span>
                     <span class="text-xs text-gray-400">{{ t.date }}</span>
                  </div>
                </div>
              </div>
              
              <div class="flex items-center gap-4">
                 <span [class]="'font-bold text-base ' + (t.type === 'income' ? 'text-emerald-600' : 'text-gray-900 dark:text-white')">
                    {{ t.type === 'income' ? '+' : '-' }}{{ t.amount | currency:store.currencyCode():'symbol':'1.2-2':store.localeCode() }}
                 </span>
                 
                 <!-- Quick Actions (Hidden by default, shown on hover) -->
                 <div class="w-8 flex justify-end">
                   <button (click)="edit(t)" class="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-brand-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                      <span class="material-symbols-rounded text-lg">edit</span>
                   </button>
                 </div>
              </div>
            </div>
          } @empty {
             <div class="p-12 text-center text-gray-500 dark:text-gray-400 text-sm flex flex-col items-center gap-2">
                <span class="material-symbols-rounded text-4xl opacity-20">receipt_long</span>
                {{ store.dict().transactions.empty }}
             </div>
          }
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  store = inject(StoreService);

  recentTransactions = computed(() => this.store.transactions().slice(0, 5));

  getIcon(category: string): string {
    const cat = this.store.categories().find(c => c.id === category);
    return cat ? cat.icon : 'receipt';
  }

  getIncomePercentage(): number {
     const income = this.store.monthlyIncome();
     const expenses = this.store.monthlyExpenses();
     if (income === 0) return 0;
     // Just visualization logic: full bar is income capacity.
     return 100;
  }

  getExpensePercentage(): number {
    const income = this.store.monthlyIncome();
    const expenses = this.store.monthlyExpenses();
    if (income === 0) return expenses > 0 ? 100 : 0;
    return Math.min((expenses / income) * 100, 100);
  }

  calculateSavingsRate(): number {
    const income = this.store.monthlyIncome();
    const expenses = this.store.monthlyExpenses();
    if (income <= 0) return 0;
    const savings = income - expenses;
    return Math.max(0, (savings / income) * 100);
  }

  delete(id: string) {
    if(confirm('Tem certeza?')) {
      this.store.deleteTransaction(id);
    }
  }

  edit(t: Transaction) {
    this.store.openModal(t);
  }
}