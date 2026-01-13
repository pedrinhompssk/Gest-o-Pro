import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-200 dark:from-dark-900 dark:to-black relative overflow-hidden">
      
      <!-- Background Abstract Shapes -->
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div class="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[120px] animate-pulse-slow"></div>
         <div class="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-500/20 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
      </div>

      <div class="w-full max-w-md bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-gray-700/50 overflow-hidden relative z-10 animate-fade-in-up">
        
        <div class="p-8 md:p-12">
          <div class="text-center mb-10">
            <div class="w-16 h-16 bg-gradient-to-br from-brand-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand-500/30 text-white font-bold text-3xl transform rotate-3 hover:rotate-6 transition duration-500">
              F
            </div>
            <h1 class="text-3xl font-black text-gray-900 dark:text-white tracking-tight">FinWise</h1>
            <p class="text-gray-500 dark:text-gray-400 mt-2 font-medium">Controle total das suas finanças.</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
            
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">Email</label>
              <div class="relative group">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors material-symbols-rounded">mail</span>
                <input 
                  formControlName="email"
                  type="email" 
                  placeholder="exemplo@email.com"
                  class="w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition text-gray-900 dark:text-white placeholder-gray-400 shadow-sm"
                >
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex justify-between items-center ml-1">
                <label class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Senha</label>
                <a href="#" (click)="$event.preventDefault()" class="text-xs text-brand-600 hover:text-brand-500 font-bold transition">Esqueceu?</a>
              </div>
              <div class="relative group">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors material-symbols-rounded">lock</span>
                <input 
                  formControlName="password"
                  type="password" 
                  placeholder="••••••••"
                  class="w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition text-gray-900 dark:text-white placeholder-gray-400 shadow-sm"
                >
              </div>
            </div>

            <button 
              type="submit" 
              [disabled]="form.invalid || isLoading()"
              class="w-full py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/30 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-6 flex justify-center items-center gap-2 group"
            >
              @if(isLoading()) {
                <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Entrando...</span>
              } @else {
                <span>Acessar Conta</span>
                <span class="material-symbols-rounded text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
              }
            </button>

          </form>

          <div class="mt-10 text-center pt-6 border-t border-gray-100 dark:border-gray-700/50">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Novo por aqui? 
              <a routerLink="/register" class="font-bold text-brand-600 hover:text-brand-500 transition ml-1">Criar conta grátis</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
    .animate-pulse-slow { animation: pulseSlow 8s infinite; }
    @keyframes pulseSlow { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.1); } }
  `]
})
export class LoginComponent {
  router = inject(Router);
  store = inject(StoreService);
  isLoading = signal(false);

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  submit() {
    if (this.form.valid) {
      this.isLoading.set(true);
      
      // Simulate API Call
      setTimeout(() => {
        const { email } = this.form.value;
        // Mock Login logic
        const name = email?.split('@')[0] || 'Usuário';
        const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
        
        // Update global state
        this.store.currentUser.set({
            name: formattedName,
            email: email!,
            plan: 'Premium'
        });
        
        // Force navigation
        this.router.navigateByUrl('/dashboard').then(success => {
            if (!success) {
                console.error('Navigation to dashboard failed');
                this.isLoading.set(false);
            }
        });
      }, 800);
    }
  }
}
