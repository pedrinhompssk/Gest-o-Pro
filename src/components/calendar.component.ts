import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <div class="space-y-6 animate-fade-in pb-8">
      <header>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ store.dict().calendar.title }}</h1>
        <p class="text-gray-500 dark:text-gray-400">{{ store.dict().calendar.subtitle }}</p>
      </header>

      <div class="bg-white dark:bg-dark-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 overflow-hidden">
        
        <!-- Calendar Header & Navigation -->
        <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          
          <div class="flex items-center gap-2 bg-gray-50 dark:bg-dark-900/50 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-700">
             <button (click)="changeMonth(-1)" class="p-2 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm rounded-xl transition text-gray-600 dark:text-gray-300">
               <span class="material-symbols-rounded">chevron_left</span>
             </button>
             <h2 class="text-base font-bold text-gray-900 dark:text-white capitalize min-w-[160px] text-center select-none">
               {{ currentMonthName() }} {{ currentYear() }}
             </h2>
             <button (click)="changeMonth(1)" class="p-2 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm rounded-xl transition text-gray-600 dark:text-gray-300">
               <span class="material-symbols-rounded">chevron_right</span>
             </button>
          </div>

          <button (click)="goToToday()" class="px-4 py-2 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 rounded-xl text-sm font-bold hover:bg-brand-100 dark:hover:bg-brand-900/50 transition border border-brand-200 dark:border-brand-800">
            {{ store.dict().calendar.today }}
          </button>
        </div>

        <!-- Days Header -->
        <div class="grid grid-cols-7 gap-1 mb-2 text-center">
          @for(day of weekDays; track day) {
            <div class="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider py-2">
              {{ day }}
            </div>
          }
        </div>

        <!-- Days Grid -->
        <div class="grid grid-cols-7 gap-1 md:gap-2">
          <!-- Empty cells for start offset -->
          @for(empty of emptyStartDays(); track $index) {
            <div class="h-20 md:h-28 lg:h-32 bg-gray-50/30 dark:bg-gray-800/20 rounded-xl border border-dashed border-gray-100 dark:border-gray-800"></div>
          }

          <!-- Actual Days -->
          @for(day of monthDays(); track day.date) {
            <div [class]="'relative h-20 md:h-28 lg:h-32 rounded-xl transition-all duration-200 p-1.5 md:p-2 flex flex-col justify-between group overflow-hidden border ' + 
               (isToday(day.date) 
                 ? 'bg-brand-50/50 dark:bg-brand-900/10 border-brand-200 dark:border-brand-800 ring-1 ring-brand-500' 
                 : 'bg-white dark:bg-gray-700/20 border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md')">
              
              <span [class]="'text-xs md:text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ' + 
                 (isToday(day.date) ? 'bg-brand-500 text-white shadow-sm' : 'text-gray-700 dark:text-gray-300')">
                {{ day.dayNumber }}
              </span>

              @if (day.totalExpense > 0 || day.totalIncome > 0) {
                 <div class="flex flex-col items-end animate-fade-in space-y-0.5">
                    <!-- Mobile View: Just dots -->
                    <div class="md:hidden flex gap-1">
                       @if (day.totalIncome > 0) { <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> }
                       @if (day.totalExpense > 0) { <div class="w-1.5 h-1.5 rounded-full bg-red-500"></div> }
                    </div>

                    <!-- Desktop View: Values -->
                    <div class="hidden md:flex flex-col items-end w-full">
                       @if (day.totalExpense > 0) {
                        <span class="font-bold text-red-600 dark:text-red-400 text-[10px] lg:text-xs bg-red-50 dark:bg-red-900/30 px-1.5 py-0.5 rounded-md truncate max-w-full">
                          -{{ day.totalExpense | currency:store.currencyCode():'symbol':'1.0-0':store.localeCode() }}
                        </span>
                      }
                      @if (day.totalIncome > 0) {
                         <span class="font-bold text-emerald-600 dark:text-emerald-400 text-[10px] lg:text-xs bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-md truncate max-w-full mt-0.5">
                          +{{ day.totalIncome | currency:store.currencyCode():'symbol':'1.0-0':store.localeCode() }}
                        </span>
                      }
                    </div>
                 </div>
                 
                 <!-- Visual Density Bars (Bottom) -->
                 <div class="flex gap-1 absolute bottom-1 left-2 right-2 h-1 opacity-60">
                    @if(day.totalExpense > 0) {
                       <div class="bg-red-500 h-full rounded-full flex-1" [style.flex-grow]="day.totalExpense"></div>
                    }
                    @if(day.totalIncome > 0) {
                       <div class="bg-emerald-500 h-full rounded-full flex-1" [style.flex-grow]="day.totalIncome"></div>
                    }
                 </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class CalendarComponent {
  store = inject(StoreService);
  Math = Math;
  
  weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

  // State
  currentDate = signal(new Date());
  
  currentYear = computed(() => this.currentDate().getFullYear());
  
  currentMonthName = computed(() => {
    return this.currentDate().toLocaleString(this.store.language() === 'pt' ? 'pt-BR' : 'en-US', { month: 'long' });
  });

  emptyStartDays = computed(() => {
    const y = this.currentDate().getFullYear();
    const m = this.currentDate().getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    return Array(firstDay).fill(0);
  });

  monthDays = computed(() => {
    const y = this.currentDate().getFullYear();
    const m = this.currentDate().getMonth();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    
    const dailyMap = new Map<string, {expense: number, income: number}>();
    const prefix = `${y}-${String(m + 1).padStart(2, '0')}`;
    
    this.store.transactions().forEach(t => {
      if (t.date.startsWith(prefix)) {
        const dayStats = dailyMap.get(t.date) || { expense: 0, income: 0 };
        if (t.type === 'expense') dayStats.expense += t.amount;
        else dayStats.income += t.amount;
        dailyMap.set(t.date, dayStats);
      }
    });

    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${prefix}-${String(i).padStart(2, '0')}`;
      const stats = dailyMap.get(dateStr) || { expense: 0, income: 0 };

      days.push({
        date: dateStr,
        dayNumber: i,
        totalExpense: stats.expense,
        totalIncome: stats.income
      });
    }
    return days;
  });

  changeMonth(delta: number) {
    this.currentDate.update(d => {
      const newDate = new Date(d);
      newDate.setMonth(d.getMonth() + delta);
      return newDate;
    });
  }

  goToToday() {
    this.currentDate.set(new Date());
  }

  isToday(dateStr: string): boolean {
    // Correctly handle timezone offset for "Today" calculation
    const d = new Date();
    // Simple ISO string usually works, but to be robust against TZ issues in some browsers:
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return dateStr === `${year}-${month}-${day}`;
  }
}