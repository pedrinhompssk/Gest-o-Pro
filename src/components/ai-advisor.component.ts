import { Component, inject, signal, ElementRef, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';
import { StoreService } from '../services/store.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

@Component({
  selector: 'app-ai-advisor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col h-[calc(100vh-8rem)] animate-fade-in">
      <header class="mb-4">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span class="material-symbols-rounded text-brand-500">auto_awesome</span>
          {{ store.dict().advisor.title }}
        </h1>
        <p class="text-gray-500 dark:text-gray-400">{{ store.dict().advisor.subtitle }}</p>
      </header>

      <div class="flex-1 bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col relative">
        
        <!-- Chat Area -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth" #chatContainer>
          @if (messages().length === 0) {
            <div class="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
              <div class="w-16 h-16 bg-brand-100 dark:bg-brand-900/50 rounded-full flex items-center justify-center mb-4 text-brand-600 shadow-sm">
                <span class="material-symbols-rounded text-3xl">psychology</span>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ store.dict().advisor.greeting }}</h3>
              <p class="text-sm text-gray-500 max-w-md mt-2 leading-relaxed">
                {{ store.dict().advisor.intro }}
              </p>
              <div class="mt-8 flex flex-wrap justify-center gap-3">
                <button (click)="setInput(store.dict().advisor.actions.analyze)" class="px-4 py-2 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-full text-xs font-medium text-gray-700 dark:text-gray-200 transition border border-gray-200 dark:border-gray-600 shadow-sm">
                  {{ store.dict().advisor.actions.analyze }}
                </button>
                <button (click)="setInput(store.dict().advisor.actions.save)" class="px-4 py-2 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-full text-xs font-medium text-gray-700 dark:text-gray-200 transition border border-gray-200 dark:border-gray-600 shadow-sm">
                  {{ store.dict().advisor.actions.save }}
                </button>
              </div>
            </div>
          }

          @for (msg of messages(); track $index) {
            <div [class]="'flex ' + (msg.role === 'user' ? 'justify-end' : 'justify-start') + ' animate-slide-up'">
              <div [class]="'max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ' + 
                (msg.role === 'user' 
                  ? 'bg-brand-600 text-white rounded-br-none' 
                  : 'bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-200 dark:border-gray-600')">
                <div [innerHTML]="formatMessage(msg.content)"></div>
              </div>
            </div>
          }
          
          @if (isLoading()) {
            <div class="flex justify-start animate-fade-in">
              <div class="bg-gray-100 dark:bg-gray-700/50 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2">
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                <span class="text-xs text-gray-500 ml-1">{{ store.dict().advisor.loading }}</span>
              </div>
            </div>
          }
        </div>

        <!-- Input Area -->
        <div class="p-4 bg-white dark:bg-dark-800 border-t border-gray-100 dark:border-gray-700">
          <form (submit)="sendMessage($event)" class="relative max-w-4xl mx-auto">
            <input 
              [(ngModel)]="userInput" 
              name="userInput"
              type="text" 
              [placeholder]="store.dict().advisor.inputPlaceholder" 
              class="w-full pl-5 pr-14 py-4 bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none shadow-sm text-sm transition"
              [disabled]="isLoading()"
              autocomplete="off"
            >
            <button 
              type="submit" 
              [disabled]="!userInput.trim() || isLoading()"
              class="absolute right-2 top-2 bottom-2 aspect-square bg-brand-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-700 transition flex items-center justify-center shadow-md shadow-brand-500/20"
            >
              <span class="material-symbols-rounded text-[20px]">send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    .animate-slide-up { animation: slideUp 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AiAdvisorComponent {
  private geminiService = inject(GeminiService);
  store = inject(StoreService);
  
  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  
  messages = signal<ChatMessage[]>([]);
  userInput = '';
  isLoading = signal(false);

  constructor() {
    // Scroll to bottom whenever messages change
    effect(() => {
      const msgs = this.messages();
      const loading = this.isLoading();
      setTimeout(() => this.scrollToBottom(), 50);
    });
  }

  setInput(text: string) {
    this.userInput = text;
  }

  formatMessage(content: string): string {
    // Simple markdown-like formatter for bold text
    return content.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
  }

  private scrollToBottom(): void {
    if (this.chatContainer) {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    }
  }

  async sendMessage(e?: Event) {
    e?.preventDefault();
    if (!this.userInput.trim() || this.isLoading()) return;

    const query = this.userInput;
    this.userInput = '';
    this.messages.update(m => [...m, { role: 'user', content: query }]);
    this.isLoading.set(true);

    // Prepare Context
    const context = `
      Current Balance: ${this.store.totalBalance()} ${this.store.currencyCode()}.
      Monthly Income: ${this.store.monthlyIncome()} ${this.store.currencyCode()}.
      Monthly Expenses: ${this.store.monthlyExpenses()} ${this.store.currencyCode()}.
      Top Expenses by Category: ${JSON.stringify(this.store.expensesByCategory())}
    `;

    try {
      const response = await this.geminiService.getFinancialAdvice(context, query, this.store.language());
      this.messages.update(m => [...m, { role: 'assistant', content: response }]);
    } catch (err) {
      this.messages.update(m => [...m, { role: 'assistant', content: this.store.dict().advisor.error }]);
    } finally {
      this.isLoading.set(false);
    }
  }
}