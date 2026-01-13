import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../services/store.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">
      <header>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <span class="p-2 bg-brand-100 dark:bg-brand-900/20 text-brand-600 rounded-xl">
             <span class="material-symbols-rounded text-3xl">settings</span>
          </span>
          {{ store.dict().settings.title }}
        </h1>
        <p class="text-gray-500 dark:text-gray-400 mt-2 text-lg">{{ store.dict().settings.subtitle }}</p>
      </header>

      <div class="grid grid-cols-1 gap-8">
         
         <!-- Categories Management -->
         <div class="bg-white dark:bg-dark-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm p-8">
            <div class="flex items-center gap-4 mb-8">
               <div class="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <span class="material-symbols-rounded text-2xl">category</span>
               </div>
               <div>
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ store.dict().settings.categories }}</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Personalize as categorias para suas transações</p>
               </div>
            </div>

            <!-- Add Category Form -->
            <div class="bg-gray-50 dark:bg-gray-700/20 rounded-3xl p-6 mb-8 border border-gray-100 dark:border-gray-700">
               <h4 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span class="material-symbols-rounded text-lg text-brand-500">add_circle</span>
                  Nova Categoria
               </h4>
               <div class="flex flex-col md:flex-row gap-5 items-end">
                  <div class="flex-1 w-full space-y-2">
                     <label class="text-xs font-bold text-gray-500 uppercase ml-1">Nome</label>
                     <input type="text" [(ngModel)]="newCatName" placeholder="Ex: Assinaturas" class="w-full px-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-gray-900 dark:text-white transition shadow-sm">
                  </div>
                  
                  <div class="w-full md:w-48 space-y-2">
                     <label class="text-xs font-bold text-gray-500 uppercase ml-1">Ícone</label>
                     <div class="relative">
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-rounded text-gray-500 pointer-events-none">{{ newCatIcon }}</span>
                        <select [(ngModel)]="newCatIcon" class="w-full pl-12 pr-10 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 outline-none appearance-none cursor-pointer text-gray-900 dark:text-white transition shadow-sm">
                           <option value="shopping_cart">Carrinho</option>
                           <option value="restaurant">Comida</option>
                           <option value="home">Casa</option>
                           <option value="directions_car">Carro</option>
                           <option value="movie">Lazer</option>
                           <option value="medical_services">Saúde</option>
                           <option value="school">Escola</option>
                           <option value="shopping_bag">Compras</option>
                           <option value="payments">Dinheiro</option>
                           <option value="trending_up">Investir</option>
                           <option value="pets">Pets</option>
                           <option value="fitness_center">Academia</option>
                           <option value="flight">Viagem</option>
                           <option value="wifi">Wifi</option>
                           <option value="category">Outro</option>
                        </select>
                        <span class="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-rounded text-gray-400 pointer-events-none">expand_more</span>
                     </div>
                  </div>

                  <div class="w-full md:w-48 space-y-2">
                     <label class="text-xs font-bold text-gray-500 uppercase ml-1">Cor</label>
                      <div class="relative">
                        <div class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full pointer-events-none border border-black/10" [class]="newCatColor"></div>
                        <select [(ngModel)]="newCatColor" class="w-full pl-12 pr-10 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 outline-none appearance-none cursor-pointer text-gray-900 dark:text-white transition shadow-sm">
                           <option value="bg-red-100 text-red-600">Vermelho</option>
                           <option value="bg-blue-100 text-blue-600">Azul</option>
                           <option value="bg-green-100 text-green-600">Verde</option>
                           <option value="bg-yellow-100 text-yellow-600">Amarelo</option>
                           <option value="bg-purple-100 text-purple-600">Roxo</option>
                           <option value="bg-pink-100 text-pink-600">Rosa</option>
                           <option value="bg-indigo-100 text-indigo-600">Indigo</option>
                           <option value="bg-orange-100 text-orange-600">Laranja</option>
                           <option value="bg-gray-100 text-gray-600">Cinza</option>
                        </select>
                        <span class="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-rounded text-gray-400 pointer-events-none">expand_more</span>
                     </div>
                  </div>

                  <button (click)="addCategory()" [disabled]="!newCatName.trim()" class="w-full md:w-auto px-8 py-3.5 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-brand-500/20 active:scale-95 flex items-center justify-center gap-2">
                     <span class="material-symbols-rounded">add</span>
                     Adicionar
                  </button>
               </div>
            </div>

            <!-- Categories Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
               @for(cat of store.categories(); track cat.id) {
                  <div class="relative group p-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex flex-col items-center hover:border-gray-300 dark:hover:border-gray-600 transition">
                     <button (click)="store.deleteCategory(cat.id)" class="absolute top-2 right-2 p-1.5 bg-white dark:bg-gray-700 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition shadow-sm" title="Excluir">
                        <span class="material-symbols-rounded text-base">close</span>
                     </button>
                     <div [class]="'w-12 h-12 rounded-full flex items-center justify-center mb-3 ' + cat.color">
                        <span class="material-symbols-rounded text-xl">{{ cat.icon }}</span>
                     </div>
                     <span class="text-sm font-bold text-gray-700 dark:text-gray-300 truncate w-full text-center">{{ cat.id }}</span>
                  </div>
               }
            </div>
         </div>

         <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Data Backup -->
            <div class="bg-white dark:bg-dark-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm p-8 flex flex-col hover:shadow-md transition">
               <div class="flex items-center gap-4 mb-6">
                  <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                     <span class="material-symbols-rounded text-2xl">cloud_download</span>
                  </div>
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ store.dict().settings.data }}</h3>
               </div>
               
               <p class="text-base text-gray-500 dark:text-gray-400 mb-8 leading-relaxed flex-1">
                  Exporte seus dados para um arquivo JSON seguro ou restaure um backup anterior para manter suas informações salvas.
               </p>

               <div class="flex flex-col gap-4 mt-auto">
                  <button (click)="store.exportData()" class="w-full py-4 px-6 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-2xl text-gray-700 dark:text-gray-200 font-bold transition flex items-center justify-center gap-3">
                     <span class="material-symbols-rounded">download</span>
                     {{ store.dict().settings.export }}
                  </button>
                  
                  <div class="relative">
                     <input type="file" #fileInput (change)="onFileSelected($event)" class="hidden" accept=".json">
                     <button (click)="fileInput.click()" class="w-full py-4 px-6 bg-brand-50 dark:bg-brand-900/20 hover:bg-brand-100 dark:hover:bg-brand-900/40 border border-brand-200 dark:border-brand-800 rounded-2xl text-brand-700 dark:text-brand-400 font-bold transition flex items-center justify-center gap-3">
                        <span class="material-symbols-rounded">upload</span>
                        {{ store.dict().settings.import }}
                     </button>
                  </div>
               </div>
            </div>

            <!-- CSV Import -->
            <div class="bg-white dark:bg-dark-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm p-8 flex flex-col hover:shadow-md transition">
               <div class="flex items-center gap-4 mb-6">
                  <div class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                     <span class="material-symbols-rounded text-2xl">table_view</span>
                  </div>
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ store.dict().settings.importCsv }}</h3>
               </div>
               
               <p class="text-base text-gray-500 dark:text-gray-400 mb-8 leading-relaxed flex-1">
                  Importe extratos bancários ou planilhas antigas. Use nosso modelo padrão para garantir a formatação correta dos dados.
               </p>

               <div class="flex flex-col gap-4 mt-auto">
                  <button (click)="store.downloadCSVTemplate()" class="w-full py-4 px-6 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-2xl text-gray-700 dark:text-gray-200 font-bold transition flex items-center justify-center gap-3">
                     <span class="material-symbols-rounded">description</span>
                     {{ store.dict().settings.csvTemplate }}
                  </button>
                  
                  <div class="relative">
                     <input type="file" #csvInput (change)="onCSVSelected($event)" class="hidden" accept=".csv">
                     <button (click)="csvInput.click()" class="w-full py-4 px-6 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-700 dark:text-emerald-400 font-bold transition flex items-center justify-center gap-3">
                        <span class="material-symbols-rounded">publish</span>
                        {{ store.dict().settings.importCsv }}
                     </button>
                  </div>
               </div>
            </div>
         </div>

         <!-- Danger Zone -->
         <div class="bg-red-50/50 dark:bg-red-900/10 rounded-[2rem] border-2 border-dashed border-red-200 dark:border-red-900/30 p-8 relative overflow-hidden">
            <div class="relative z-10">
               <div class="flex items-start gap-4 mb-4">
                  <div class="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
                     <span class="material-symbols-rounded text-2xl">warning</span>
                  </div>
                  <div>
                     <h3 class="text-xl font-bold text-red-900 dark:text-red-300">Zona de Perigo</h3>
                     <p class="text-base text-red-800 dark:text-red-300/80 leading-relaxed mt-1">
                        {{ store.dict().settings.warning }} Isso apagará todas as suas transações, orçamentos e objetivos.
                     </p>
                  </div>
               </div>
               
               <div class="mt-6 p-6 bg-white dark:bg-dark-800 rounded-2xl border border-red-200 dark:border-red-800/50 flex flex-col md:flex-row items-center gap-6">
                  <div class="flex-1">
                     <label class="text-sm font-bold text-gray-700 dark:text-gray-200">Para confirmar, digite <span class="font-black text-red-600 select-none">APAGAR</span> abaixo:</label>
                     <input 
                        type="text" 
                        [(ngModel)]="confirmDeleteText"
                        (keyup)="confirmDeleteText = confirmDeleteText.toUpperCase()"
                        class="w-full mt-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800/50 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 outline-none text-red-900 dark:text-white transition font-bold tracking-widest text-center"
                        placeholder="APAGAR"
                     >
                  </div>

                  <button 
                     (click)="clearData()" 
                     [disabled]="confirmDeleteText !== 'APAGAR'"
                     class="w-full md:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold transition shadow-lg shadow-red-500/20 flex items-center justify-center gap-3 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none"
                   >
                     <span class="material-symbols-rounded">delete_forever</span>
                     Apagar Meus Dados
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class SettingsComponent {
  store = inject(StoreService);

  newCatName = '';
  newCatIcon = 'category';
  newCatColor = 'bg-gray-100 text-gray-600';

  confirmDeleteText = '';

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.store.importData(e.target.result);
      };
      reader.readAsText(file);
      event.target.value = '';
    }
  }

  onCSVSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.store.importFromCSV(e.target.result);
      };
      reader.readAsText(file);
      event.target.value = '';
    }
  }

  addCategory() {
    if (this.newCatName.trim()) {
      this.store.addCategory(this.newCatName, this.newCatIcon, this.newCatColor);
      this.newCatName = '';
      this.newCatIcon = 'category';
    }
  }

  clearData() {
    if (this.confirmDeleteText === 'APAGAR') {
       this.store.clearAllData();
       this.confirmDeleteText = '';
    }
  }
}