import type { ProcessItem } from '../../services/processService';

export function normalizeProcessSearchQuery(value: string): string {
  return value.trim().toLowerCase();
}

export function processMatchesSearch(
  process: Pick<ProcessItem, 'number' | 'claimant' | 'defendant'>,
  query: string,
): boolean {
  const normalized = normalizeProcessSearchQuery(query);

  if (!normalized) return true;

  return [process.number, process.claimant, process.defendant].some((field) =>
    field.toLowerCase().includes(normalized),
  );
}