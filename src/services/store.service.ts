import { Injectable, signal, computed, inject } from '@angular/core';
import { NotificationService } from './notification.service';

export interface Transaction {
  id: string;
  date: string; // ISO date YYYY-MM-DD
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  merchant?: string;
  paymentMethod?: 'cash' | 'card' | 'transfer';
  installments?: number; // 1 to N
  installmentId?: string; // To group installments together if needed later
}

export type Language = 'pt' | 'en' | 'es' | 'fr' | 'de';

export const CATEGORIES_LIST = [
  { id: 'Alimentação', icon: 'shopping_cart' },
  { id: 'Restaurantes', icon: 'restaurant' },
  { id: 'Habitação', icon: 'home' },
  { id: 'Transporte', icon: 'directions_car' },
  { id: 'Lazer', icon: 'movie' },
  { id: 'Saúde', icon: 'medical_services' },
  { id: 'Educação', icon: 'school' },
  { id: 'Compras', icon: 'shopping_bag' },
  { id: 'Receitas', icon: 'payments' },
  { id: 'Investimentos', icon: 'trending_up' },
  { id: 'Outros', icon: 'category' }
];

export const TRANSLATIONS = {
  pt: {
    code: 'BRL',
    locale: 'pt-BR',
    common: { appName: 'Gestão Pessoal', add: '+ Nova Transação', save: 'Salvar', cancel: 'Cancelar', edit: 'Editar', delete: 'Excluir', export: 'Exportar', print: 'Imprimir/PDF' },
    menu: { dashboard: 'Painel', transactions: 'Transações', calendar: 'Calendário', reports: 'Relatórios', advisor: 'Consultor IA', theme: { light: 'Modo Claro', dark: 'Modo Escuro' }, logout: 'Sair' },
    dashboard: { title: 'Painel de Controle', subtitle: 'Visão geral das suas finanças', aiButton: 'Dicas IA', cards: { balance: 'Saldo Total', income: 'Receitas', expenses: 'Despesas', trend: 'vs mês passado' }, recent: 'Recentes', viewAll: 'Ver tudo' },
    transactions: { title: 'Transações', subtitle: 'Gerencie suas movimentações', search: 'Pesquisar...', table: { date: 'Data', description: 'Descrição', category: 'Categoria', amount: 'Valor', method: 'Pagamento' }, empty: 'Nenhuma transação encontrada.' },
    calendar: { title: 'Calendário Financeiro', subtitle: 'Visualize seus gastos por dia', totalDay: 'Total do dia', prev: 'Anterior', next: 'Próximo', today: 'Hoje' },
    analytics: { 
      title: 'Relatórios', subtitle: 'Análise detalhada', distribution: 'Por Categoria', activity: 'Atividade Mensal', goals: 'Objetivos', adviceTitle: 'Insight', adviceText: 'Seus gastos com alimentação subiram 15% este mês.', chartTotal: 'Total', period: 'Período', emptyPeriod: 'Sem dados neste período.',
      startDate: 'Data Inicial', endDate: 'Data Final',
      exportOptions: { excel: 'Baixar Excel (.csv)', pdf: 'Gerar PDF' } 
    },
    advisor: { title: 'Gestão AI', subtitle: 'Assistente Inteligente', greeting: 'Olá! Como posso ajudar?', intro: 'Pergunte sobre seus gastos, dicas de investimento ou planejamento.', actions: { analyze: 'Analisar gastos', save: 'Dicas de economia' }, inputPlaceholder: 'Pergunte algo...', loading: 'Analisando...', error: 'Erro na conexão.' },
    modal: { 
      title: 'Adicionar Transação', titleEdit: 'Editar Transação', 
      type: 'Tipo', amount: 'Valor Total', description: 'Descrição', category: 'Categoria', date: 'Data', 
      paymentMethod: 'Forma de Pagamento', installments: 'Parcelas',
      types: { income: 'Receita', expense: 'Despesa' },
      methods: { cash: 'Dinheiro', card: 'Cartão', transfer: 'Transferência' }
    },
    notifications: { added: 'Transação adicionada!', updated: 'Transação atualizada!', deleted: 'Transação removida!' }
  },
  en: {
    code: 'USD',
    locale: 'en-US',
    common: { appName: 'Personal Finance', add: '+ New Transaction', save: 'Save', cancel: 'Cancel', edit: 'Edit', delete: 'Delete', export: 'Export', print: 'Print/PDF' },
    menu: { dashboard: 'Dashboard', transactions: 'Transactions', calendar: 'Calendar', reports: 'Reports', advisor: 'AI Advisor', theme: { light: 'Light Mode', dark: 'Dark Mode' }, logout: 'Logout' },
    dashboard: { title: 'Dashboard', subtitle: 'Financial Overview', aiButton: 'AI Tips', cards: { balance: 'Total Balance', income: 'Income', expenses: 'Expenses', trend: 'vs last month' }, recent: 'Recent', viewAll: 'See all' },
    transactions: { title: 'Transactions', subtitle: 'Manage your movements', search: 'Search...', table: { date: 'Date', description: 'Description', category: 'Category', amount: 'Amount', method: 'Method' }, empty: 'No transactions found.' },
    calendar: { title: 'Financial Calendar', subtitle: 'View expenses by day', totalDay: 'Total for day', prev: 'Prev', next: 'Next', today: 'Today' },
    analytics: { 
      title: 'Analytics', subtitle: 'Detailed analysis', distribution: 'By Category', activity: 'Monthly Activity', goals: 'Goals', adviceTitle: 'Insight', adviceText: 'Food expenses are up 15% this month.', chartTotal: 'Total', period: 'Period', emptyPeriod: 'No data in this period.',
      startDate: 'Start Date', endDate: 'End Date',
      exportOptions: { excel: 'Download Excel (.csv)', pdf: 'Generate PDF' }
    },
    advisor: { title: 'AI Manager', subtitle: 'Smart Assistant', greeting: 'Hello! How can I help?', intro: 'Ask about expenses, investment tips or planning.', actions: { analyze: 'Analyze expenses', save: 'Savings tips' }, inputPlaceholder: 'Ask something...', loading: 'Thinking...', error: 'Connection error.' },
    modal: { 
      title: 'Add Transaction', titleEdit: 'Edit Transaction',
      type: 'Type', amount: 'Total Amount', description: 'Description', category: 'Category', date: 'Date', 
      paymentMethod: 'Payment Method', installments: 'Installments',
      types: { income: 'Income', expense: 'Expense' },
      methods: { cash: 'Cash', card: 'Card', transfer: 'Transfer' }
    },
    notifications: { added: 'Transaction added!', updated: 'Transaction updated!', deleted: 'Transaction deleted!' }
  },
  es: {
    code: 'EUR',
    locale: 'es-ES',
    common: { appName: 'Gestión Personal', add: '+ Nueva Transacción', save: 'Guardar', cancel: 'Cancelar', edit: 'Editar', delete: 'Borrar', export: 'Exportar', print: 'Imprimir/PDF' },
    menu: { dashboard: 'Panel', transactions: 'Transacciones', calendar: 'Calendario', reports: 'Reportes', advisor: 'Asesor IA', theme: { light: 'Modo Claro', dark: 'Modo Oscuro' }, logout: 'Salir' },
    dashboard: { title: 'Panel de Control', subtitle: 'Resumen financiero', aiButton: 'Consejos IA', cards: { balance: 'Saldo Total', income: 'Ingresos', expenses: 'Gastos', trend: 'vs mes anterior' }, recent: 'Recientes', viewAll: 'Ver todo' },
    transactions: { title: 'Transacciones', subtitle: 'Gestiona tus movimientos', search: 'Buscar...', table: { date: 'Fecha', description: 'Descripción', category: 'Categoría', amount: 'Monto', method: 'Método' }, empty: 'No se encontraron transacciones.' },
    calendar: { title: 'Calendario Financiero', subtitle: 'Visualiza gastos por día', totalDay: 'Total del día', prev: 'Ant', next: 'Sig', today: 'Hoy' },
    analytics: { 
      title: 'Analítica', subtitle: 'Análisis detallado', distribution: 'Por Categoría', activity: 'Actividad Mensual', goals: 'Metas', adviceTitle: 'Insight', adviceText: 'Gastos en comida subieron 15% este mes.', chartTotal: 'Total', period: 'Período', emptyPeriod: 'Sin datos.',
      startDate: 'Fecha Inicio', endDate: 'Fecha Fin',
      exportOptions: { excel: 'Descargar Excel (.csv)', pdf: 'Generar PDF' }
    },
    advisor: { title: 'IA Manager', subtitle: 'Asistente Inteligente', greeting: '¡Hola! ¿En qué ayudo?', intro: 'Pregunta sobre gastos, consejos o planificación.', actions: { analyze: 'Analizar gastos', save: 'Tips de ahorro' }, inputPlaceholder: 'Pregunta algo...', loading: 'Pensando...', error: 'Error de conexión.' },
    modal: { 
      title: 'Agregar Transacción', titleEdit: 'Editar Transacción',
      type: 'Tipo', amount: 'Monto Total', description: 'Descripción', category: 'Categoría', date: 'Fecha', 
      paymentMethod: 'Método de Pago', installments: 'Cuotas',
      types: { income: 'Ingreso', expense: 'Gasto' },
      methods: { cash: 'Efectivo', card: 'Tarjeta', transfer: 'Transferencia' }
    },
    notifications: { added: '¡Transacción añadida!', updated: '¡Transacción actualizada!', deleted: '¡Transacción eliminada!' }
  },
  fr: {
    code: 'EUR',
    locale: 'fr-FR',
    common: { appName: 'Gestion Personnelle', add: '+ Nouvelle Transaction', save: 'Enregistrer', cancel: 'Annuler', edit: 'Modifier', delete: 'Supprimer', export: 'Exporter', print: 'Imprimer/PDF' },
    menu: { dashboard: 'Tableau de bord', transactions: 'Transactions', calendar: 'Calendrier', reports: 'Rapports', advisor: 'Conseiller IA', theme: { light: 'Mode Clair', dark: 'Mode Sombre' }, logout: 'Quitter' },
    dashboard: { title: 'Tableau de bord', subtitle: 'Aperçu financier', aiButton: 'Conseils IA', cards: { balance: 'Solde Total', income: 'Revenus', expenses: 'Dépenses', trend: 'vs mois dernier' }, recent: 'Récents', viewAll: 'Voir tout' },
    transactions: { title: 'Transactions', subtitle: 'Gérez vos mouvements', search: 'Rechercher...', table: { date: 'Date', description: 'Description', category: 'Catégorie', amount: 'Montant', method: 'Méthode' }, empty: 'Aucune transaction trouvée.' },
    calendar: { title: 'Calendrier Financier', subtitle: 'Visualisez les dépenses par jour', totalDay: 'Total du jour', prev: 'Préc', next: 'Suiv', today: 'Aujourd\'hui' },
    analytics: { 
      title: 'Analytique', subtitle: 'Analyse détaillée', distribution: 'Par Catégorie', activity: 'Activité Mensuelle', goals: 'Objectifs', adviceTitle: 'Aperçu', adviceText: 'Les dépenses alimentaires ont augmenté de 15%.', chartTotal: 'Total', period: 'Période', emptyPeriod: 'Aucune donnée.',
      startDate: 'Date de début', endDate: 'Date de fin',
      exportOptions: { excel: 'Télécharger Excel (.csv)', pdf: 'Générer PDF' }
    },
    advisor: { title: 'Gestion IA', subtitle: 'Assistant Intelligent', greeting: 'Bonjour !', intro: 'Posez des questions sur vos dépenses ou investissements.', actions: { analyze: 'Analyser dépenses', save: 'Conseils éco' }, inputPlaceholder: 'Posez une question...', loading: 'Analyse...', error: 'Erreur.' },
    modal: { 
      title: 'Ajouter Transaction', titleEdit: 'Modifier Transaction',
      type: 'Type', amount: 'Montant Total', description: 'Description', category: 'Catégorie', date: 'Date', 
      paymentMethod: 'Moyen de paiement', installments: 'Versements',
      types: { income: 'Revenu', expense: 'Dépense' },
      methods: { cash: 'Espèces', card: 'Carte', transfer: 'Virement' }
    },
    notifications: { added: 'Transaction ajoutée!', updated: 'Transaction mise à jour!', deleted: 'Transaction supprimée!' }
  },
  de: {
    code: 'EUR',
    locale: 'de-DE',
    common: { appName: 'Persönliche Finanzen', add: '+ Neue Transaktion', save: 'Speichern', cancel: 'Abbrechen', edit: 'Bearbeiten', delete: 'Löschen', export: 'Exportieren', print: 'Drucken/PDF' },
    menu: { dashboard: 'Übersicht', transactions: 'Transaktionen', calendar: 'Kalender', reports: 'Berichte', advisor: 'KI-Berater', theme: { light: 'Heller Modus', dark: 'Dunkler Modus' }, logout: 'Abmelden' },
    dashboard: { title: 'Dashboard', subtitle: 'Finanzüberblick', aiButton: 'KI Tipps', cards: { balance: 'Gesamtsaldo', income: 'Einnahmen', expenses: 'Ausgaben', trend: 'vs Vormonat' }, recent: 'Aktuell', viewAll: 'Alle ansehen' },
    transactions: { title: 'Transaktionen', subtitle: 'Bewegungen verwalten', search: 'Suchen...', table: { date: 'Datum', description: 'Beschreibung', category: 'Kategorie', amount: 'Betrag', method: 'Methode' }, empty: 'Keine Transaktionen gefunden.' },
    calendar: { title: 'Finanzkalender', subtitle: 'Ausgaben nach Tag', totalDay: 'Tagesgesamtwert', prev: 'Zurück', next: 'Weiter', today: 'Heute' },
    analytics: { 
      title: 'Analytik', subtitle: 'Detaillierte Analyse', distribution: 'Nach Kategorie', activity: 'Monatliche Aktivität', goals: 'Ziele', adviceTitle: 'Einblick', adviceText: 'Lebensmittelausgaben sind um 15% gestiegen.', chartTotal: 'Gesamt', period: 'Zeitraum', emptyPeriod: 'Keine Daten.',
      startDate: 'Startdatum', endDate: 'Enddatum',
      exportOptions: { excel: 'Excel herunterladen (.csv)', pdf: 'PDF erstellen' }
    },
    advisor: { title: 'KI Manager', subtitle: 'Smarter Assistent', greeting: 'Hallo!', intro: 'Fragen Sie nach Ausgaben oder Anlagetipps.', actions: { analyze: 'Ausgaben analysieren', save: 'Spartipps' }, inputPlaceholder: 'Frage stellen...', loading: 'Denken...', error: 'Fehler.' },
    modal: { 
      title: 'Transaktion hinzufügen', titleEdit: 'Transaktion bearbeiten',
      type: 'Typ', amount: 'Gesamtbetrag', description: 'Beschreibung', category: 'Kategorie', date: 'Datum', 
      paymentMethod: 'Zahlungsmethode', installments: 'Raten',
      types: { income: 'Einnahme', expense: 'Ausgabe' },
      methods: { cash: 'Bar', card: 'Karte', transfer: 'Überweisung' }
    },
    notifications: { added: 'Transaktion hinzugefügt!', updated: 'Transaktion aktualisiert!', deleted: 'Transaktion gelöscht!' }
  }
};

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private notificationService = inject(NotificationService);

  // State
  readonly transactions = signal<Transaction[]>([]);
  readonly darkMode = signal<boolean>(false);
  readonly language = signal<Language>('pt');
  readonly isModalOpen = signal<boolean>(false);
  readonly transactionToEdit = signal<Transaction | null>(null);

  // Derived State
  readonly dict = computed(() => TRANSLATIONS[this.language()]);
  readonly currencyCode = computed(() => TRANSLATIONS[this.language()].code);
  readonly localeCode = computed(() => TRANSLATIONS[this.language()].locale);
  readonly categories = signal(CATEGORIES_LIST);

  readonly totalBalance = computed(() => {
    return this.transactions().reduce((acc, t) => {
      return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, 0);
  });

  readonly monthlyIncome = computed(() => {
    const now = new Date();
    // Consider year and month
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    return this.transactions()
      .filter(t => {
        const d = new Date(t.date);
        return t.type === 'income' && d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      })
      .reduce((acc, t) => acc + t.amount, 0);
  });

  readonly monthlyExpenses = computed(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return this.transactions()
      .filter(t => {
        const d = new Date(t.date);
        return t.type === 'expense' && d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      })
      .reduce((acc, t) => acc + t.amount, 0);
  });

  // Calculate Trend (Comparison with last month's balance change)
  readonly financialTrend = computed(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const lastMonthDate = new Date(now);
    lastMonthDate.setMonth(now.getMonth() - 1);
    const lastYear = lastMonthDate.getFullYear();
    const lastMonth = lastMonthDate.getMonth();

    const currentBalanceChange = this.transactions().reduce((acc, t) => {
      const d = new Date(t.date);
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
         return t.type === 'income' ? acc + t.amount : acc - t.amount;
      }
      return acc;
    }, 0);

    const lastBalanceChange = this.transactions().reduce((acc, t) => {
      const d = new Date(t.date);
      if (d.getFullYear() === lastYear && d.getMonth() === lastMonth) {
         return t.type === 'income' ? acc + t.amount : acc - t.amount;
      }
      return acc;
    }, 0);

    if (lastBalanceChange === 0) return 0; // Avoid division by zero
    
    return ((currentBalanceChange - lastBalanceChange) / Math.abs(lastBalanceChange)) * 100;
  });

  readonly expensesByCategory = computed(() => {
    const expenses = this.transactions().filter(t => t.type === 'expense');
    const map = new Map<string, number>();
    expenses.forEach(t => {
      const current = map.get(t.category) || 0;
      map.set(t.category, current + t.amount);
    });
    return Array.from(map, ([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  });

  constructor() {
    this.loadMockData();
    this.checkSystemTheme();
  }

  toggleTheme() {
    this.darkMode.update(v => !v);
    if (this.darkMode()) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  setLanguage(lang: Language) {
    this.language.set(lang);
  }

  openModal(transaction?: Transaction) {
    if (transaction) {
      this.transactionToEdit.set(transaction);
    } else {
      this.transactionToEdit.set(null);
    }
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.transactionToEdit.set(null);
  }

  addTransaction(t: Omit<Transaction, 'id'>) {
    const newTransactions: Transaction[] = [];
    
    // Installment Logic
    if (t.type === 'expense' && t.paymentMethod === 'card' && t.installments && t.installments > 1) {
      const installmentAmount = t.amount / t.installments;
      // Handle Date Object vs String safely
      const baseDate = new Date(t.date + 'T12:00:00'); // Add time to avoid timezone shifts on simple dates
      const groupId = crypto.randomUUID();

      for (let i = 0; i < t.installments; i++) {
        // Calculate date for next months
        const date = new Date(baseDate);
        date.setMonth(date.getMonth() + i);
        
        // Handle date overflow (e.g. Jan 31 -> Feb 28)
        if (date.getDate() !== baseDate.getDate()) {
            date.setDate(0); 
        }

        newTransactions.push({
          ...t,
          id: crypto.randomUUID(),
          amount: installmentAmount,
          date: date.toISOString().split('T')[0],
          description: `${t.description} (${i + 1}/${t.installments})`,
          installmentId: groupId
        });
      }
    } else {
      // Single Transaction
      newTransactions.push({ 
        ...t, 
        id: crypto.randomUUID() 
      });
    }

    this.transactions.update(prev => [...newTransactions, ...prev]);
    this.notificationService.show(this.dict().notifications.added, 'success');
  }

  updateTransaction(t: Transaction) {
    this.transactions.update(prev => prev.map(item => item.id === t.id ? t : item));
    this.notificationService.show(this.dict().notifications.updated, 'success');
  }

  deleteTransaction(id: string) {
    this.transactions.update(prev => prev.filter(t => t.id !== id));
    this.notificationService.show(this.dict().notifications.deleted, 'info');
  }

  private checkSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.darkMode.set(true);
      document.documentElement.classList.add('dark');
    }
  }

  private loadMockData() {
    // Cleaned as requested. No mock data.
    this.transactions.set([]);
  }
}