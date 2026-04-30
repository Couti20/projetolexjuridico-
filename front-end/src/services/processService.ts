import { api } from './api';

export type ProcessStatus = 'critico' | 'atencao' | 'normal';

export interface ProcessItem {
  id: string;
  number: string;
  court: string;
  claimant: string;
  defendant: string;
  district: string;
  status: ProcessStatus;
  latestMovementAt: string;
  latestMovementTitle: string;
}

export interface ProcessMovement {
  id: string;
  datetime: string;
  title: string;
  description: string;
  sourceUrl: string;
}

interface ProcessDataset {
  processes: ProcessItem[];
  movementsByProcess: Record<string, ProcessMovement[]>;
  checklistByProcess: Record<string, string[]>;
}

function cloneData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const DATASET: ProcessDataset = {
  processes: [
    {
      id: '1002345-67-2023-8-26-0100',
      number: '1002345-67.2023.8.26.0100',
      court: 'TJSP',
      claimant: 'João da Silva',
      defendant: 'Banco Exemplo S.A.',
      district: '2ª Vara Cível - Foro Central de São Paulo',
      status: 'critico',
      latestMovementAt: '15/04/2026 14:30',
      latestMovementTitle: 'Expedição de Intimação',
    },
    {
      id: '1045231-88-2024-8-26-0100',
      number: '1045231-88.2024.8.26.0100',
      court: 'TJSP',
      claimant: 'Maria Oliveira',
      defendant: 'Seguradora Foco S.A.',
      district: '7ª Vara Cível - Foro Central de São Paulo',
      status: 'atencao',
      latestMovementAt: '14/04/2026 10:10',
      latestMovementTitle: 'Juntada de Documento',
    },
    {
      id: '2010456-90-2025-8-26-0001',
      number: '2010456-90.2025.8.26.0001',
      court: 'TJSP',
      claimant: 'Carlos Mendes',
      defendant: 'Empresa XPTO Ltda.',
      district: '1ª Vara Cível - Foro Regional de Santana',
      status: 'normal',
      latestMovementAt: '11/04/2026 09:40',
      latestMovementTitle: 'Conclusos para despacho',
    },
  ],
  movementsByProcess: {
    '1002345-67-2023-8-26-0100': [
      {
        id: 'm1',
        datetime: '15/04/2026 - 14:30',
        title: 'Expedição de Intimação',
        description: 'Para manifestação sobre o laudo pericial juntado às fls. 450/480.',
        sourceUrl: 'https://esaj.tjsp.jus.br',
      },
      {
        id: 'm2',
        datetime: '10/04/2026 - 09:15',
        title: 'Juntada de Laudo Pericial',
        description: 'Laudo técnico do perito judicial Sr. Marcos Pontes.',
        sourceUrl: 'https://esaj.tjsp.jus.br',
      },
      {
        id: 'm3',
        datetime: '02/04/2026 - 16:45',
        title: 'Decisão - Saneador',
        description: 'Deferida a produção de prova pericial e documental.',
        sourceUrl: 'https://esaj.tjsp.jus.br',
      },
    ],
  },
  checklistByProcess: {
    '1002345-67-2023-8-26-0100': [
      'Analisar laudo pericial',
      'Consultar assistente técnico',
      'Protocolar petição (Réplica)',
    ],
  },
};

export const processService = {
  async listProcesses(): Promise<ProcessItem[]> {
    return api.get('/processes', () => cloneData(DATASET.processes));
  },

  async listMovementsMap(): Promise<Record<string, ProcessMovement[]>> {
    return api.get('/processes/movements', () => cloneData(DATASET.movementsByProcess));
  },

  async listChecklistMap(): Promise<Record<string, string[]>> {
    return api.get('/processes/checklist', () => cloneData(DATASET.checklistByProcess));
  },
};
