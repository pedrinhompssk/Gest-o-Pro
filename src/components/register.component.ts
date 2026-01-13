import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-dark-900 bg-subtle-pattern animate-fade-in relative overflow-hidden">
      
      <!-- Decoration Circles -->
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/10 rounded-full blur-[100px]"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]"></div>

      <div class="w-full max-w-md bg-white dark:bg-dark-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden relative z-10">
        
        <div class="p-8 md:p-10">
          <div class="text-center mb-8">
            <div class="w-14 h-14 bg-gradient-to-br from-brand-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/20 text-white font-bold text-2xl">
              F
            </div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Criar Conta</h1>
            <p class="text-gray-500 dark:text-gray-400 mt-2 text-sm">Comece a controlar suas finanças hoje.</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
            
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">Nome Completo</label>
              <div class="relative group">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors material-symbols-rounded">person</span>
                <input 
                  formControlName="name"
                  type="text" 
                  placeholder="Seu nome"
                  class="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition text-gray-900 dark:text-white placeholder-gray-400"
                >
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">Email</label>
              <div class="relative group">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors material-symbols-rounded">mail</span>
                <input 
                  formControlName="email"
                  type="email" 
                  placeholder="seu@email.com"
                  class="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition text-gray-900 dark:text-white placeholder-gray-400"
                >
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">Senha</label>
              <div class="relative group">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors material-symbols-rounded">lock</span>
                <input 
                  formControlName="password"
                  type="password" 
                  placeholder="••••••••"
                  class="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition text-gray-900 dark:text-white placeholder-gray-400"
                >
              </div>
            </div>

            <button 
              type="submit" 
              [disabled]="form.invalid || isLoading()"
              class="w-full py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-lg shadow-brand-500/30 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex justify-center items-center gap-2"
            >
              @if(isLoading()) {
                <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Criando...</span>
              } @else {
                <span>Criar Conta Grátis</span>
                <span class="material-symbols-rounded text-lg">arrow_forward</span>
              }
            </button>

          </form>

          <div class="mt-8 text-center">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Já tem uma conta? 
              <a routerLink="/login" class="font-bold text-brand-600 hover:text-brand-500 transition">Entrar</a>
            </p>
          </div>
        </div>
        
        <!-- Bottom Decoration -->
        <div class="h-2 w-full bg-gradient-to-r from-brand-400 via-emerald-500 to-teal-500"></div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class RegisterComponent {
  router = inject(Router);
  store = inject(StoreService);
  isLoading = signal(false);

  form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  submit() {
    if (this.form.valid) {
      this.isLoading.set(true);
      
      // Simulate API Call
      setTimeout(() => {
        const { name, email } = this.form.value;
        this.store.registerUser(name!, email!);
        this.router.navigate(['/dashboard']);
        this.isLoading.set(false);
      }, 1500);
    }
  }
}