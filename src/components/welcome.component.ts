import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { StoreService } from '../services/store.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-200 dark:from-dark-900 dark:to-black text-gray-900 dark:text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      <!-- Background Glows -->
      <div class="absolute -top-1/4 left-0 w-full h-full md:w-1/2 md:h-1/2 bg-brand-500/10 rounded-full blur-[150px] pointer-events-none animate-pulse-slow"></div>
      <div class="absolute -bottom-1/4 right-0 w-full h-full md:w-1/2 md:h-1/2 bg-purple-500/10 rounded-full blur-[150px] pointer-events-none animate-pulse-slow delay-1000"></div>

      <main class="relative z-10 text-center flex flex-col items-center animate-fade-in-up">
        
        <div class="w-20 h-20 bg-gradient-to-br from-brand-400 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-brand-500/30 text-white font-bold text-4xl transform rotate-6">
          F
        </div>

        <h1 class="text-5xl md:text-7xl font-black tracking-tighter leading-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-400">
          Inteligência Financeira,<br /> <span class="bg-gradient-to-r from-brand-500 to-emerald-500 bg-clip-text">Simplificada.</span>
        </h1>
        
        <p class="mt-6 max-w-2xl text-lg md:text-xl text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
          Bem-vindo ao FinWise, o seu novo centro de comando financeiro. Visualize gastos, atinja metas e receba insights com o poder da IA.
        </p>

        <div class="mt-12 flex flex-col sm:flex-row items-center gap-4">
          <a routerLink="/register" class="w-full sm:w-auto px-10 py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-lg font-bold rounded-2xl shadow-xl shadow-gray-900/20 dark:shadow-white/10 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3">
            Começar Agora
            <span class="material-symbols-rounded">arrow_forward</span>
          </a>
          <button (click)="loadDemoData()" class="w-full sm:w-auto px-10 py-5 bg-white/50 dark:bg-dark-800/50 backdrop-blur-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white text-lg font-bold rounded-2xl shadow-sm hover:bg-white dark:hover:bg-dark-800 active:scale-95 transition-all">
            Ver Demonstração
          </button>
        </div>
        
        <p class="mt-8 text-sm text-gray-500">
          Já possui uma conta? <a routerLink="/login" class="font-bold text-brand-600 hover:underline">Faça Login</a>
        </p>
      </main>

      <footer class="absolute bottom-6 text-center text-gray-500 dark:text-gray-400 text-xs">
        © {{ currentYear }} FinWise. Todos os direitos reservados.
      </footer>
    </div>
  `,
  styles: [`
    .animate-fade-in-up { 
      animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1); 
    }
    @keyframes fadeInUp { 
      from { opacity: 0; transform: translateY(30px); } 
      to { opacity: 1; transform: translateY(0); } 
    }
    .animate-pulse-slow { 
      animation: pulseSlow 10s infinite; 
    }
    @keyframes pulseSlow { 
      0%, 100% { opacity: 0.8; transform: scale(1); } 
      50% { opacity: 1; transform: scale(1.05); } 
    }
  `]
})
export class WelcomeComponent {
  store = inject(StoreService);
  router = inject(Router);
  currentYear = new Date().getFullYear();

  loadDemoData() {
    this.store.populateWithDemoData();
    this.router.navigate(['/dashboard']);
  }
}
