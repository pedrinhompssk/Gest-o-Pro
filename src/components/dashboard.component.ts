import { Component, inject, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe, PercentPipe } from '@angular/common';
import { StoreService, Transaction } from '../services/store.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink, DecimalPipe, PercentPipe],
  template: `
    <div class="space-y-8 animate-fade-in pb-12">
      <!-- Header with Action Bar -->
      <header class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 class="text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
             <span class="bg-gradient-to-r from-brand-600 to-emerald-500 bg-clip-text text-transparent">
               {{ greeting() }}, {{ store.currentUser().name.split(' ')[0] }}
             </span>
             <span class="text-3xl animate-wave origin-bottom-right">👋</span>
          </h1>
          <p class="text-lg text-gray-500 dark:text-gray-400 mt-2 font-medium">{{ store.dict().dashboard.subtitle }}</p>
        </div>
        <div class="flex gap-4">
          <button (click)="openNewTransaction()" class="px-6 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl text-sm font-bold hover:opacity-90 transition shadow-xl shadow-gray-900/20 dark:shadow-white/10 active:scale-95 flex items-center gap-2 group">
            <span class="material-symbols-rounded text-xl group-hover:rotate-90 transition-transform">add</span>
            {{ store.dict().common.add }}
          </button>
          <button routerLink="/advisor" class="px-5 py-3.5 bg-white dark:bg-dark-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white rounded-2xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm flex items-center gap-2 group">
            <span class="material-symbols-rounded text-xl text-brand-500 group-hover:scale-110 transition-transform">auto_awesome</span>
            <span class="hidden sm:inline">{{ store.dict().dashboard.aiButton }}</span>
          </button>
        </div>
      </header>

      <!-- BENTO GRID LAYOUT -->
      <!-- Top Section: Hero Balance & Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Hero Card: Total Balance & Flow -->
        <div class="lg:col-span-8 relative overflow-hidden p-8 bg-gray-900 dark:bg-black rounded-[2.5rem] shadow-2xl text-white group ring-1 ring-white/10 flex flex-col justify-between min-h-[340px] hover:shadow-gray-900/40 dark:hover:shadow-black/60 transition-shadow duration-500">
          <!-- Dynamic Background -->
          <div class="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black opacity-90"></div>
          <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          
          <div class="relative z-10 flex justify-between items-start mb-8">
            <div class="flex items-center gap-3">
               <div class="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/5 shadow-inner">
                 <span class="material-symbols-rounded text-2xl text-brand-300">account_balance_wallet</span>
               </div>
               <span class="text-gray-400 font-bold tracking-wide uppercase text-xs">{{ store.dict().dashboard.cards.balance }}</span>
            </div>
            
            <div [class]="'flex items-center px-4 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md ' + (store.financialTrend() >= 0 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30')">
                <span class="material-symbols-rounded text-base mr-1.5">{{ store.financialTrend() >= 0 ? 'trending_up' : 'trending_down' }}</span>
                {{ store.financialTrend() | number:'1.1-1' }}%
            </div>
          </div>
          
          <div class="relative z-10">
            <h3 class="text-6xl md:text-7xl font-black tracking-tight text-white mb-10">{{ store.totalBalance() | currency:store.currencyCode():'symbol':'1.2-2':store.localeCode() }}</h3>
            
            <!-- Flow Visualization -->
            <div class="grid grid-cols-2 gap-4">
               <div>
                  <p class="text-xs font-bold text-emerald-400 uppercase mb-1 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Entradas</p>
                  <div class="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                     <div class="h-full bg-emerald-500 rounded-full" style="width: 100%"></div>
                  </div>
                  <p class="text-lg font-bold text-white mt-1">{{ store.monthlyIncome() | currency:store.currencyCode():'symbol':'1.0-0' }}</p>
               </div>
               <div>
                  <p class="text-xs font-bold text-red-400 uppercase mb-1 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-red-400"></span> Saídas</p>
                  <div class="h-2 w-full bg-white/10 rounded-full overflow-hidden relative">
                     <!-- Percentage bar relative to income if income > 0, else 100% if expenses exist -->
                     <div class="h-full bg-red-500 rounded-full transition-all duration-1000" [style.width.%]="store.monthlyIncome() > 0 ? Math.min((store.monthlyExpenses() / store.monthlyIncome()) * 100, 100) : (store.monthlyExpenses() > 0 ? 100 : 0)"></div>
                  </div>
                  <p class="text-lg font-bold text-white mt-1">{{ store.monthlyExpenses() | currency:store.currencyCode():'symbol':'1.0-0' }}</p>
               </div>
            </div>
          </div>
        </div>

        <!-- Vertical Stack: Quick Action Cards (Occupies 4/12) -->
        <div class="lg:col-span-4 flex flex-col gap-6">
           
           <!-- Income Action Card -->
           <div class="flex-1 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-[2.5rem] p-6 border border-emerald-100 dark:border-emerald-800/30 shadow-sm relative overflow-hidden group hover:border-emerald-200 dark:hover:border-emerald-700 transition flex flex-col justify-between hover:shadow-lg hover:shadow-emerald-500/5">
              <div class="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                 <span class="material-symbols-rounded text-8xl text-emerald-600">arrow_upward</span>
              </div>
              <div class="relative z-10">
                 <div class="flex items-center gap-3 mb-2">
                    <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                       <span class="material-symbols-rounded text-xl">arrow_upward</span>
                    </div>
                    <p class="text-xs font-bold text-emerald-800 dark:text-emerald-200 uppercase tracking-wide">{{ store.dict().dashboard.cards.income }}</p>
                 </div>
                 <h3 class="text-3xl font-black text-gray-900 dark:text-white mt-1">{{ store.monthlyIncome() | currency:store.currencyCode():'symbol':'1.2-2':store.localeCode() }}</h3>
              </div>
              <button (click)="openNewTransaction('income')" class="mt-4 w-full py-3 bg-white dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-200 text-sm font-bold rounded-xl border border-emerald-100 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-800/50 transition flex items-center justify-center gap-2 shadow-sm group-hover:shadow-md">
                 <span class="material-symbols-rounded text-lg">add_circle</span>
                 {{ store.dict().dashboard.quickActions.addIncome }}
              </button>
           </div>

           <!-- Expense Action Card -->
           <div class="flex-1 bg-red-50/50 dark:bg-red-900/10 rounded-[2.5rem] p-6 border border-red-100 dark:border-red-800/30 shadow-sm relative overflow-hidden group hover:border-red-200 dark:hover:border-red-700 transition flex flex-col justify-between hover:shadow-lg hover:shadow-red-500/5">
              <div class="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                 <span class="material-symbols-rounded text-8xl text-red-600">arrow_downward</span>
              </div>
              <div class="relative z-10">
                 <div class="flex items-center gap-3 mb-2">
                    <div class="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center">
                       <span class="material-symbols-rounded text-xl">arrow_downward</span>
                    </div>
                    <p class="text-xs font-bold text-red-800 dark:text-red-200 uppercase tracking-wide">{{ store.dict().dashboard.cards.expenses }}</p>
                 </div>
                 <h3 class="text-3xl font-black text-gray-900 dark:text-white mt-1">{{ store.monthlyExpenses() | currency:store.currencyCode():'symbol':'1.2-2':store.localeCode() }}</h3>
              </div>
              <button (click)="openNewTransaction('expense')" class="mt-4 w-full py-3 bg-white dark:bg-red-900/40 text-red-700 dark:text-red-200 text-sm font-bold rounded-xl border border-red-100 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-800/50 transition flex items-center justify-center gap-2 shadow-sm group-hover:shadow-md">
                 <span class="material-symbols-rounded text-lg">remove_circle</span>
                 {{ store.dict().dashboard.quickActions.addExpense }}
              </button>
           </div>

        </div>
      </div>

      <!-- Middle Section: Savings, Daily Avg & Budget Status -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
         
         <!-- Savings Rate (Expanded) -->
         <div class="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 rounded-[2.5rem] p-8 flex flex-col justify-center relative overflow-hidden group hover:border-indigo-200 transition">
            <div class="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
               <span class="material-symbols-rounded text-9xl text-indigo-500">savings</span>
            </div>
            <div class="relative z-10">
               <div class="flex items-center gap-3 mb-4">
                  <div class="p-2.5 bg-indigo-100 dark:bg-indigo-800/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                     <span class="material-symbols-rounded text-2xl">savings</span>
                  </div>
                  <h4 class="font-bold text-gray-900 dark:text-white text-lg">{{ store.dict().dashboard.cards.savingsRate }}</h4>
               </div>
               
               <div class="flex items-end gap-2 mt-auto">
                  <span class="text-5xl font-black text-indigo-900 dark:text-white">{{ store.savingsRate() | number:'1.0-1' }}%</span>
                  <span class="text-sm font-bold text-indigo-500 dark:text-indigo-400 mb-2">economizados</span>
               </div>
               <div class="w-full h-3 bg-indigo-200 dark:bg-indigo-800/50 rounded-full mt-5 overflow-hidden">
                  <div class="h-full bg-indigo-500 rounded-full transition-all duration-1000" [style.width.%]="store.savingsRate()"></div>
               </div>
            </div>
         </div>

         <!-- Daily Average Spending (New Widget) -->
         <div class="bg-white dark:bg-dark-800 border border-gray-100 dark:border-gray-700 rounded-[2.5rem] p-8 flex flex-col justify-center relative overflow-hidden group hover:border-gray-200 dark:hover:border-gray-600 transition shadow-sm">
            <div class="flex items-center gap-3 mb-4">
               <div class="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                  <span class="material-symbols-rounded text-2xl">speed</span>
               </div>
               <h4 class="font-bold text-gray-900 dark:text-white text-lg">{{ store.dict().dashboard.cards.dailyAvg }}</h4>
            </div>

            <div class="mt-auto">
               <span class="text-4xl font-black text-gray-900 dark:text-white block mb-1">
                  {{ store.dailyAverage() | currency:store.currencyCode():'symbol':'1.0-0' }}
               </span>
               <p class="text-xs font-medium text-gray-500 dark:text-gray-400">por dia este mês</p>

               <div class="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700">
                  <div class="flex justify-between items-center mb-1">
                     <span class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{{ store.dict().dashboard.cards.projected }}</span>
                     <span class="text-sm font-bold text-gray-900 dark:text-white">{{ (store.dailyAverage() * 30) | currency:store.currencyCode():'symbol':'1.0-0' }}</span>
                  </div>
                  <div class="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <!-- Simple projection bar visual -->
                      <div class="h-full bg-blue-500 rounded-full opacity-50" style="width: 70%"></div>
                  </div>
               </div>
            </div>
         </div>

         <!-- Budget Insight (Refined) -->
         @if (highestBudgetRisk(); as risk) {
            <div class="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-[2.5rem] p-8 flex flex-col justify-center cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/20 transition group" routerLink="/budgets">
               <div class="flex items-center gap-3 mb-4">
                  <div class="p-2.5 bg-amber-100 dark:bg-amber-800/40 rounded-xl text-amber-600 dark:text-amber-400 group-hover:scale-110 transition">
                     <span class="material-symbols-rounded text-2xl">warning</span>
                  </div>
                  <h4 class="font-bold text-gray-900 dark:text-white text-lg">{{ store.dict().dashboard.budgetAlert }}</h4>
               </div>
               <div class="mt-auto">
                   <p class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {{ risk.percentage | number:'1.0-0' }}% <span class="text-sm font-medium text-gray-500">usado</span>
                   </p>
                   <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                      Sua categoria <b>{{ risk.categoryId }}</b> está chegando no limite.
                   </p>
                   <div class="w-full bg-amber-200 dark:bg-amber-800/50 rounded-full h-3">
                      <div class="bg-amber-500 h-3 rounded-full" [style.width.%]="Math.min(risk.percentage, 100)"></div>
                   </div>
               </div>
            </div>
         } @else {
            <div class="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-[2.5rem] p-8 flex flex-col justify-center hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition cursor-default">
               <div class="flex items-center gap-3 mb-4">
                  <div class="p-2.5 bg-emerald-100 dark:bg-emerald-800/40 rounded-xl text-emerald-600 dark:text-emerald-400">
                     <span class="material-symbols-rounded text-2xl">thumb_up</span>
                  </div>
                  <h4 class="font-bold text-gray-900 dark:text-white text-lg">Orçamento em dia</h4>
               </div>
               <div class="mt-auto">
                   <p class="text-3xl font-black text-emerald-700 dark:text-emerald-400 mb-2">100%</p>
                   <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      Você está no controle! Todos os gastos estão dentro dos limites planejados.
                   </p>
               </div>
            </div>
         }
      </div>

      <!-- Bottom Section: Recent & Goals -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Recent Transactions -->
        <div class="lg:col-span-2 bg-white dark:bg-dark-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
          <div class="p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 class="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-3">
               <span class="material-symbols-rounded text-gray-400">history</span>
               {{ store.dict().dashboard.recent }}
            </h2>
            <a routerLink="/transactions" class="text-sm font-bold text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 px-4 py-2 rounded-xl transition">{{ store.dict().dashboard.viewAll }}</a>
          </div>
          
          <div class="flex-1 divide-y divide-gray-100 dark:divide-gray-700">
            @for (t of recentTransactions(); track t.id) {
              <div class="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30 transition group cursor-pointer" (click)="edit(t)">
                <div class="flex items-center gap-5">
                  <div [class]="'w-12 h-12 flex items-center justify-center rounded-2xl transition-transform group-hover:scale-105 ' + (t.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300')">
                    <span class="material-symbols-rounded text-xl">{{ getIcon(t.category) }}</span>
                  </div>
                  <div>
                    <p class="font-bold text-sm text-gray-900 dark:text-white mb-0.5 group-hover:text-brand-600 transition">{{ t.description }}</p>
                    <span class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ t.category }} • {{ t.date | date:'dd MMM' }}</span>
                  </div>
                </div>
                <div class="text-right">
                   <p [class]="'font-bold text-base ' + (t.type === 'income' ? 'text-emerald-600' : 'text-gray-900 dark:text-white')">
                      {{ t.type === 'income' ? '+' : '-' }}{{ t.amount | currency:store.currencyCode():'symbol':'1.2-2':store.localeCode() }}
                   </p>
                </div>
              </div>
            } @empty {
               <div class="p-12 text-center text-gray-400 text-sm">
                  {{ store.dict().transactions.empty }}
               </div>
            }
          </div>
        </div>

        <!-- Goals Widget (Polished) -->
        <div class="lg:col-span-1 bg-white dark:bg-dark-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
           <div class="p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
             <h2 class="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-3">
                <span class="material-symbols-rounded text-gray-400">flag</span>
                {{ store.dict().dashboard.goals }}
             </h2>
             <button (click)="store.openGoalModal()" class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-brand-500 hover:text-white transition">
                <span class="material-symbols-rounded text-lg">add</span>
             </button>
           </div>
           
           <div class="p-6 space-y-6 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar">
              @for (goal of store.goals(); track goal.id) {
                 <div (click)="store.openGoalModal(goal)" class="group cursor-pointer">
                    <div class="flex justify-between items-start mb-2">
                       <div class="flex items-center gap-3">
                          <div [class]="'w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-110 ' + goal.color">
                             <span class="material-symbols-rounded text-xl">{{ goal.icon }}</span>
                          </div>
                          <div>
                             <p class="text-sm font-bold text-gray-900 dark:text-white leading-tight group-hover:text-brand-600 transition">{{ goal.name }}</p>
                             <p class="text-xs text-gray-500 mt-1">
                                Falta {{ (goal.targetAmount - goal.currentAmount) | currency:store.currencyCode():'symbol':'1.0-0':store.localeCode() }}
                             </p>
                          </div>
                       </div>
                       <span class="text-xs font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2.5 py-1.5 rounded-lg">{{ (goal.currentAmount / goal.targetAmount) * 100 | number:'1.0-0' }}%</span>
                    </div>
                    <div class="h-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                       <div [class]="'h-full rounded-full transition-all duration-1000 ease-out ' + goal.color" [style.width.%]="(goal.currentAmount / goal.targetAmount) * 100"></div>
                    </div>
                 </div>
              } @empty {
                 <div class="flex flex-col items-center justify-center h-32 text-gray-400 text-center">
                    <div class="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-full">
                       <span class="material-symbols-rounded text-3xl opacity-50">flag</span>
                    </div>
                    <p class="text-sm font-medium mb-3">Nenhum objetivo definido</p>
                    <button (click)="store.openGoalModal()" class="text-xs font-bold text-brand-600 bg-brand-50 dark:bg-brand-900/30 px-4 py-2 rounded-lg">Criar Objetivo</button>
                 </div>
              }
           </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    @keyframes wave {
      0% { transform: rotate(0deg); }
      20% { transform: rotate(14deg); }
      40% { transform: rotate(-8deg); }
      60% { transform: rotate(14deg); }
      80% { transform: rotate(-4deg); }
      100% { transform: rotate(0deg); }
    }
    .animate-wave { animation: wave 1.5s infinite; transform-origin: 70% 70%; display: inline-block; }
  `]
})
export class DashboardComponent {
  store = inject(StoreService);
  Math = Math;

  recentTransactions = computed(() => this.store.transactions().slice(0, 5));
  
  greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  });

  // Compute the highest budget risk for display
  highestBudgetRisk = computed(() => {
    const transactions = this.store.transactions();
    const budgets = this.store.budgets();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calculate spending per category
    const spendingMap = new Map<string, number>();
    transactions.forEach(t => {
      const d = new Date(t.date);
      if (t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        spendingMap.set(t.category, (spendingMap.get(t.category) || 0) + t.amount);
      }
    });

    let maxRisk = null;
    let maxPercentage = 0;

    for (const budget of budgets) {
      if (budget.limit > 0) {
        const spent = spendingMap.get(budget.categoryId) || 0;
        const percentage = (spent / budget.limit) * 100;
        
        if (percentage > 80 && percentage > maxPercentage) {
          maxPercentage = percentage;
          maxRisk = { categoryId: budget.categoryId, percentage };
        }
      }
    }

    return maxRisk;
  });

  getIcon(category: string): string {
    const cat = this.store.categories().find(c => c.id === category);
    return cat ? cat.icon : 'receipt';
  }

  edit(t: Transaction) {
    this.store.openModal(t);
  }

  // New helper for quick actions
  openNewTransaction(type?: 'income' | 'expense') {
     if (type) {
        this.store.openModal({ type });
     } else {
        this.store.openModal();
     }
  }
}