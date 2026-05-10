import { api } from './api';
import { isAdminToken } from './adminAuth';

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
      district: '2ª Vara Cível — Foro Central de São Paulo',
      status: 'critico',
      latestMovementAt: '08/05/2026 14:30',
      latestMovementTitle: 'Expedição de Intimação — prazo 5 dias',
    },
    {
      id: '1045231-88-2024-8-26-0100',
      number: '1045231-88.2024.8.26.0100',
      court: 'TJSP',
      claimant: 'Maria Oliveira',
      defendant: 'Seguradora Foco S.A.',
      district: '7ª Vara Cível — Foro Central de São Paulo',
      status: 'atencao',
      latestMovementAt: '07/05/2026 10:10',
      latestMovementTitle: 'Juntada de Documento pelo Réu',
    },
    {
      id: '2010456-90-2025-8-26-0001',
      number: '2010456-90.2025.8.26.0001',
      court: 'TJSP',
      claimant: 'Carlos Mendes',
      defendant: 'Empresa XPTO Ltda.',
      district: '1ª Vara Cível — Foro Regional de Santana',
      status: 'normal',
      latestMovementAt: '05/05/2026 09:40',
      latestMovementTitle: 'Conclusos para despacho',
    },
    {
      id: '5003821-44-2022-8-26-0100',
      number: '5003821-44.2022.8.26.0100',
      court: 'TJSP',
      claimant: 'Ana Paula Ferreira',
      defendant: 'Construtora Horizonte Ltda.',
      district: '3ª Vara Cível — Foro Regional de Santo Amaro',
      status: 'critico',
      latestMovementAt: '09/05/2026 08:00',
      latestMovementTitle: 'Decisão — Agravo de Instrumento admitido',
    },
    {
      id: '0015673-21-2024-4-03-6100',
      number: '0015673-21.2024.4.03.6100',
      court: 'TRF3',
      claimant: 'Roberto Souza',
      defendant: 'União Federal',
      district: '14ª Vara Federal Cível — São Paulo',
      status: 'atencao',
      latestMovementAt: '06/05/2026 16:20',
      latestMovementTitle: 'Citação — prazo 15 dias para contestar',
    },
    {
      id: '1000998-55-2023-5-02-0461',
      number: '1000998-55.2023.5.02.0461',
      court: 'TRT2',
      claimant: 'Fernanda Lima',
      defendant: 'Comércio Ativo S.A.',
      district: '46ª Vara do Trabalho — São Paulo',
      status: 'normal',
      latestMovementAt: '02/05/2026 11:55',
      latestMovementTitle: 'Pauta de audiência designada',
    },
    {
      id: '3021456-78-2025-8-26-0053',
      number: '3021456-78.2025.8.26.0053',
      court: 'TJSP',
      claimant: 'Pedro Alves',
      defendant: 'Plano Saúde Vitallis S.A.',
      district: '2ª Vara Cível — Foro de Pinheiros',
      status: 'normal',
      latestMovementAt: '28/04/2026 14:00',
      latestMovementTitle: 'Despacho — aguardando laudo médico',
    },
  ],

  movementsByProcess: {
    '1002345-67-2023-8-26-0100': [
      {
        id: 'm1a',
        datetime: '08/05/2026 - 14:30',
        title: 'Expedição de Intimação',
        description: 'Intimação para manifestação sobre o laudo pericial juntado às fls. 450/480. Prazo: 5 dias úteis.',
        sourceUrl: 'https://esaj.tjsp.jus.br',
      },
      {
        id: 'm1b',
        datetime: '02/05/2026 - 09:15',
        title: 'Juntada de Laudo Pericial',
        description: 'Laudo técnico do perito judicial Sr. Marcos Pontes — conclusão favorável ao autor.',
        sourceUrl: 'https://esaj.tjsp.jus.br',
      },
      {
        id: 'm1c',
        datetime: '18/04/2026 - 16:45',
        title: 'Decisão — Saneador',
        description: 'Deferida a produção de prova pericial e documental.',
        sourceUrl: 'https://esaj.tjsp.jus.br',
      },
      {
        id: 'm1d',
        datetime: '03/04/2026 - 10:00',
        title: 'Petição Protocolada — Impugnação à Contestação',
        description: 'Peça protocolada pelo autor rebatendo os argumentos da defesa do réu.',
        sourceUrl: 'https://esaj.tjsp.jus.br',
      },
    ],
    '1045231-88-2024-8-26-0100': [
      {
        id: 'm2a',
        datetime: '07/05/2026 - 10:10',
        title: 'Juntada de Documento pelo Réu',
        description: 'Seguradora juntou apólice e cálculo de cobertura contestando os valores pleiteados.',
        sourceUrl: 'https://esaj.tjsp.jus.br',
      },
      {
        id: 'm2b',
        datetime: '22/04/2026 - 15:00',
        title: 'Contestação Protocolada',
        description: 'Réu protocolou contestação dentro do prazo. Aguarda réplica do autor.',
        sourceUrl: 'https://esaj.tjsp.jus.br',
      },
      {
        id: 'm2c',
        datetime: '01/04/2026 - 09:30',
        title: 'Despacho — Citação Realizada',
        description: 'Certidão de citação juntada. Prazo de 15 dias para contestar iniciado.',
        sourceUrl: 'https://esaj.tjsp.jus.br',
      },
    ],
    '2010456-90-2025-8-26-0001': [
      {
        id: 'm3a',
        datetime: '05/05/2026 - 09:40',
        title: 'Conclusos para despacho',
        description: 'Processo enviado ao juiz para análise e despacho sobre requerimento de tutela antecipada.',
        sourceUrl: 'https://esaj.tjsp.jus.br',
      },
      {
        id: 'm3b',
        datetime: '28/04/2026 - 11:20',
        title: 'Petição — Tutela Antecipada',
        description: 'Autor requereu tutela antecipada para obrigar réu a cumprir contrato imediatamente.',
        sourceUrl: 'https://esaj.tjsp.jus.br',
      },
    ],
    '5003821-44-2022-8-26-0100': [
      {
        id: 'm4a',
        datetime: '09/05/2026 - 08:00',
        title: 'Decisão — Agravo de Instrumento admitido',
        description: 'Tribunal admitiu o agravo. Prazo de 15 dias para contrarrazões. URGENTE.',
        sourceUrl: 'https://esaj.tjsp.jus.br',
      },
      {
        id: 'm4b',
        datetime: '30/04/2026 - 14:00',
        title: 'Interposição de Agravo de Instrumento',
        description: 'Réu interpôs agravo contra decisão que deferiu tutela de urgência ao autor.',
        sourceUrl: 'https://esaj.tjsp.jus.br',
      },
      {
        id: 'm4c',
        datetime: '22/04/2026 - 10:30',
        title: 'Decisão — Tutela de Urgência Deferida',
        description: 'Juiz deferiu tutela de urgência determinando entrega imediata das chaves do imóvel.',
        sourceUrl: 'https://esaj.tjsp.jus.br',
      },
    ],
    '0015673-21-2024-4-03-6100': [
      {
        id: 'm5a',
        datetime: '06/05/2026 - 16:20',
        title: 'Citação — prazo 15 dias para contestar',
        description: 'União Federal citada para apresentar contestação em ação de repetição de indébito tributário.',
        sourceUrl: 'https://www.trf3.jus.br',
      },
      {
        id: 'm5b',
        datetime: '10/04/2026 - 09:00',
        title: 'Despacho — Petição Inicial Recebida',
        description: 'Juíza determinou emenda à inicial para juntar documentos comprobatórios do recolhimento.',
        sourceUrl: 'https://www.trf3.jus.br',
      },
    ],
    '1000998-55-2023-5-02-0461': [
      {
        id: 'm6a',
        datetime: '02/05/2026 - 11:55',
        title: 'Pauta de audiência designada',
        description: 'Audiência de instrução e julgamento marcada para 15/07/2026 às 14h.',
        sourceUrl: 'https://www.trt2.jus.br',
      },
      {
        id: 'm6b',
        datetime: '14/04/2026 - 10:00',
        title: 'Contestação da Reclamada',
        description: 'Empresa apresentou contestação negando vínculo empregatício e verbas rescisórias.',
        sourceUrl: 'https://www.trt2.jus.br',
      },
      {
        id: 'm6c',
        datetime: '01/03/2026 - 09:00',
        title: 'Reclamação Trabalhista Distribuída',
        description: 'Reclamação por verbas rescisórias, horas extras e dano moral distribuída à 46ª VT.',
        sourceUrl: 'https://www.trt2.jus.br',
      },
    ],
    '3021456-78-2025-8-26-0053': [
      {
        id: 'm7a',
        datetime: '28/04/2026 - 14:00',
        title: 'Despacho — aguardando laudo médico',
        description: 'Juiz determinou que autor junte laudo médico atualizado em 30 dias.',
        sourceUrl: 'https://esaj.tjsp.jus.br',
      },
      {
        id: 'm7b',
        datetime: '15/04/2026 - 11:00',
        title: 'Petição Inicial Recebida',
        description: 'Ação de obrigação de fazer contra plano de saúde para custeio de cirurgia.',
        sourceUrl: 'https://esaj.tjsp.jus.br',
      },
    ],
  },

  checklistByProcess: {
    '1002345-67-2023-8-26-0100': [
      'Analisar laudo pericial (fls. 450/480)',
      'Consultar assistente técnico sobre conclusões',
      'Protocolar manifestação ao laudo — prazo 5 dias',
    ],
    '1045231-88-2024-8-26-0100': [
      'Analisar documentos juntados pela seguradora',
      'Protocolar réplica à contestação',
      'Solicitar cálculos atualizados ao contador',
    ],
    '5003821-44-2022-8-26-0100': [
      'Protocolar contrarrazões ao agravo — prazo 15 dias URGENTE',
      'Verificar cumprimento da tutela de urgência',
      'Agendar reunião com cliente para alinhamento',
    ],
    '0015673-21-2024-4-03-6100': [
      'Aguardar prazo da União para contestar (15 dias)',
      'Preparar réplica antecipadamente',
      'Juntar comprovantes de recolhimento adicionais',
    ],
    '1000998-55-2023-5-02-0461': [
      'Preparar rol de testemunhas para audiência (15/07)',
      'Reunir provas de horas extras (contracheques, ponto)',
      'Contato com cliente para alinhamento pré-audiência',
    ],
  },
};

export const processService = {
  async listProcesses(): Promise<ProcessItem[]> {
    const token = window.localStorage.getItem('lex-auth-token');
    if (isAdminToken(token)) {
      return cloneData(DATASET.processes);
    }

    return api.get('/processes', () => cloneData(DATASET.processes));
  },

  async listMovementsMap(): Promise<Record<string, ProcessMovement[]>> {
    const token = window.localStorage.getItem('lex-auth-token');
    if (isAdminToken(token)) {
      return cloneData(DATASET.movementsByProcess);
    }

    return api.get('/processes/movements', () => cloneData(DATASET.movementsByProcess));
  },

  async listChecklistMap(): Promise<Record<string, string[]>> {
    const token = window.localStorage.getItem('lex-auth-token');
    if (isAdminToken(token)) {
      return cloneData(DATASET.checklistByProcess);
    }

    return api.get('/processes/checklist', () => cloneData(DATASET.checklistByProcess));
  },
};
