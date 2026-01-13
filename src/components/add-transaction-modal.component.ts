import { Component, inject, effect, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, PercentPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StoreService, Transaction } from '../services/store.service';

@Component({
  selector: 'app-add-transaction-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, PercentPipe],
  template: `
    @if (store.isModalOpen()) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" (click)="close()"></div>
        
        <!-- Modal -->
        <div class="relative w-full max-w-lg bg-white dark:bg-dark-800 rounded-3xl shadow-2xl overflow-hidden transform transition-all animate-scale-in flex flex-col max-h-[90vh]">
          
          <div class="px-8 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-dark-800">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              {{ isEditing ? store.dict().modal.titleEdit : store.dict().modal.title }}
            </h3>
            <button (click)="close()" class="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white transition">
              <span class="material-symbols-rounded text-lg">close</span>
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" class="p-8 space-y-6 overflow-y-auto custom-scrollbar bg-white dark:bg-dark-800">
            
            <!-- Type Selector (Pill Design) -->
            <div class="flex p-1.5 bg-gray-100 dark:bg-gray-700/50 rounded-2xl">
              <button type="button" (click)="setType('expense')" 
                [class]="'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all duration-200 ' + (transactionType === 'expense' ? 'bg-white dark:bg-dark-800 text-red-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700')">
                <span class="material-symbols-rounded text-lg">trending_down</span>
                {{ store.dict().modal.types.expense }}
              </button>
              <button type="button" (click)="setType('income')" 
                [class]="'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all duration-200 ' + (transactionType === 'income' ? 'bg-white dark:bg-dark-800 text-green-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700')">
                <span class="material-symbols-rounded text-lg">trending_up</span>
                {{ store.dict().modal.types.income }}
              </button>
            </div>

            <!-- Amount Display (Big) -->
            <div class="relative group">
               <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{{ store.dict().modal.amount }}</label>
               <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-2xl group-focus-within:text-brand-500 transition-colors">{{ store.currencyCode() }}</span>
                  <input formControlName="amount" type="number" step="0.01" class="w-full pl-16 pr-4 py-4 bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-3xl font-bold text-gray-900 dark:text-white transition placeholder-gray-300">
               </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
               <!-- Description -->
               <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{{ store.dict().modal.description }}</label>
                  <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-rounded text-lg">edit</span>
                    <input formControlName="description" type="text" class="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-gray-900 dark:text-white transition">
                  </div>
               </div>

               <!-- Date -->
               <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{{ store.dict().modal.date }}</label>
                  <div class="relative">
                     <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-rounded text-lg">calendar_today</span>
                     <input formControlName="date" type="date" class="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-gray-900 dark:text-white transition">
                  </div>
               </div>
            </div>

            <!-- Visual Category Grid -->
            <div>
              <div class="flex justify-between items-end mb-3">
                 <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ store.dict().modal.category }}</label>
                 
                 <!-- Budget Feedback -->
                 @if (transactionType === 'expense' && selectedCategoryBudget(); as budget) {
                   <div class="text-[10px] text-right animate-fade-in">
                      <span class="text-gray-500">{{ store.dict().modal.budgetStatus }}: </span>
                      <span [class]="'font-bold ' + (budget.percentage > 90 ? 'text-red-500' : 'text-emerald-500')">
                         {{ budget.spent | currency:store.currencyCode():'symbol':'1.0-0' }} / {{ budget.limit | currency:store.currencyCode():'symbol':'1.0-0' }}
                      </span>
                      <div class="w-24 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 ml-auto overflow-hidden">
                         <div [class]="'h-full rounded-full ' + (budget.percentage > 90 ? 'bg-red-500' : 'bg-emerald-500')" [style.width.%]="Math.min(budget.percentage, 100)"></div>
                      </div>
                   </div>
                 }
              </div>

              <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
                 @for (cat of store.categories(); track cat.id) {
                    <button type="button" 
                       (click)="selectCategory(cat.id)"
                       [class]="'flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ' + 
                       (selectedCategoryId() === cat.id 
                          ? 'bg-brand-50 dark:bg-brand-900/30 border-brand-500 dark:border-brand-500 ring-1 ring-brand-500' 
                          : 'bg-white dark:bg-gray-700/30 border-gray-200 dark:border-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700')">
                       
                       <div [class]="'w-8 h-8 rounded-full flex items-center justify-center mb-1.5 ' + (cat.color ? cat.color : 'bg-gray-100 text-gray-600')">
                          <span class="material-symbols-rounded text-lg">{{ cat.icon }}</span>
                       </div>
                       <span class="text-[10px] font-bold text-center leading-tight truncate w-full text-gray-700 dark:text-gray-300">{{ cat.id }}</span>
                    </button>
                 }
              </div>
            </div>

            <!-- Payment Details (Expense Only) -->
             @if (transactionType === 'expense') {
              <div class="pt-4 border-t border-gray-100 dark:border-gray-700 animate-fade-in space-y-4">
                
                <!-- Payment Method Pills -->
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{{ store.dict().modal.paymentMethod }}</label>
                  <div class="flex flex-wrap gap-2">
                     <button type="button" 
                       (click)="setPaymentMethod('cash')"
                       [class]="'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ' + 
                       (form.get('paymentMethod')?.value === 'cash' 
                         ? 'bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' 
                         : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50')">
                       <span class="material-symbols-rounded text-lg">payments</span>
                       {{ store.dict().modal.methods.cash }}
                     </button>
                     
                     <button type="button" 
                       (click)="setPaymentMethod('card')"
                       [class]="'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ' + 
                       (form.get('paymentMethod')?.value === 'card' 
                         ? 'bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' 
                         : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50')">
                       <span class="material-symbols-rounded text-lg">credit_card</span>
                       {{ store.dict().modal.methods.card }}
                     </button>
                     
                     <button type="button" 
                       (click)="setPaymentMethod('transfer')"
                       [class]="'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ' + 
                       (form.get('paymentMethod')?.value === 'transfer' 
                         ? 'bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' 
                         : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50')">
                       <span class="material-symbols-rounded text-lg">account_balance</span>
                       {{ store.dict().modal.methods.transfer }}
                     </button>
                  </div>
                </div>

                @if (form.get('paymentMethod')?.value === 'card') {
                  <div class="animate-fade-in bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                    <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{{ store.dict().modal.installments }}</label>
                    <div class="relative">
                      <select formControlName="installments" class="w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white transition appearance-none cursor-pointer">
                        <option [value]="1">1x (À vista)</option>
                        <option [value]="2">2x</option>
                        <option [value]="3">3x</option>
                        <option [value]="4">4x</option>
                        <option [value]="5">5x</option>
                        <option [value]="6">6x</option>
                        <option [value]="10">10x</option>
                        <option [value]="12">12x</option>
                      </select>
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-rounded pointer-events-none">expand_more</span>
                    </div>
                  </div>
                }
              </div>
             }

            <div class="pt-2 flex gap-4">
              <button type="button" (click)="close()" class="flex-1 px-4 py-3.5 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                {{ store.dict().common.cancel }}
              </button>
              <button type="submit" [disabled]="form.invalid" class="flex-[2] px-4 py-3.5 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-500 transition shadow-lg shadow-brand-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <span class="material-symbols-rounded">check</span>
                {{ store.dict().common.save }}
              </button>
            </div>

          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes scale-in {
      0% { opacity: 0; transform: scale(0.95) translateY(20px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    .animate-scale-in { animation: scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    .animate-fade-in { animation: fade-in 0.3s ease-out; }
    @keyframes fade-in { 0% { opacity: 0; transform: translateY(-5px); } 100% { opacity: 1; transform: translateY(0); } }
  `]
})
export class AddTransactionModalComponent {
  store = inject(StoreService);
  Math = Math;
  transactionType: 'income' | 'expense' = 'expense';
  isEditing = false;
  editingId: string | null = null;
  selectedCategoryId = signal<string>('Alimentação');

  form = new FormGroup({
    description: new FormControl('', [Validators.required]),
    amount: new FormControl(0, [Validators.required, Validators.min(0.01)]),
    category: new FormControl('Alimentação', [Validators.required]),
    date: new FormControl(new Date().toISOString().split('T')[0], [Validators.required]),
    paymentMethod: new FormControl('cash'),
    installments: new FormControl(1)
  });

  // Calculate Budget Feedback Real-time
  selectedCategoryBudget = computed(() => {
     const catId = this.selectedCategoryId();
     const budget = this.store.budgets().find(b => b.categoryId === catId);
     
     if (!budget || budget.limit <= 0) return null;

     // Calculate spent this month for this category
     const now = new Date();
     const currentMonth = now.getMonth();
     const currentYear = now.getFullYear();
     
     const spent = this.store.transactions()
        .filter(t => t.type === 'expense' && t.category === catId)
        .filter(t => {
           const d = new Date(t.date);
           return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((acc, t) => acc + t.amount, 0);

     return {
        limit: budget.limit,
        spent,
        percentage: (spent / budget.limit) * 100
     };
  });

  constructor() {
    effect(() => {
      const transaction = this.store.transactionToEdit();
      
      if (transaction && transaction.id) {
        // Editing existing transaction
        this.isEditing = true;
        this.editingId = transaction.id;
        this.transactionType = transaction.type || 'expense';
        this.selectedCategoryId.set(transaction.category || 'Alimentação');
        this.form.patchValue({
          description: transaction.description,
          amount: transaction.amount,
          category: transaction.category,
          date: transaction.date,
          paymentMethod: transaction.paymentMethod || 'cash',
          installments: transaction.installments || 1
        });
      } else {
        // New transaction (potentially pre-filled with type)
        this.isEditing = false;
        this.editingId = null;
        this.resetForm();
        if (transaction && transaction.type) {
           this.transactionType = transaction.type;
        }
      }
    });
  }

  setType(type: 'income' | 'expense') {
    this.transactionType = type;
  }
  
  setPaymentMethod(method: string) {
    this.form.patchValue({ paymentMethod: method });
  }

  selectCategory(categoryId: string) {
    this.selectedCategoryId.set(categoryId);
    this.form.patchValue({ category: categoryId });
  }

  close() {
    this.store.closeModal();
  }

  resetForm() {
    this.form.reset({
      description: '',
      amount: 0,
      category: 'Alimentação',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      installments: 1
    });
    this.transactionType = 'expense';
    this.selectedCategoryId.set('Alimentação');
  }

  submit() {
    if (this.form.valid) {
      const val = this.form.value;
      const tData: any = {
        description: val.description!,
        amount: val.amount!,
        category: val.category!,
        date: val.date!,
        type: this.transactionType
      };

      if (this.transactionType === 'expense') {
        tData.paymentMethod = val.paymentMethod;
        if (val.paymentMethod === 'card') {
           tData.installments = val.installments;
        }
      }

      if (this.isEditing && this.editingId) {
        this.store.updateTransaction({
          ...tData,
          id: this.editingId
        });
      } else {
        this.store.addTransaction(tData);
      }
      this.close();
    }
  }
}