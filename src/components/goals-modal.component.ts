import { Component, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-goals-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (store.isGoalModalOpen()) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" (click)="close()"></div>
        
        <!-- Modal -->
        <div class="relative w-full max-w-md bg-white dark:bg-dark-800 rounded-3xl shadow-2xl overflow-hidden transform transition-all animate-scale-in">
          
          <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-dark-800">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              {{ isEditing ? store.dict().goalModal.titleEdit : store.dict().goalModal.title }}
            </h3>
            <button (click)="close()" class="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white transition">
              <span class="material-symbols-rounded text-lg">close</span>
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" class="p-6 space-y-5 bg-white dark:bg-dark-800">
            
            <!-- Name -->
            <div>
               <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{{ store.dict().goalModal.name }}</label>
               <input formControlName="name" type="text" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white transition">
            </div>

            <div class="grid grid-cols-2 gap-4">
               <!-- Target -->
               <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{{ store.dict().goalModal.target }}</label>
                  <div class="relative">
                     <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">{{ store.currencyCode() }}</span>
                     <input formControlName="targetAmount" type="number" class="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white transition font-bold">
                  </div>
               </div>

               <!-- Current -->
               <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{{ store.dict().goalModal.current }}</label>
                  <div class="relative">
                     <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">{{ store.currencyCode() }}</span>
                     <input formControlName="currentAmount" type="number" class="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white transition font-bold">
                  </div>
               </div>
            </div>

            <!-- Icon & Color -->
            <div class="grid grid-cols-2 gap-4">
               <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{{ store.dict().goalModal.icon }}</label>
                  <div class="relative">
                     <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 material-symbols-rounded text-lg">{{ form.get('icon')?.value }}</span>
                     <select formControlName="icon" class="w-full pl-10 pr-8 py-3 bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white transition appearance-none cursor-pointer">
                        <option value="flight">Flight</option>
                        <option value="savings">Savings</option>
                        <option value="directions_car">Car</option>
                        <option value="home">Home</option>
                        <option value="school">School</option>
                        <option value="laptop">Tech</option>
                        <option value="star">Star</option>
                     </select>
                     <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-rounded pointer-events-none">expand_more</span>
                  </div>
               </div>

               <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{{ store.dict().goalModal.color }}</label>
                   <div class="relative">
                     <div class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full" [class]="form.get('color')?.value"></div>
                     <select formControlName="color" class="w-full pl-10 pr-8 py-3 bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white transition appearance-none cursor-pointer">
                        <option value="bg-blue-500">Blue</option>
                        <option value="bg-emerald-500">Emerald</option>
                        <option value="bg-purple-500">Purple</option>
                        <option value="bg-red-500">Red</option>
                        <option value="bg-amber-500">Amber</option>
                        <option value="bg-pink-500">Pink</option>
                        <option value="bg-indigo-500">Indigo</option>
                     </select>
                     <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-rounded pointer-events-none">expand_more</span>
                  </div>
               </div>
            </div>

            <div class="pt-4 flex gap-4">
               @if(isEditing) {
                  <button type="button" (click)="delete()" class="px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition flex items-center justify-center">
                     <span class="material-symbols-rounded">delete</span>
                  </button>
               }
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
  `]
})
export class GoalsModalComponent {
  store = inject(StoreService);
  isEditing = false;
  editingId: string | null = null;

  form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    targetAmount: new FormControl(0, [Validators.required, Validators.min(1)]),
    currentAmount: new FormControl(0, [Validators.required, Validators.min(0)]),
    icon: new FormControl('star'),
    color: new FormControl('bg-blue-500')
  });

  constructor() {
    effect(() => {
      const goal = this.store.goalToEdit();
      if (goal) {
        this.isEditing = true;
        this.editingId = goal.id;
        this.form.patchValue({
          name: goal.name,
          targetAmount: goal.targetAmount,
          currentAmount: goal.currentAmount,
          icon: goal.icon,
          color: goal.color
        });
      } else {
        this.isEditing = false;
        this.editingId = null;
        this.form.reset({
          name: '',
          targetAmount: 1000,
          currentAmount: 0,
          icon: 'star',
          color: 'bg-blue-500'
        });
      }
    });
  }

  close() {
    this.store.closeGoalModal();
  }

  submit() {
    if (this.form.valid) {
      const val = this.form.value;
      const gData: any = {
         name: val.name!,
         targetAmount: val.targetAmount!,
         currentAmount: val.currentAmount!,
         icon: val.icon!,
         color: val.color!
      };

      if (this.isEditing && this.editingId) {
        this.store.updateGoal({ ...gData, id: this.editingId });
      } else {
        this.store.addGoal(gData);
      }
      this.close();
    }
  }

  delete() {
    if (this.editingId && confirm('Apagar este objetivo?')) {
      this.store.deleteGoal(this.editingId);
      this.close();
    }
  }
}