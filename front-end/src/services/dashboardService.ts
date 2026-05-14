import { api } from './api';
import { isAdminToken } from './adminAuth';

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
    const token = window.localStorage.getItem('lex-auth-token');
    if (isAdminToken(token)) {
      return {
        criticalCount24h: 3,
        attentionCount72h: 7,
        futureCount30d: 18,
        weekLoad: [
          { day: 'Seg', date: 12, count: 2, peak: false },
          { day: 'Ter', date: 13, count: 4, peak: true },
          { day: 'Qua', date: 14, count: 3, peak: false },
          { day: 'Qui', date: 15, count: 1, peak: false },
          { day: 'Sex', date: 16, count: 5, peak: true },
          { day: 'Sáb', date: 17, count: 0, peak: false },
          { day: 'Dom', date: 18, count: 1, peak: false },
        ],
        todayIndex: 1,
        aiInsight: 'Admin global ativo. As áreas privadas estão liberadas para validação do fluxo completo.',
        activeProcessesCount: 42,
        nextTask: {
          processId: '1002345-67-2023-8-26-0100',
          title: 'Manifestação sobre provas',
          reason: 'é o prazo mais urgente do momento',
        },
      };
    }
    return api.get<DashboardOverview>('/dashboard');
  },
};
