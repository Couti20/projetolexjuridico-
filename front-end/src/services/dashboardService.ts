import { api } from './api';

export interface DashboardWeekLoad {
  day: string;
  date: number;
  count: number;
  peak: boolean;
}

export interface DashboardOverview {
  criticalCount24h: number;
  attentionCount72h: number;
  futureCount30d: number;
  weekLoad: DashboardWeekLoad[];
  todayIndex: number;
  aiInsight: string;
  activeProcessesCount: number;
  nextTask: {
    processId: string;
    title: string;
    reason: string;
  };
}

function cloneData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const DASHBOARD_DATASET: DashboardOverview = {
  criticalCount24h: 3,
  attentionCount72h: 12,
  futureCount30d: 45,
  weekLoad: [
    { day: 'SEG', date: 18, count: 18, peak: false },
    { day: 'TER', date: 19, count: 19, peak: false },
    { day: 'QUA', date: 20, count: 29, peak: true },
    { day: 'QUI', date: 21, count: 14, peak: false },
    { day: 'SEX', date: 22, count: 11, peak: false },
    { day: 'SAB', date: 23, count: 4, peak: false },
    { day: 'DOM', date: 24, count: 2, peak: false },
  ],
  todayIndex: 0,
  aiInsight: 'Quarta-feira será seu dia mais carregado. Tente antecipar 2 prazos hoje para equilibrar a carga da semana.',
  activeProcessesCount: 45,
  nextTask: {
    processId: '1002345-67-2023-8-26-0100',
    title: 'Réplica do Processo 1002345-67',
    reason: 'É o prazo mais complexo da sua semana (Pico na Quarta).',
  },
};

export const dashboardService = {
  async getOverview(): Promise<DashboardOverview> {
    return api.get('/dashboard/overview', () => cloneData(DASHBOARD_DATASET));
  },
};
