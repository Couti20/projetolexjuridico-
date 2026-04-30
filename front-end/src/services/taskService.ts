import { api } from './api';

export type TaskStatus = 'pending' | 'done';
export type TaskPriority = 'critica' | 'alta' | 'normal';
export type TaskType = 'prazo' | 'rotina';

export interface DayTask {
  id: string;
  title: string;
  context: string;
  dueText: string;
  dueAt: number | null;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  focusMinutes: number;
  snoozedUntil?: number;
}

function makeDueAt(day: number, month: number): number {
  const now = new Date();
  return new Date(now.getFullYear(), month - 1, day, 18, 0, 0).getTime();
}

const DEFAULT_DAILY_TASKS: DayTask[] = [
  {
    id: 'task-critical-001',
    title: 'Manifestacao sobre provas',
    context: 'Proc. 1002345-67',
    dueText: 'Vence amanha (18/04)',
    dueAt: makeDueAt(18, 4),
    type: 'prazo',
    priority: 'critica',
    status: 'pending',
    focusMinutes: 25,
  },
  {
    id: 'task-002',
    title: 'Protocolar Recurso Ordinario',
    context: 'Proc. 0001234-89',
    dueText: 'Prazo: 22/04',
    dueAt: makeDueAt(22, 4),
    type: 'prazo',
    priority: 'alta',
    status: 'pending',
    focusMinutes: 12,
  },
  {
    id: 'task-003',
    title: 'Enviar checklist via WhatsApp para cliente',
    context: 'Caso Silva',
    dueText: 'Rotina',
    dueAt: null,
    type: 'rotina',
    priority: 'normal',
    status: 'pending',
    focusMinutes: 8,
  },
  {
    id: 'task-004',
    title: 'Leitura de publicacoes DJE - TJSP',
    context: '17/04',
    dueText: 'Concluido',
    dueAt: null,
    type: 'rotina',
    priority: 'normal',
    status: 'done',
    focusMinutes: 45,
  },
];

function cloneData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isValidTask(candidate: unknown): candidate is DayTask {
  if (!candidate || typeof candidate !== 'object') return false;
  const item = candidate as Record<string, unknown>;

  return (
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.context === 'string' &&
    typeof item.dueText === 'string' &&
    (item.dueAt === null || typeof item.dueAt === 'number') &&
    (item.type === 'prazo' || item.type === 'rotina') &&
    (item.priority === 'critica' || item.priority === 'alta' || item.priority === 'normal') &&
    (item.status === 'pending' || item.status === 'done') &&
    typeof item.focusMinutes === 'number' &&
    (item.snoozedUntil === undefined || typeof item.snoozedUntil === 'number')
  );
}

export const taskService = {
  async listDailyTasks(): Promise<DayTask[]> {
    return api.get('/tasks/daily', () => cloneData(DEFAULT_DAILY_TASKS));
  },

  parseStoredTasks(raw: string | null, fallback: DayTask[]): DayTask[] {
    if (!raw) return fallback;

    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return fallback;

      const validTasks = parsed.filter(isValidTask);
      return validTasks.length > 0 ? validTasks : fallback;
    } catch (error) {
      console.error('Nao foi possivel restaurar tarefas salvas do storage.', error);
      return fallback;
    }
  },
};
