import { Component, ElementRef, ViewChild, inject, effect, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { StoreService } from '../services/store.service';
import { FormsModule } from '@angular/forms';

// Safely declare D3 in case it fails to load from CDN
declare const d3: any;

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule, DatePipe],
  template: `
    <div class="space-y-6 print:space-y-4 animate-fade-in pb-12">
      <!-- ... (Template content remains the same, logic updated below) ... -->
      <!-- Modern Header -->
      <header class="flex flex-col xl:flex-row xl:items-end justify-between gap-6 print:hidden">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{{ store.dict().analytics.title }}</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">{{ store.dict().analytics.subtitle }}</p>
        </div>
        
        <!-- Controls Container -->
        <div class="flex flex-col sm:flex-row gap-4 w-full xl:w-auto bg-white dark:bg-dark-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
           <!-- Date Range Selectors -->
           <div class="flex flex-1 gap-3 items-center">
             <div class="flex-1">
                <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">{{ store.dict().analytics.startDate }}</label>
                <input type="date" 
                  [ngModel]="startDate()" 
                  (ngModelChange)="startDate.set($event)"
                  class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition"
                >
             </div>
             <div class="h-8 w-px bg-gray-200 dark:bg-gray-600 mt-6 hidden sm:block"></div>
             <div class="flex-1">
                <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">{{ store.dict().analytics.endDate }}</label>
                <input type="date" 
                  [ngModel]="endDate()" 
                  (ngModelChange)="endDate.set($event)"
                  class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition"
                >
             </div>
           </div>
           
           <div class="relative mt-2 sm:mt-6">
             <button (click)="isExportMenuOpen.set(!isExportMenuOpen())" class="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-500 transition shadow-lg shadow-brand-500/20 active:scale-95">
               <span class="material-symbols-rounded text-[20px]">download</span>
               {{ store.dict().common.export }}
             </button>

             @if (isExportMenuOpen()) {
               <div class="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-scale-in origin-top-right">
                 <button (click)="downloadExcel()" class="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-3">
                   <div class="p-1.5 bg-green-100 text-green-600 rounded-lg"><span class="material-symbols-rounded text-sm">table_view</span></div>
                   {{ store.dict().analytics.exportOptions.excel }}
                 </button>
                 <button (click)="printReport()" class="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-3 border-t border-gray-100 dark:border-gray-700">
                   <div class="p-1.5 bg-red-100 text-red-600 rounded-lg"><span class="material-symbols-rounded text-sm">picture_as_pdf</span></div>
                   {{ store.dict().analytics.exportOptions.pdf }}
                 </button>
               </div>
               
               <!-- Backdrop -->
               <div class="fixed inset-0 z-40" (click)="isExportMenuOpen.set(false)"></div>
             }
           </div>
        </div>
      </header>

      <!-- Print Header -->
      <div class="hidden print:block mb-8">
        <h1 class="text-3xl font-bold text-black">{{ store.dict().common.appName }} - {{ store.dict().analytics.title }}</h1>
        <p class="text-gray-600">{{ store.dict().analytics.period }}: {{ startDate() }} - {{ endDate() }}</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
        
        <!-- Bar Chart (Daily Activity) -->
        <div class="bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 flex flex-col relative overflow-hidden print:border-gray-300 print:shadow-none">
          <h3 class="w-full text-left text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <span class="w-1 h-6 bg-brand-500 rounded-full"></span>
            {{ store.dict().analytics.daily }}
          </h3>
          <div class="w-full overflow-x-auto custom-scrollbar">
             <div #barChartContainer class="relative z-10 animate-fade-in min-w-[300px]"></div>
          </div>
        </div>

        <!-- Donut Chart (Categories) -->
        <div class="bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 flex flex-col relative overflow-hidden print:border-gray-300 print:shadow-none">
          <h3 class="w-full text-left text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <span class="w-1 h-6 bg-purple-500 rounded-full"></span>
            {{ store.dict().analytics.distribution }}
          </h3>
          <div class="w-full overflow-x-auto custom-scrollbar flex justify-center">
             <div #donutChartContainer class="relative z-10 animate-fade-in min-w-[300px] flex justify-center"></div>
          </div>
        </div>
      </div>

      <!-- Advice Section -->
      <div class="bg-gradient-to-br from-brand-600 to-teal-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden print:hidden">
         <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative z-10 flex flex-col md:flex-row gap-6 items-center">
            <div class="flex-1">
               <h3 class="text-xl font-bold mb-2 flex items-center gap-2">
                 <span class="material-symbols-rounded opacity-80">lightbulb</span>
                 {{ store.dict().analytics.adviceTitle }}
               </h3>
               <p class="opacity-90 leading-relaxed max-w-2xl">{{ store.dict().analytics.adviceText }}</p>
            </div>
            <div class="flex gap-4">
               <div class="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center min-w-[120px]">
                  <p class="text-xs uppercase opacity-70 mb-1">Entradas</p>
                  <p class="text-xl font-bold">{{ monthlyIncome() | currency:store.currencyCode():'symbol':'1.0-0' }}</p>
               </div>
               <div class="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center min-w-[120px]">
                  <p class="text-xs uppercase opacity-70 mb-1">Saídas</p>
                  <p class="text-xl font-bold">{{ monthlyExpenses() | currency:store.currencyCode():'symbol':'1.0-0' }}</p>
               </div>
            </div>
        </div>
      </div>

      <!-- Transaction Table -->
      <div class="bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden print:border-gray-300 print:shadow-none print:mt-6">
        <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-700 print:border-gray-300 flex justify-between items-center">
           <h3 class="font-bold text-gray-900 dark:text-white">{{ store.dict().transactions.title }}</h3>
           <span class="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-500">{{ startDate() }} — {{ endDate() }}</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
             <thead class="bg-gray-50 dark:bg-dark-900/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-100 dark:border-gray-700 print:bg-gray-100 print:text-black">
                <tr>
                   <th class="px-6 py-4">{{ store.dict().transactions.table.date }}</th>
                   <th class="px-6 py-4">{{ store.dict().transactions.table.description }}</th>
                   <th class="px-6 py-4">{{ store.dict().transactions.table.category }}</th>
                   <th class="px-6 py-4">{{ store.dict().transactions.table.method }}</th>
                   <th class="px-6 py-4 text-right">{{ store.dict().transactions.table.amount }}</th>
                </tr>
             </thead>
             <tbody class="divide-y divide-gray-100 dark:divide-gray-700 print:divide-gray-300">
                @for(t of filteredTransactions(); track t.id) {
                   <tr class="print:text-black hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                      <td class="px-6 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">{{ t.date }}</td>
                      <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">{{ t.description }}</td>
                      <td class="px-6 py-4 text-gray-600 dark:text-gray-300">
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {{ t.category }}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-gray-500 text-xs">
                         {{ getPaymentMethodLabel(t.paymentMethod) }}
                         @if(t.installments && t.installments > 1) { 
                           <span class="ml-1 text-brand-600 font-semibold">({{ t.installments }}x)</span> 
                         }
                      </td>
                      <td class="px-6 py-4 text-right font-bold" [class.text-green-600]="t.type === 'income'" [class.text-red-600]="t.type === 'expense' && t.type !== 'income'">
                         {{ t.type === 'income' ? '+' : '-' }}{{ t.amount | currency:store.currencyCode():'symbol' }}
                      </td>
                   </tr>
                } @empty {
                   <tr>
                      <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                         <div class="flex flex-col items-center gap-2">
                           <span class="material-symbols-rounded text-4xl opacity-20">search_off</span>
                           <p>{{ store.dict().analytics.emptyPeriod }}</p>
                         </div>
                      </td>
                   </tr>
                }
             </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    .animate-scale-in { animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  `]
})
export class AnalyticsComponent {
  @ViewChild('barChartContainer') barChartContainer!: ElementRef;
  @ViewChild('donutChartContainer') donutChartContainer!: ElementRef;
  store = inject(StoreService);
  
  startDate = signal(this.getFirstDayOfMonth());
  endDate = signal(this.getLastDayOfMonth());
  
  isExportMenuOpen = signal(false);

  filteredTransactions = computed(() => {
    const start = this.startDate();
    const end = this.endDate();
    return this.store.transactions()
      .filter(t => t.date >= start && t.date <= end)
      .sort((a,b) => a.date.localeCompare(b.date));
  });

  monthlyExpenses = computed(() => {
    return this.filteredTransactions()
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
  });

  monthlyIncome = computed(() => {
    return this.filteredTransactions()
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
  });

  // Data for Donut Chart
  expensesByCategory = computed(() => {
    const expenses = this.filteredTransactions().filter(t => t.type === 'expense');
    const map = new Map<string, number>();
    expenses.forEach(t => {
      const current = map.get(t.category) || 0;
      map.set(t.category, current + t.amount);
    });
    return Array.from(map, ([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  });

  // Data for Bar Chart (Daily Expenses)
  dailyExpenses = computed(() => {
    const expenses = this.filteredTransactions().filter(t => t.type === 'expense');
    const map = new Map<string, number>();
    
    // Initialize map with range days (simplified: just present days)
    expenses.forEach(t => {
        // Format MM-DD for shorter labels
        const dateParts = t.date.split('-');
        const label = `${dateParts[2]}/${dateParts[1]}`;
        const current = map.get(label) || 0;
        map.set(label, current + t.amount);
    });

    return Array.from(map, ([name, value]) => ({ name, value }));
  });

  constructor() {
    effect(() => {
      // Trigger charts update when data changes
      const dailyData = this.dailyExpenses();
      const catData = this.expensesByCategory();
      
      // Delay slightly to ensure DOM is ready if switching views
      setTimeout(() => {
         if (typeof d3 !== 'undefined') {
            if (this.barChartContainer) this.renderBarChart(dailyData);
            if (this.donutChartContainer) this.renderDonutChart(catData);
         } else {
            // Graceful fallback if D3 fails to load (offline or blocked)
            if (this.barChartContainer) this.barChartContainer.nativeElement.innerHTML = '<p class="text-xs text-red-500 text-center p-4">Erro: Biblioteca de gráficos não carregada (Offline?)</p>';
            if (this.donutChartContainer) this.donutChartContainer.nativeElement.innerHTML = '<p class="text-xs text-red-500 text-center p-4">Erro: Biblioteca de gráficos não carregada</p>';
         }
      }, 100);
    });
  }

  getPaymentMethodLabel(method?: string): string {
    if (!method) return '-';
    const methods = this.store.dict().modal.methods as any;
    return methods[method] || method;
  }

  private getFirstDayOfMonth(): string {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
  }

  private getLastDayOfMonth(): string {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
  }

  downloadExcel() {
    this.isExportMenuOpen.set(false);
    const data = this.filteredTransactions();
    if (data.length === 0) return;

    const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Método', 'Parcelas', 'Status'];
    const BOM = "\uFEFF";
    
    const methodsDict = this.store.dict().modal.methods as any;
    const typesDict = this.store.dict().modal.types as any;

    const rows = data.map(t => {
      const formattedAmount = t.amount.toFixed(2).replace('.', ',');
      const typeLabel = typesDict[t.type] || t.type;
      const methodLabel = t.paymentMethod ? (methodsDict[t.paymentMethod] || t.paymentMethod) : '-';
      
      return [
        t.date,
        `"${t.description.replace(/"/g, '""')}"`, 
        t.category,
        typeLabel,
        formattedAmount,
        methodLabel,
        t.installments || 1,
        'Concluído'
      ].join(';');
    });

    const csvContent = BOM + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `finwise_${this.startDate()}_to_${this.endDate()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  printReport() {
    this.isExportMenuOpen.set(false);
    window.print();
  }

  renderBarChart(data: {name: string, value: number}[]) {
    const element = this.barChartContainer.nativeElement;
    element.innerHTML = ''; 

    if (data.length === 0) {
      element.innerHTML = '<p class="text-gray-500 text-sm p-12 text-center italic opacity-60">Sem dados para exibir.</p>';
      return;
    }

    const margin = {top: 20, right: 20, bottom: 40, left: 50};
    const width = element.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(element)
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .range([0, width])
      .domain(data.map(d => d.name))
      .padding(0.4);

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(0))
      .selectAll("text")
        .attr("dy", "1em")
        .style("font-size", "10px")
        .style("font-weight", "500")
        .style("fill", this.store.darkMode() ? "#94a3b8" : "#64748b");

    svg.select(".domain").remove();

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, (d: any) => d.value) || 0])
      .range([height, 0]);
    
    svg.append("g")
      .call(d3.axisLeft(y).ticks(5).tickSize(-width))
      .select(".domain").remove();
    
    svg.selectAll(".tick line")
       .attr("stroke", this.store.darkMode() ? "#334155" : "#e2e8f0")
       .attr("stroke-dasharray", "4,4");

    svg.selectAll(".tick text")
       .attr("x", -10)
       .style("fill", this.store.darkMode() ? "#94a3b8" : "#94a3b8")
       .style("font-size", "10px");

    // Rounded Bars
    svg.selectAll("mybar")
      .data(data)
      .enter()
      .append("rect")
        .attr("x", (d: any) => x(d.name))
        .attr("y", (d: any) => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", (d: any) => height - y(d.value))
        .attr("fill", "url(#barGradient)")
        .attr("rx", 4)
        .attr("ry", 4);

    // Gradient
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "barGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    
    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#10b981");
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#059669");
  }

  renderDonutChart(data: {name: string, value: number}[]) {
    const element = this.donutChartContainer.nativeElement;
    element.innerHTML = '';

    if (data.length === 0) {
       element.innerHTML = '<p class="text-gray-500 text-sm p-12 text-center italic opacity-60">Sem dados para exibir.</p>';
       return;
    }

    const width = 300;
    const height = 300;
    const margin = 20;
    const radius = Math.min(width, height) / 2 - margin;

    const svg = d3.select(element)
      .append("svg")
        .attr("width", width)
        .attr("height", height)
      .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    // Color scale
    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.name))
      .range(["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#6366f1", "#14b8a6"]);

    const pie = d3.pie()
      .value((d: any) => d.value)
      .sort(null); // Keep order sorted by value from computed

    const arc = d3.arc()
      .innerRadius(radius * 0.6)         // This makes it a donut
      .outerRadius(radius * 0.95)
      .cornerRadius(6);

    const arcHover = d3.arc()
      .innerRadius(radius * 0.6)
      .outerRadius(radius * 1.05)
      .cornerRadius(6);

    const arcs = svg.selectAll('allSlices')
      .data(pie(data))
      .enter();

    // Slices
    arcs.append('path')
      .attr('d', arc)
      .attr('fill', (d: any) => color(d.data.name))
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .style("opacity", 0.9)
      .on("mouseover", function(this: any, event: any, d: any) {
          d3.select(this).transition().duration(200).attr("d", arcHover).style("opacity", 1);
          // Add tooltip logic here if needed, simplified for now
      })
      .on("mouseout", function(this: any, event: any, d: any) {
          d3.select(this).transition().duration(200).attr("d", arc).style("opacity", 0.9);
      });

    // Labels (simplified inside)
    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    
    svg.append("text")
       .attr("text-anchor", "middle")
       .attr("dy", "-0.5em")
       .text("Total")
       .style("font-size", "12px")
       .style("fill", this.store.darkMode() ? "#94a3b8" : "#64748b")
       .style("font-weight", "600")
       .style("text-transform", "uppercase");

    svg.append("text")
       .attr("text-anchor", "middle")
       .attr("dy", "1em")
       .text(this.formatCurrency(total))
       .style("font-size", "16px")
       .style("fill", this.store.darkMode() ? "white" : "#1e293b")
       .style("font-weight", "bold");
  }

  // Helper to format currency inside D3 (since pipe isn't available easily in pure JS D3)
  private formatCurrency(value: number): string {
     return new Intl.NumberFormat(this.store.localeCode(), { style: 'currency', currency: this.store.currencyCode() }).format(value);
  }
}
