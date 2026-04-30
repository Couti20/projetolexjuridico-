import type { ProcessMovement, ProcessStatus } from '../../services/processService';

export type ProcessSort = 'urgencia' | 'movimentacao' | 'numero';

export const PROCESS_FILTER_STORAGE_KEY = 'lex-processes-filter';
export const PROCESS_SORT_STORAGE_KEY = 'lex-processes-sort';
export const PROCESS_MOVEMENT_READ_STORAGE_KEY = 'lex-processes-movement-read';
export const PROCESS_MOVEMENT_NOTES_STORAGE_KEY = 'lex-processes-movement-notes';

export const STATUS_PRIORITY: Record<ProcessStatus, number> = {
  critico: 0,
  atencao: 1,
  normal: 2,
};

export function parsePtBrDateTime(value: string): number {
  const [datePart, timePart = '00:00'] = value.split(' ');
  const [day, month, year] = datePart.split('/').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);

  if (!day || !month || !year) return 0;
  return new Date(year, month - 1, day, hour ?? 0, minute ?? 0).getTime();
}

export function statusBadgeClasses(status: ProcessStatus): string {
  if (status === 'critico') return 'bg-red-50 text-red-700 border-red-200';
  if (status === 'atencao') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
}

export function statusLabel(status: ProcessStatus): string {
  if (status === 'critico') return 'Crítico';
  if (status === 'atencao') return 'Atenção';
  return 'Normal';
}

export function isUrgentMovement(movement: ProcessMovement): boolean {
  const content = `${movement.title} ${movement.description}`.toLowerCase();
  return /intimação|prazo|manifestação|expedição/.test(content);
}

export function getStoredBooleanMap(key: string): Record<string, boolean> {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};

    const map: Record<string, boolean> = {};
    for (const [entryKey, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === 'boolean') {
        map[entryKey] = value;
      }
    }
    return map;
  } catch (error) {
    console.error('Não foi possível restaurar o status de leitura das movimentações.', error);
    return {};
  }
}

export function getStoredStringMap(key: string): Record<string, string> {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};

    const map: Record<string, string> = {};
    for (const [entryKey, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === 'string') {
        map[entryKey] = value;
      }
    }
    return map;
  } catch (error) {
    console.error('Não foi possível restaurar as observações das movimentações.', error);
    return {};
  }
}
