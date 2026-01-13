import { Injectable, signal, computed, inject, effect } from '@angular/core';
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

export interface User {
  name: string;
  email: string;
  plan: 'Free' | 'Premium';
  avatar?: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
  color: string; // Tailwind class for color (e.g., 'bg-blue-500')
}

export interface Budget {
  categoryId: string;
  limit: number;
}

export interface Category {
  id: string; // Name serves as ID for simplicity in this version
  icon: string;
  color: string;
}

export type Language = 'pt' | 'en' | 'es' | 'fr' | 'de';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'Alimentação', icon: 'shopping_cart', color: 'bg-orange-100 text-orange-600' },
  { id: 'Restaurantes', icon: 'restaurant', color: 'bg-red-100 text-red-600' },
  { id: 'Habitação', icon: 'home', color: 'bg-blue-100 text-blue-600' },
  { id: 'Transporte', icon: 'directions_car', color: 'bg-indigo-100 text-indigo-600' },
  { id: 'Lazer', icon: 'movie', color: 'bg-purple-100 text-purple-600' },
  { id: 'Saúde', icon: 'medical_services', color: 'bg-emerald-100 text-emerald-600' },
  { id: 'Educação', icon: 'school', color: 'bg-yellow-100 text-yellow-600' },
  { id: 'Compras', icon: 'shopping_bag', color: 'bg-pink-100 text-pink-600' },
  { id: 'Receitas', icon: 'payments', color: 'bg-green-100 text-green-600' },
  { id: 'Investimentos', icon: 'trending_up', color: 'bg-teal-100 text-teal-600' },
  { id: 'Outros', icon: 'category', color: 'bg-gray-100 text-gray-600' }
];

export const TRANSLATIONS = {
  pt: {
    code: 'BRL',
    locale: 'pt-BR',
    common: { appName: 'Gestão Pessoal', add: '+ Transação', save: 'Salvar', cancel: 'Cancelar', edit: 'Editar', delete: 'Excluir', export: 'Exportar', print: 'Imprimir/PDF', filter: 'Filtrar' },
    menu: { dashboard: 'Painel', transactions: 'Transações', calendar: 'Calendário', reports: 'Relatórios', budgets: 'Orçamentos', advisor: 'Consultor IA', settings: 'Configurações', theme: { light: 'Modo Claro', dark: 'Modo Escuro' }, logout: 'Sair' },
    dashboard: { 
      title: 'Painel de Controle', subtitle: 'Visão geral das suas finanças', aiButton: 'Dicas IA', 
      cards: { balance: 'Saldo Total', income: 'Receitas', expenses: 'Despesas', trend: 'vs mês passado', savingsRate: 'Taxa de Poupança', dailyAvg: 'Média Diária', projected: 'Projeção Mensal' }, 
      recent: 'Recentes', viewAll: 'Ver tudo', goals: 'Meus Objetivos', addGoal: 'Novo Objetivo', budgetAlert: 'Atenção ao Orçamento', 
      quickActions: { addIncome: 'Adicionar Entrada', addExpense: 'Adicionar Saída' }
    },
    transactions: { 
      title: 'Transações', subtitle: 'Gerencie suas movimentações', search: 'Pesquisar...', 
      table: { date: 'Data', description: 'Descrição', category: 'Categoria', amount: 'Valor', method: 'Pagamento' }, 
      empty: 'Nenhuma transação encontrada.', 
      filters: { all: 'Todos', income: 'Receitas', expense: 'Despesas' }, 
      ranges: { thisMonth: 'Este Mês', lastMonth: 'Mês Passado', last3Months: '3 Meses' },
      summary: { income: 'Receita Filtrada', expense: 'Despesa Filtrada', balance: 'Saldo do Período' }
    },
    calendar: { title: 'Calendário Financeiro', subtitle: 'Visualize seus gastos por dia', totalDay: 'Total do dia', prev: 'Anterior', next: 'Próximo', today: 'Hoje', details: 'Detalhes do dia' },
    budgets: { 
      title: 'Orçamentos Mensais', subtitle: 'Defina limites e controle seus gastos por categoria', 
      spent: 'Gasto', remaining: 'Restante', limit: 'Limite', 
      status: { good: 'No controle', warning: 'Atenção', danger: 'Estourado' }, 
      setLimit: 'Definir Limite',
      daily: 'Disponível / dia'
    },
    analytics: { 
      title: 'Relatórios', subtitle: 'Análise detalhada', distribution: 'Por Categoria', activity: 'Atividade Mensal', daily: 'Evolução Diária', goals: 'Objetivos', adviceTitle: 'Insight', adviceText: 'Seus gastos com alimentação subiram 15% este mês.', chartTotal: 'Total', period: 'Período', emptyPeriod: 'Sem dados neste período.',
      startDate: 'Data Inicial', endDate: 'Data Final',
      exportOptions: { excel: 'Baixar Excel (.csv)', pdf: 'Gerar PDF' } 
    },
    advisor: { title: 'Gestão AI', subtitle: 'Assistente Inteligente', greeting: 'Olá! Como posso ajudar?', intro: 'Pergunte sobre seus gastos, dicas de investimento ou planejamento.', actions: { analyze: 'Analisar gastos', save: 'Dicas de economia' }, inputPlaceholder: 'Pergunte algo...', loading: 'Analisando...', error: 'Erro na conexão.' },
    settings: { title: 'Configurações', subtitle: 'Gerencie seus dados e preferências', data: 'Gerenciamento de Dados', categories: 'Categorias Personalizadas', addCategory: 'Adicionar Categoria', export: 'Fazer Backup (JSON)', import: 'Restaurar Backup', importCsv: 'Importar Transações (CSV)', csvTemplate: 'Baixar Modelo CSV', clear: 'Apagar Tudo', warning: 'Atenção: Esta ação é irreversível.', successImport: 'Dados restaurados com sucesso!', successCsv: 'Transações importadas!' },
    modal: { 
      title: 'Adicionar Transação', titleEdit: 'Editar Transação', 
      type: 'Tipo', amount: 'Valor Total', description: 'Descrição', category: 'Categoria', date: 'Data', 
      paymentMethod: 'Forma de Pagamento', installments: 'Parcelas',
      types: { income: 'Receita', expense: 'Despesa' },
      methods: { cash: 'Dinheiro', card: 'Cartão', transfer: 'Transferência' },
      budgetStatus: 'Orçamento da categoria'
    },
    goalModal: { title: 'Novo Objetivo', titleEdit: 'Editar Objetivo', name: 'Nome da Meta', target: 'Valor Alvo', current: 'Valor Atual', icon: 'Ícone', color: 'Cor' },
    notifications: { added: 'Salvo com sucesso!', updated: 'Atualizado com sucesso!', deleted: 'Removido com sucesso!' }
  },
  en: {
    code: 'USD',
    locale: 'en-US',
    common: { appName: 'Personal Finance', add: '+ Transaction', save: 'Save', cancel: 'Cancel', edit: 'Edit', delete: 'Delete', export: 'Export', print: 'Print/PDF', filter: 'Filter' },
    menu: { dashboard: 'Dashboard', transactions: 'Transactions', calendar: 'Calendar', reports: 'Reports', budgets: 'Budgets', advisor: 'AI Advisor', settings: 'Settings', theme: { light: 'Light Mode', dark: 'Dark Mode' }, logout: 'Logout' },
    dashboard: { 
      title: 'Dashboard', subtitle: 'Financial Overview', aiButton: 'AI Tips', 
      cards: { balance: 'Total Balance', income: 'Income', expenses: 'Expenses', trend: 'vs last month', savingsRate: 'Savings Rate', dailyAvg: 'Daily Average', projected: 'Proj. Month End' }, 
      recent: 'Recent', viewAll: 'See all', goals: 'My Goals', addGoal: 'New Goal', budgetAlert: 'Budget Alert', 
      quickActions: { addIncome: 'Add Income', addExpense: 'Add Expense' }
    },
    transactions: { 
      title: 'Transactions', subtitle: 'Manage your movements', search: 'Search...', 
      table: { date: 'Date', description: 'Description', category: 'Category', amount: 'Amount', method: 'Method' }, 
      empty: 'No transactions found.', 
      filters: { all: 'All', income: 'Income', expense: 'Expense' }, 
      ranges: { thisMonth: 'This Month', lastMonth: 'Last Month', last3Months: '3 Months' },
      summary: { income: 'Filtered Income', expense: 'Filtered Expense', balance: 'Period Balance' }
    },
    calendar: { title: 'Financial Calendar', subtitle: 'View expenses by day', totalDay: 'Total for day', prev: 'Prev', next: 'Next', today: 'Today', details: 'Day details' },
    budgets: { 
      title: 'Monthly Budgets', subtitle: 'Set limits and control spending by category', 
      spent: 'Spent', remaining: 'Remaining', limit: 'Limit', 
      status: { good: 'On Track', warning: 'Warning', danger: 'Over Limit' }, 
      setLimit: 'Set Limit',
      daily: 'Safe spend / day'
    },
    analytics: { 
      title: 'Analytics', subtitle: 'Detailed analysis', distribution: 'By Category', activity: 'Monthly Activity', daily: 'Daily Evolution', goals: 'Goals', adviceTitle: 'Insight', adviceText: 'Food expenses are up 15% this month.', chartTotal: 'Total', period: 'Period', emptyPeriod: 'No data in this period.',
      startDate: 'Start Date', endDate: 'End Date',
      exportOptions: { excel: 'Download Excel (.csv)', pdf: 'Generate PDF' }
    },
    advisor: { title: 'AI Manager', subtitle: 'Smart Assistant', greeting: 'Hello! How can I help?', intro: 'Ask about expenses, investment tips or planning.', actions: { analyze: 'Analyze expenses', save: 'Savings tips' }, inputPlaceholder: 'Ask something...', loading: 'Thinking...', error: 'Connection error.' },
    settings: { title: 'Settings', subtitle: 'Manage data and preferences', data: 'Data Management', categories: 'Custom Categories', addCategory: 'Add Category', export: 'Backup Data (JSON)', import: 'Restore Backup', importCsv: 'Import Transactions (CSV)', csvTemplate: 'Download CSV Template', clear: 'Clear All Data', warning: 'Warning: This action is irreversible.', successImport: 'Data restored successfully!', successCsv: 'Transactions imported!' },
    modal: { 
      title: 'Add Transaction', titleEdit: 'Edit Transaction',
      type: 'Type', amount: 'Total Amount', description: 'Description', category: 'Category', date: 'Date', 
      paymentMethod: 'Payment Method', installments: 'Installments',
      types: { income: 'Income', expense: 'Expense' },
      methods: { cash: 'Cash', card: 'Card', transfer: 'Transfer' },
      budgetStatus: 'Category budget'
    },
    goalModal: { title: 'New Goal', titleEdit: 'Edit Goal', name: 'Goal Name', target: 'Target Amount', current: 'Current Saved', icon: 'Icon', color: 'Color' },
    notifications: { added: 'Saved successfully!', updated: 'Updated successfully!', deleted: 'Deleted successfully!' }
  },
  es: {
    code: 'EUR',
    locale: 'es-ES',
    common: { appName: 'Gestión Personal', add: '+ Transacción', save: 'Guardar', cancel: 'Cancelar', edit: 'Editar', delete: 'Borrar', export: 'Exportar', print: 'Imprimir/PDF', filter: 'Filtrar' },
    menu: { dashboard: 'Panel', transactions: 'Transacciones', calendar: 'Calendario', reports: 'Reportes', budgets: 'Presupuestos', advisor: 'Asesor IA', settings: 'Ajustes', theme: { light: 'Modo Claro', dark: 'Modo Oscuro' }, logout: 'Salir' },
    dashboard: { 
      title: 'Panel de Control', subtitle: 'Resumen financiero', aiButton: 'Consejos IA', 
      cards: { balance: 'Saldo Total', income: 'Ingresos', expenses: 'Gastos', trend: 'vs mes anterior', savingsRate: 'Tasa de Ahorro', dailyAvg: 'Promedio Diario', projected: 'Proyección Mensual' }, 
      recent: 'Recientes', viewAll: 'Ver todo', goals: 'Mis Metas', addGoal: 'Nueva Meta', budgetAlert: 'Alerta de Presupuesto', 
      quickActions: { addIncome: 'Añadir Ingreso', addExpense: 'Añadir Gasto' }
    },
    transactions: { 
      title: 'Transacciones', subtitle: 'Gestiona tus movimientos', search: 'Buscar...', 
      table: { date: 'Fecha', description: 'Descripción', category: 'Categoría', amount: 'Monto', method: 'Método' }, 
      empty: 'No se encontraron transacciones.', 
      filters: { all: 'Todos', income: 'Ingresos', expense: 'Gastos' }, 
      ranges: { thisMonth: 'Este Mes', lastMonth: 'Mes Pasado', last3Months: '3 Meses' },
      summary: { income: 'Ingreso Filtrado', expense: 'Gasto Filtrado', balance: 'Saldo del Período' }
    },
    calendar: { title: 'Calendario Financiero', subtitle: 'Visualiza gastos por día', totalDay: 'Total del día', prev: 'Ant', next: 'Sig', today: 'Hoy', details: 'Detalles del día' },
    budgets: { 
      title: 'Presupuestos', subtitle: 'Define límites y controla gastos por categoría', 
      spent: 'Gastado', remaining: 'Restante', limit: 'Límite', 
      status: { good: 'Bien', warning: 'Atención', danger: 'Excedido' }, 
      setLimit: 'Definir Límite',
      daily: 'Disponible / día'
    },
    analytics: { 
      title: 'Analítica', subtitle: 'Análisis detallado', distribution: 'Por Categoría', activity: 'Actividad Mensual', daily: 'Evolución Diaria', goals: 'Metas', adviceTitle: 'Insight', adviceText: 'Gastos en comida subieron 15% este mes.', chartTotal: 'Total', period: 'Período', emptyPeriod: 'Sin datos.',
      startDate: 'Fecha Inicio', endDate: 'Fecha Fin',
      exportOptions: { excel: 'Descargar Excel (.csv)', pdf: 'Generar PDF' }
    },
    advisor: { title: 'IA Manager', subtitle: 'Asistente Inteligente', greeting: '¡Hola! ¿En qué ayudo?', intro: 'Pregunta sobre gastos, consejos o planificación.', actions: { analyze: 'Analizar gastos', save: 'Tips de ahorro' }, inputPlaceholder: 'Pregunta algo...', loading: 'Pensando...', error: 'Error de conexión.' },
    settings: { title: 'Ajustes', subtitle: 'Gestionar datos y preferencias', data: 'Gestión de Datos', categories: 'Categorías Personalizadas', addCategory: 'Agregar Categoría', export: 'Copia de Seguridad (JSON)', import: 'Restaurar Copia', importCsv: 'Importar Transacciones (CSV)', csvTemplate: 'Descargar Modelo CSV', clear: 'Borrar Todo', warning: 'Advertencia: Esta acción es irreversible.', successImport: '¡Datos restaurados con éxito!', successCsv: '¡Transacciones importadas!' },
    modal: { 
      title: 'Agregar Transacción', titleEdit: 'Editar Transacción',
      type: 'Tipo', amount: 'Monto Total', description: 'Descripción', category: 'Categoría', date: 'Fecha', 
      paymentMethod: 'Método de Pago', installments: 'Cuotas',
      types: { income: 'Ingreso', expense: 'Gasto' },
      methods: { cash: 'Efectivo', card: 'Tarjeta', transfer: 'Transferencia' },
      budgetStatus: 'Presupuesto de la categoría'
    },
    goalModal: { title: 'Nueva Meta', titleEdit: 'Editar Meta', name: 'Nombre', target: 'Monto Objetivo', current: 'Ahorrado Actual', icon: 'Ícono', color: 'Color' },
    notifications: { added: '¡Guardado con éxito!', updated: '¡Actualizado con éxito!', deleted: '¡Eliminado con éxito!' }
  },
  fr: {
    code: 'EUR',
    locale: 'fr-FR',
    common: { appName: 'Gestion Personnelle', add: '+ Transaction', save: 'Enregistrer', cancel: 'Annuler', edit: 'Modifier', delete: 'Supprimer', export: 'Exporter', print: 'Imprimir/PDF', filter: 'Filtrer' },
    menu: { dashboard: 'Tableau de bord', transactions: 'Transactions', calendar: 'Calendrier', reports: 'Rapports', budgets: 'Budgets', advisor: 'Conseiller IA', settings: 'Paramètres', theme: { light: 'Mode Clair', dark: 'Mode Sombre' }, logout: 'Quitter' },
    dashboard: { 
      title: 'Tableau de bord', subtitle: 'Aperçu financier', aiButton: 'Conseils IA', 
      cards: { balance: 'Solde Total', income: 'Revenus', expenses: 'Dépenses', trend: 'vs mois dernier', savingsRate: 'Taux d\'épargne', dailyAvg: 'Moyenne Quotidienne', projected: 'Projection Mensuelle' }, 
      recent: 'Récents', viewAll: 'Voir tout', goals: 'Mes Objectifs', addGoal: 'Nouvel Objectif', budgetAlert: 'Alerte Budget', 
      quickActions: { addIncome: 'Ajouter Revenu', addExpense: 'Ajouter Dépense' }
    },
    transactions: { 
      title: 'Transactions', subtitle: 'Gérez vos mouvements', search: 'Rechercher...', 
      table: { date: 'Date', description: 'Description', category: 'Catégorie', amount: 'Montant', method: 'Méthode' }, 
      empty: 'Aucune transaction trouvée.', 
      filters: { all: 'Tous', income: 'Revenus', expense: 'Dépenses' }, 
      ranges: { thisMonth: 'Ce Mois', lastMonth: 'Mois Dernier', last3Months: '3 Mois' },
      summary: { income: 'Revenus Filtrés', expense: 'Dépenses Filtrées', balance: 'Solde Période' }
    },
    calendar: { title: 'Calendrier Financier', subtitle: 'Visualisez les dépenses par jour', totalDay: 'Total du jour', prev: 'Préc', next: 'Suiv', today: 'Aujourd\'hui', details: 'Détails du jour' },
    budgets: { 
      title: 'Budgets Mensuels', subtitle: 'Définissez des limites et contrôlez les dépenses', 
      spent: 'Dépensé', remaining: 'Restant', limit: 'Limite', 
      status: { good: 'Bien', warning: 'Attention', danger: 'D dépassé' }, 
      setLimit: 'Définir la limite',
      daily: 'Dispo. / jour'
    },
    analytics: { 
      title: 'Analytique', subtitle: 'Analyse détaillée', distribution: 'Par Catégorie', activity: 'Activité Mensuelle', daily: 'Évolution Quotidienne', goals: 'Objectifs', adviceTitle: 'Aperçu', adviceText: 'Les dépenses alimentaires ont augmenté de 15%.', chartTotal: 'Total', period: 'Période', emptyPeriod: 'Aucune donnée.',
      startDate: 'Date de début', endDate: 'Date de fin',
      exportOptions: { excel: 'Télécharger Excel (.csv)', pdf: 'Générer PDF' }
    },
    advisor: { title: 'Gestion IA', subtitle: 'Assistant Intelligent', greeting: 'Bonjour !', intro: 'Posez des questions sur vos dépenses ou investissements.', actions: { analyze: 'Analyser dépenses', save: 'Conseils éco' }, inputPlaceholder: 'Posez une question...', loading: 'Analyse...', error: 'Erreur.' },
    settings: { title: 'Paramètres', subtitle: 'Gérer les données et préférences', data: 'Gestion des Données', categories: 'Catégories Personnalisées', addCategory: 'Ajouter Catégorie', export: 'Sauvegarde (JSON)', import: 'Restaurer', importCsv: 'Importer Transactions (CSV)', csvTemplate: 'Télécharger Modèle CSV', clear: 'Tout Effacer', warning: 'Attention : Cette action est irréversible.', successImport: 'Données restaurées avec succès !', successCsv: 'Transactions importées !' },
    modal: { 
      title: 'Ajouter Transaction', titleEdit: 'Modifier Transaction',
      type: 'Type', amount: 'Montant Total', description: 'Description', category: 'Catégorie', date: 'Date', 
      paymentMethod: 'Moyen de paiement', installments: 'Versements',
      types: { income: 'Revenu', expense: 'Dépense' },
      methods: { cash: 'Espèces', card: 'Carte', transfer: 'Virement' },
      budgetStatus: 'Budget de la catégorie'
    },
    goalModal: { title: 'Nouvel Objectif', titleEdit: 'Modifier Objectif', name: 'Nom', target: 'Montant Cible', current: 'Montant Actuel', icon: 'Icône', color: 'Couleur' },
    notifications: { added: 'Enregistré avec succès!', updated: 'Mis à jour avec succès!', deleted: 'Supprimé avec succès!' }
  },
  de: {
    code: 'EUR',
    locale: 'de-DE',
    common: { appName: 'Persönliche Finanzen', add: '+ Transaktion', save: 'Speichern', cancel: 'Abbrechen', edit: 'Bearbeiten', delete: 'Löschen', export: 'Exportieren', print: 'Drucken/PDF', filter: 'Filter' },
    menu: { dashboard: 'Übersicht', transactions: 'Transaktionen', calendar: 'Kalender', reports: 'Berichte', budgets: 'Budgets', advisor: 'KI-Berater', settings: 'Einstellungen', theme: { light: 'Heller Modus', dark: 'Dunkler Modus' }, logout: 'Abmelden' },
    dashboard: { 
      title: 'Dashboard', subtitle: 'Finanzüberblick', aiButton: 'KI Tipps', 
      cards: { balance: 'Gesamtsaldo', income: 'Einnahmen', expenses: 'Ausgaben', trend: 'vs Vormonat', savingsRate: 'Sparquote', dailyAvg: 'Tagesdurchschnitt', projected: 'Monatsprognose' }, 
      recent: 'Aktuell', viewAll: 'Alle ansehen', goals: 'Meine Ziele', addGoal: 'Neues Ziel', budgetAlert: 'Budgetwarnung', 
      quickActions: { addIncome: 'Einkommen hinzufügen', addExpense: 'Ausgabe hinzufügen' }
    },
    transactions: { 
      title: 'Transaktionen', subtitle: 'Bewegungen verwalten', search: 'Suchen...', 
      table: { date: 'Datum', description: 'Beschreibung', category: 'Kategorie', amount: 'Betrag', method: 'Methode' }, 
      empty: 'Keine Transaktionen gefunden.', 
      filters: { all: 'Alle', income: 'Einnahmen', expense: 'Ausgaben' }, 
      ranges: { thisMonth: 'Diesen Monat', lastMonth: 'Letzten Monat', last3Months: '3 Monate' },
      summary: { income: 'Gefilterte Einnahmen', expense: 'Gefilterte Ausgaben', balance: 'Saldo' }
    },
    calendar: { title: 'Finanzkalender', subtitle: 'Ausgaben nach Tag', totalDay: 'Tagesgesamtwert', prev: 'Zurück', next: 'Weiter', today: 'Heute', details: 'Tagesdetails' },
    budgets: { 
      title: 'Monatsbudgets', subtitle: 'Setzen Sie Limits für Kategorien', 
      spent: 'Ausgegeben', remaining: 'Verbleibend', limit: 'Limit', 
      status: { good: 'Gut', warning: 'Warnung', danger: 'Überschritten' }, 
      setLimit: 'Limit setzen',
      daily: 'Verfügbar / Tag'
    },
    analytics: { 
      title: 'Analytik', subtitle: 'Detaillierte Analyse', distribution: 'Nach Kategorie', activity: 'Monatliche Aktivität', daily: 'Tägliche Entwicklung', goals: 'Ziele', adviceTitle: 'Einblick', adviceText: 'Lebensmittelausgaben sind um 15% gestiegen.', chartTotal: 'Gesamt', period: 'Zeitraum', emptyPeriod: 'Keine Daten.',
      startDate: 'Startdatum', endDate: 'Enddatum',
      exportOptions: { excel: 'Excel herunterladen (.csv)', pdf: 'PDF erstellen' }
    },
    advisor: { title: 'KI Manager', subtitle: 'Smarter Assistent', greeting: 'Hallo!', intro: 'Fragen Sie nach Ausgaben oder Anlagetipps.', actions: { analyze: 'Ausgaben analysieren', save: 'Spartipps' }, inputPlaceholder: 'Frage stellen...', loading: 'Denken...', error: 'Fehler.' },
    settings: { title: 'Einstellungen', subtitle: 'Daten und Einstellungen verwalten', data: 'Datenverwaltung', categories: 'Benutzerdefinierte Kategorien', addCategory: 'Kategorie hinzufügen', export: 'Backup (JSON)', import: 'Wiederherstellen', importCsv: 'Transaktionen importieren (CSV)', csvTemplate: 'CSV-Vorlage herunterladen', clear: 'Alles löschen', warning: 'Warnung: Diese Aktion ist irreversibel.', successImport: 'Daten erfolgreich wiederhergestellt!', successCsv: 'Transaktionen importiert!' },
    modal: { 
      title: 'Transaktion hinzufügen', titleEdit: 'Transaktion bearbeiten',
      type: 'Typ', amount: 'Gesamtbetrag', description: 'Beschreibung', category: 'Kategorie', date: 'Datum', 
      paymentMethod: 'Zahlungsmethode', installments: 'Raten',
      types: { income: 'Einnahme', expense: 'Ausgabe' },
      methods: { cash: 'Bar', card: 'Karte', transfer: 'Überweisung' },
      budgetStatus: 'Kategoriebudget'
    },
    goalModal: { title: 'Neues Ziel', titleEdit: 'Ziel bearbeiten', name: 'Name', target: 'Zielbetrag', current: 'Aktuell', icon: 'Symbol', color: 'Farbe' },
    notifications: { added: 'Erfolgreich gespeichert!', updated: 'Erfolgreich aktualisiert!', deleted: 'Erfolgreich gelöscht!' }
  }
};

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private notificationService = inject(NotificationService);

  // State
  readonly transactions = signal<Transaction[]>([]);
  readonly currentUser = signal<User>({ name: 'Visitante', email: 'demo@finwise.app', plan: 'Premium' });
  readonly goals = signal<Goal[]>([]);
  readonly budgets = signal<Budget[]>([]);
  readonly categories = signal<Category[]>(DEFAULT_CATEGORIES);
  
  readonly darkMode = signal<boolean>(false);
  readonly language = signal<Language>('pt');
  
  // Modal States
  readonly isModalOpen = signal<boolean>(false);
  readonly transactionToEdit = signal<Partial<Transaction> | null>(null);
  readonly isGoalModalOpen = signal<boolean>(false);
  readonly goalToEdit = signal<Goal | null>(null);

  // Derived State
  readonly dict = computed(() => TRANSLATIONS[this.language()]);
  readonly currencyCode = computed(() => TRANSLATIONS[this.language()].code);
  readonly localeCode = computed(() => TRANSLATIONS[this.language()].locale);

  readonly totalBalance = computed(() => {
    return this.transactions().reduce((acc, t) => {
      return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, 0);
  });

  readonly monthlyIncome = computed(() => {
    const now = new Date();
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

  readonly dailyAverage = computed(() => {
     const expenses = this.monthlyExpenses();
     const today = new Date().getDate();
     return expenses / Math.max(1, today);
  });

  readonly savingsRate = computed(() => {
     const income = this.monthlyIncome();
     const expenses = this.monthlyExpenses();
     if (income <= 0) return 0;
     const rate = ((income - expenses) / income) * 100;
     return Math.max(0, rate);
  });

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

    if (lastBalanceChange === 0) return 0;
    return ((currentBalanceChange - lastBalanceChange) / Math.abs(lastBalanceChange)) * 100;
  });

  readonly expensesByCategory = computed(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const expenses = this.transactions().filter(t => {
      const d = new Date(t.date);
      return t.type === 'expense' && d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
    const map = new Map<string, number>();
    expenses.forEach(t => {
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    });
    return Array.from(map, ([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  });

  constructor() {
    this.loadFromStorage();
    this.checkSystemTheme();
    effect(() => { this.saveToStorage(); });
  }

  private saveToStorage() {
    try {
      const data = {
        transactions: this.transactions(),
        goals: this.goals(),
        budgets: this.budgets(),
        categories: this.categories(),
        user: this.currentUser(),
        lang: this.language(),
        theme: this.darkMode()
      };
      localStorage.setItem('finwise_data', JSON.stringify(data));
    } catch (e) { console.error('Save error', e); }
  }

  private loadFromStorage() {
    try {
      const raw = localStorage.getItem('finwise_data');
      if (raw) {
        const data = JSON.parse(raw);
        if (Array.isArray(data.transactions)) this.transactions.set(data.transactions);
        if (Array.isArray(data.goals)) this.goals.set(data.goals);
        if (Array.isArray(data.budgets)) this.budgets.set(data.budgets); else this.initializeDefaultBudgets();
        if (Array.isArray(data.categories)) this.categories.set(data.categories); else this.categories.set(DEFAULT_CATEGORIES);
        if (data.user && typeof data.user === 'object') this.currentUser.set(data.user);
        if (data.lang && typeof data.lang === 'string') this.language.set(data.lang as Language);
        if (data.theme !== undefined) {
           this.darkMode.set(!!data.theme);
           this.applyTheme(!!data.theme);
        }
      } else {
        this.categories.set(DEFAULT_CATEGORIES);
        this.initializeDefaultBudgets();
      }
    } catch (e) {
      console.error('Load error - Resetting defaults', e);
      this.categories.set(DEFAULT_CATEGORIES);
      this.initializeDefaultBudgets();
    }
  }

  private initializeDefaultBudgets() {
    this.budgets.set(this.categories().map(cat => ({ categoryId: cat.id, limit: 1000 })));
  }

  exportData() {
    const data = { transactions: this.transactions(), goals: this.goals(), budgets: this.budgets(), categories: this.categories(), user: this.currentUser(), exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finwise_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  }

  importData(jsonString: string) {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.transactions)) this.transactions.set(data.transactions);
      if (Array.isArray(data.goals)) this.goals.set(data.goals);
      if (Array.isArray(data.budgets)) this.budgets.set(data.budgets);
      if (Array.isArray(data.categories)) this.categories.set(data.categories);
      if (data.user) this.currentUser.set(data.user);
      this.notificationService.show(this.dict().settings.successImport, 'success');
    } catch (e) { this.notificationService.show('Invalid JSON file.', 'error'); }
  }

  downloadCSVTemplate() {
     const headers = ['Date (YYYY-MM-DD)', 'Description', 'Category', 'Amount', 'Type (income/expense)'];
     const example = ['2023-10-01', 'Supermercado', 'Alimentação', '150.50', 'expense'];
     const csvContent = [headers.join(','), example.join(',')].join('\n');
     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
     const url = URL.createObjectURL(blob);
     const link = document.createElement('a');
     link.href = url;
     link.download = 'finwise_template.csv';
     link.click();
  }

  importFromCSV(csvText: string) {
    try {
      const lines = csvText.split('\n');
      const newTransactions: Transaction[] = [];
      for(let i=1; i<lines.length; i++) {
         const line = lines[i].trim();
         if (!line) continue;
         const cols = line.split(',');
         if (cols.length >= 5) {
            const date = cols[0].trim();
            const description = cols[1].trim();
            const category = cols[2].trim();
            const amountStr = cols[3].trim();
            const typeStr = cols[4].trim().toLowerCase();
            if (date.match(/^\d{4}-\d{2}-\d{2}$/) && !isNaN(parseFloat(amountStr)) && (typeStr === 'income' || typeStr === 'expense')) {
               newTransactions.push({ id: crypto.randomUUID(), date, description, category, amount: Math.abs(parseFloat(amountStr)), type: typeStr as 'income' | 'expense', paymentMethod: 'cash' });
            }
         }
      }
      if (newTransactions.length > 0) {
         this.transactions.update(prev => [...prev, ...newTransactions]);
         this.notificationService.show(this.dict().settings.successCsv, 'success');
      } else { this.notificationService.show('No valid transactions found in CSV.', 'error'); }
    } catch (e) { this.notificationService.show('Error parsing CSV.', 'error'); }
  }

  clearAllData() {
    this.transactions.set([]);
    this.goals.set([]);
    this.categories.set(DEFAULT_CATEGORIES);
    this.initializeDefaultBudgets();
    localStorage.removeItem('finwise_data');
    this.notificationService.show('Todos os dados foram apagados.', 'info');
  }

  populateWithDemoData() {
    this.clearAllData();
    const today = new Date();
    const demoTransactions: Transaction[] = [
      { id: crypto.randomUUID(), date: this.formatDate(today, 0), description: 'Salário Mensal', category: 'Receitas', amount: 5500, type: 'income', paymentMethod: 'transfer' },
      { id: crypto.randomUUID(), date: this.formatDate(today, -1), description: 'Aluguel', category: 'Habitação', amount: 1500, type: 'expense', paymentMethod: 'transfer' },
      { id: crypto.randomUUID(), date: this.formatDate(today, -2), description: 'Supermercado da Semana', category: 'Alimentação', amount: 375.50, type: 'expense', paymentMethod: 'card' },
      { id: crypto.randomUUID(), date: this.formatDate(today, -2), description: 'Jantar com Amigos', category: 'Restaurantes', amount: 180.00, type: 'expense', paymentMethod: 'card' },
      { id: crypto.randomUUID(), date: this.formatDate(today, -3), description: 'Conta de Internet', category: 'Habitação', amount: 99.90, type: 'expense', paymentMethod: 'transfer' },
      { id: crypto.randomUUID(), date: this.formatDate(today, -4), description: 'Gasolina', category: 'Transporte', amount: 150.00, type: 'expense', paymentMethod: 'card' },
      { id: crypto.randomUUID(), date: this.formatDate(today, -5), description: 'Ingressos de Cinema', category: 'Lazer', amount: 75.00, type: 'expense', paymentMethod: 'card' },
      { id: crypto.randomUUID(), date: this.formatDate(today, -6), description: 'Farmácia', category: 'Saúde', amount: 85.25, type: 'expense', paymentMethod: 'cash' },
      { id: crypto.randomUUID(), date: this.formatDate(today, -7), description: 'Livro de Programação', category: 'Educação', amount: 120.00, type: 'expense', paymentMethod: 'card' },
      { id: crypto.randomUUID(), date: this.formatDate(today, -8), description: 'Camiseta Nova', category: 'Compras', amount: 95.00, type: 'expense', paymentMethod: 'card' },
      { id: crypto.randomUUID(), date: this.formatDate(today, -10), description: 'Rendimento de Ações', category: 'Investimentos', amount: 250.75, type: 'income', paymentMethod: 'transfer' },
    ];
    this.transactions.set(demoTransactions);
    this.goals.set([
      { id: '1', name: 'Viagem para o Japão', targetAmount: 25000, currentAmount: 8500, icon: 'flight', color: 'bg-red-500' },
      { id: '2', name: 'Fundo de Emergência', targetAmount: 15000, currentAmount: 11200, icon: 'savings', color: 'bg-emerald-500' },
      { id: '3', name: 'Carro Novo', targetAmount: 60000, currentAmount: 21000, icon: 'directions_car', color: 'bg-blue-500' },
    ]);
    this.budgets.set([
      { categoryId: 'Alimentação', limit: 800 },
      { categoryId: 'Restaurantes', limit: 500 },
      { categoryId: 'Transporte', limit: 400 },
      { categoryId: 'Lazer', limit: 350 },
      { categoryId: 'Compras', limit: 450 },
    ]);
    this.notificationService.show('Modo demonstração ativado!', 'success');
  }

  private formatDate(date: Date, dayOffset: number): string {
    const d = new Date(date);
    d.setDate(d.getDate() + dayOffset);
    return d.toISOString().split('T')[0];
  }

  toggleTheme() { this.darkMode.update(v => !v); this.applyTheme(this.darkMode()); }
  private applyTheme(isDark: boolean) { document.documentElement.classList.toggle('dark', isDark); }
  setLanguage(lang: Language) { this.language.set(lang); }
  private checkSystemTheme() { if (!localStorage.getItem('finwise_data') && window.matchMedia?.('(prefers-color-scheme: dark)').matches) { this.darkMode.set(true); this.applyTheme(true); } }

  registerUser(name: string, email: string) { this.currentUser.set({ name, email, plan: 'Free' }); this.notificationService.show(`Bem-vindo, ${name}!`, 'success'); }

  openModal(transaction?: Partial<Transaction>) { this.transactionToEdit.set(transaction || null); this.isModalOpen.set(true); }
  closeModal() { this.isModalOpen.set(false); this.transactionToEdit.set(null); }
  openGoalModal(goal?: Goal) { this.goalToEdit.set(goal || null); this.isGoalModalOpen.set(true); }
  closeGoalModal() { this.isGoalModalOpen.set(false); this.goalToEdit.set(null); }

  addTransaction(t: Omit<Transaction, 'id'>) {
    const newT: Transaction[] = [];
    if (t.type === 'expense' && t.paymentMethod === 'card' && t.installments && t.installments > 1) {
      const installmentAmount = t.amount / t.installments;
      const baseDate = new Date(t.date + 'T12:00:00'); 
      const groupId = crypto.randomUUID();
      for (let i = 0; i < t.installments; i++) {
        const date = new Date(baseDate);
        date.setMonth(date.getMonth() + i);
        if (date.getDate() !== baseDate.getDate()) date.setDate(0); 
        newT.push({ ...t, id: crypto.randomUUID(), amount: installmentAmount, date: date.toISOString().split('T')[0], description: `${t.description} (${i + 1}/${t.installments})`, installmentId: groupId });
      }
    } else { newT.push({ ...t, id: crypto.randomUUID() }); }
    this.transactions.update(prev => [...newT, ...prev]);
    this.notificationService.show(this.dict().notifications.added, 'success');
  }

  updateTransaction(t: Transaction) { this.transactions.update(prev => prev.map(item => item.id === t.id ? t : item)); this.notificationService.show(this.dict().notifications.updated, 'success'); }
  deleteTransaction(id: string) { this.transactions.update(prev => prev.filter(t => t.id !== id)); this.notificationService.show(this.dict().notifications.deleted, 'info'); }

  addGoal(g: Omit<Goal, 'id'>) { this.goals.update(prev => [...prev, { ...g, id: crypto.randomUUID() }]); this.notificationService.show(this.dict().notifications.added, 'success'); }
  updateGoal(g: Goal) { this.goals.update(prev => prev.map(item => item.id === g.id ? g : item)); this.notificationService.show(this.dict().notifications.updated, 'success'); }
  deleteGoal(id: string) { this.goals.update(prev => prev.filter(g => g.id !== id)); this.notificationService.show(this.dict().notifications.deleted, 'info'); }

  updateBudgetLimit(categoryId: string, limit: number) {
    this.budgets.update(prev => {
      const existing = prev.find(b => b.categoryId === categoryId);
      if (existing) return prev.map(b => b.categoryId === categoryId ? { ...b, limit } : b);
      return [...prev, { categoryId, limit }];
    });
    this.notificationService.show(this.dict().notifications.updated, 'success');
  }

  addCategory(name: string, icon: string, color: string) {
    if (this.categories().find(c => c.id.toLowerCase() === name.toLowerCase())) { this.notificationService.show('Categoria já existe', 'error'); return; }
    this.categories.update(prev => [...prev, { id: name, icon, color }]);
    this.notificationService.show('Categoria adicionada', 'success');
  }

  deleteCategory(id: string) { this.categories.update(prev => prev.filter(c => c.id !== id)); this.notificationService.show('Categoria removida', 'info'); }
}