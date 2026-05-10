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

export const dashboardService = {
  /**
   * Busca o resumo do painel do advogado.
   * Backend: GET /dashboard
   */
  async getOverview(): Promise<DashboardOverview> {
    return api.get<DashboardOverview>('/dashboard');
  },
};
