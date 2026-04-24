export interface WeekDataPoint {
  name: string;
  prazos: number;
  fill: string;
  isPico?: boolean;
}

export const weekData: WeekDataPoint[] = [
  { name: 'Seg', prazos: 4,  fill: 'rgba(255,255,255,0.1)' },
  { name: 'Ter', prazos: 7,  fill: 'rgba(255,255,255,0.2)' },
  { name: 'Qua', prazos: 15, fill: '#3B82F6', isPico: true },
  { name: 'Qui', prazos: 6,  fill: 'rgba(255,255,255,0.15)' },
  { name: 'Sex', prazos: 3,  fill: 'rgba(255,255,255,0.08)' },
];
