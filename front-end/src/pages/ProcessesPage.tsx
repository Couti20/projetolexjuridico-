import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Copy,
  ExternalLink,
  MessageCircle,
  Search,
  Sparkles,
} from 'lucide-react';
import { AppLayout } from '../layouts/AppLayout';

type ProcessStatus = 'critico' | 'atencao' | 'normal';
type ProcessSort = 'urgencia' | 'movimentacao' | 'numero';
type LoadState = 'loading' | 'ready' | 'error';
type TaskStatus = 'idle' | 'sending' | 'sent';

interface ProcessItem {
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

interface ProcessMovement {
  id: string;
  datetime: string;
  title: string;
  description: string;
  sourceUrl: string;
}

const PROCESS_LIST: ProcessItem[] = [
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
];

const MOVEMENTS: Record<string, ProcessMovement[]> = {
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
};

const AI_CHECKLIST: Record<string, string[]> = {
  '1002345-67-2023-8-26-0100': [
    'Analisar laudo pericial',
    'Consultar assistente técnico',
    'Protocolar petição (Réplica)',
  ],
};

const STORAGE_FILTER_KEY = 'lex-processes-filter';
const STORAGE_SORT_KEY = 'lex-processes-sort';
const STORAGE_MOVEMENT_READ_KEY = 'lex-processes-movement-read';
const STORAGE_MOVEMENT_NOTES_KEY = 'lex-processes-movement-notes';

const STATUS_PRIORITY: Record<ProcessStatus, number> = {
  critico: 0,
  atencao: 1,
  normal: 2,
};

function parsePtBrDateTime(value: string): number {
  const [datePart, timePart = '00:00'] = value.split(' ');
  const [day, month, year] = datePart.split('/').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);

  if (!day || !month || !year) return 0;
  return new Date(year, month - 1, day, hour ?? 0, minute ?? 0).getTime();
}

function statusBadgeClasses(status: ProcessStatus): string {
  if (status === 'critico') return 'bg-red-50 text-red-700 border-red-200';
  if (status === 'atencao') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
}

function statusLabel(status: ProcessStatus): string {
  if (status === 'critico') return 'Crítico';
  if (status === 'atencao') return 'Atenção';
  return 'Normal';
}

function isUrgentMovement(movement: ProcessMovement): boolean {
  const content = `${movement.title} ${movement.description}`.toLowerCase();
  return /intimação|prazo|manifestação|expedição/.test(content);
}

function getStoredBooleanMap(key: string): Record<string, boolean> {
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

function getStoredStringMap(key: string): Record<string, string> {
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

export function ProcessesPage() {
  const navigate = useNavigate();
  const { processId } = useParams();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'todos' | ProcessStatus>(() => {
    if (typeof window === 'undefined') return 'todos';
    const savedFilter = window.localStorage.getItem(STORAGE_FILTER_KEY);
    return savedFilter === 'todos' || savedFilter === 'critico' || savedFilter === 'atencao' || savedFilter === 'normal'
      ? savedFilter
      : 'todos';
  });
  const [sortBy, setSortBy] = useState<ProcessSort>(() => {
    if (typeof window === 'undefined') return 'urgencia';
    const savedSort = window.localStorage.getItem(STORAGE_SORT_KEY);
    return savedSort === 'urgencia' || savedSort === 'movimentacao' || savedSort === 'numero'
      ? savedSort
      : 'urgencia';
  });
  const [checkedChecklist, setCheckedChecklist] = useState<Record<string, boolean>>({});
  const [readMovements, setReadMovements] = useState<Record<string, boolean>>(() => getStoredBooleanMap(STORAGE_MOVEMENT_READ_KEY));
  const [movementNotes, setMovementNotes] = useState<Record<string, string>>(() => getStoredStringMap(STORAGE_MOVEMENT_NOTES_KEY));
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [activeNoteMovementId, setActiveNoteMovementId] = useState<string | null>(null);
  const [movementTaskStatus, setMovementTaskStatus] = useState<Record<string, TaskStatus>>({});
  const [listLoadState, setListLoadState] = useState<LoadState>('loading');
  const [detailLoadState, setDetailLoadState] = useState<LoadState>('loading');
  const [reloadKey, setReloadKey] = useState(0);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('idle');

  useEffect(() => {
    window.localStorage.setItem(STORAGE_FILTER_KEY, filter);
  }, [filter]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_SORT_KEY, sortBy);
  }, [sortBy]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_MOVEMENT_READ_KEY, JSON.stringify(readMovements));
  }, [readMovements]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_MOVEMENT_NOTES_KEY, JSON.stringify(movementNotes));
  }, [movementNotes]);

  useEffect(() => {
    const isDetailView = Boolean(processId);

    if (isDetailView) {
      setDetailLoadState('loading');
    } else {
      setListLoadState('loading');
    }

    const timeoutId = window.setTimeout(() => {
      const hasConnection = typeof navigator === 'undefined' || navigator.onLine;
      const nextState: LoadState = hasConnection ? 'ready' : 'error';

      if (isDetailView) {
        setDetailLoadState(nextState);
      } else {
        setListLoadState(nextState);
      }
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [processId, reloadKey]);

  const selectedProcess = useMemo(
    () => PROCESS_LIST.find((process) => process.id === processId) ?? null,
    [processId],
  );

  const filteredProcesses = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const matchingProcesses = PROCESS_LIST.filter((process) => {
      const matchesFilter = filter === 'todos' || process.status === filter;
      const matchesSearch =
        !normalized ||
        process.number.toLowerCase().includes(normalized) ||
        process.claimant.toLowerCase().includes(normalized) ||
        process.defendant.toLowerCase().includes(normalized);
      return matchesFilter && matchesSearch;
    });

    return [...matchingProcesses].sort((a, b) => {
      if (sortBy === 'numero') {
        return a.number.localeCompare(b.number, 'pt-BR', { numeric: true, sensitivity: 'base' });
      }

      const dateDiff = parsePtBrDateTime(b.latestMovementAt) - parsePtBrDateTime(a.latestMovementAt);
      if (sortBy === 'movimentacao') {
        return dateDiff;
      }

      const urgencyDiff = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
      return urgencyDiff !== 0 ? urgencyDiff : dateDiff;
    });
  }, [filter, query, sortBy]);

  const movements = selectedProcess ? MOVEMENTS[selectedProcess.id] ?? [] : [];
  const checklist = selectedProcess ? AI_CHECKLIST[selectedProcess.id] ?? [] : [];

  const checklistTotal = checklist.length;
  const checklistDone = checklist.filter((item) => checkedChecklist[item]).length;

  async function handleCopyProcessNumber() {
    if (!selectedProcess) return;
    try {
      await navigator.clipboard.writeText(selectedProcess.number);
      setCopyStatus('copied');
      window.setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (error) {
      console.error('Não foi possível copiar o número do processo.', error);
      setCopyStatus('idle');
    }
  }

  async function handleCreateTask() {
    if (!selectedProcess) return;
    setTaskStatus('sending');
    const pendingItems = checklist.filter((item) => !checkedChecklist[item]);
    const checklistLines = (pendingItems.length > 0 ? pendingItems : checklist)
      .map((item, index) => `${index + 1}. ${item}`)
      .join('\n');

    const message = encodeURIComponent(
      `Processo ${selectedProcess.number}\n\nChecklist sugerido:\n${checklistLines}`,
    );
    window.open(`https://wa.me/?text=${message}`, '_blank', 'noopener,noreferrer');

    await new Promise((resolve) => setTimeout(resolve, 700));
    setTaskStatus('sent');
    window.setTimeout(() => setTaskStatus('idle'), 2200);
  }

  function toggleChecklist(item: string) {
    setCheckedChecklist((prev) => ({ ...prev, [item]: !prev[item] }));
  }

  function retryLoad() {
    setReloadKey((prev) => prev + 1);
  }

  async function handleCreateMovementTask(movement: ProcessMovement, movementStateKey: string) {
    if (!selectedProcess) return;

    setMovementTaskStatus((prev) => ({ ...prev, [movementStateKey]: 'sending' }));

    const message = encodeURIComponent(
      `Processo ${selectedProcess.number}\nMovimentação: ${movement.title}\nData: ${movement.datetime}\n\nPróxima ação:\n- Revisar movimentação\n- Definir prazo interno\n- Delegar responsável`,
    );
    window.open(`https://wa.me/?text=${message}`, '_blank', 'noopener,noreferrer');

    await new Promise((resolve) => setTimeout(resolve, 700));
    setMovementTaskStatus((prev) => ({ ...prev, [movementStateKey]: 'sent' }));
    window.setTimeout(() => {
      setMovementTaskStatus((prev) => ({ ...prev, [movementStateKey]: 'idle' }));
    }, 2200);
  }

  function toggleMovementRead(movementId: string) {
    setReadMovements((prev) => ({ ...prev, [movementId]: !prev[movementId] }));
  }

  function toggleMovementNoteEditor(movementId: string) {
    setActiveNoteMovementId((prev) => (prev === movementId ? null : movementId));
    setNoteDrafts((prev) => ({
      ...prev,
      [movementId]: prev[movementId] ?? movementNotes[movementId] ?? '',
    }));
  }

  function handleMovementNoteDraft(movementId: string, value: string) {
    setNoteDrafts((prev) => ({ ...prev, [movementId]: value }));
  }

  function handleSaveMovementNote(movementId: string) {
    const note = (noteDrafts[movementId] ?? '').trim();

    if (!note) {
      setMovementNotes((prev) => {
        const next = { ...prev };
        delete next[movementId];
        return next;
      });
      setActiveNoteMovementId(null);
      return;
    }

    setMovementNotes((prev) => ({ ...prev, [movementId]: note }));
    setActiveNoteMovementId(null);
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-5">
        {!processId && (
          <>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Meus processos</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Acompanhe movimentações e abra os detalhes com análise inteligente.
              </p>
            </div>

            {listLoadState === 'loading' ? (
              <>
                <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 animate-pulse" aria-busy="true">
                  <div className="h-10 rounded-xl bg-slate-100" />
                  <div className="mt-3 flex gap-2">
                    <div className="h-8 w-20 rounded-xl bg-slate-100" />
                    <div className="h-8 w-20 rounded-xl bg-slate-100" />
                    <div className="h-8 w-24 rounded-xl bg-slate-100" />
                  </div>
                </section>
                <section className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <article key={item} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 animate-pulse">
                      <div className="h-4 w-64 rounded bg-slate-100" />
                      <div className="h-3 w-5/6 rounded bg-slate-100 mt-3" />
                      <div className="h-3 w-3/6 rounded bg-slate-100 mt-2" />
                      <div className="h-9 w-32 rounded-xl bg-slate-100 mt-4" />
                    </article>
                  ))}
                </section>
              </>
            ) : listLoadState === 'error' ? (
              <section className="bg-white rounded-2xl border border-amber-200 shadow-sm p-6">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-amber-800">
                  <CircleAlert size={16} />
                  Não foi possível carregar os processos agora.
                </p>
                <p className="text-sm text-slate-600 mt-2">
                  Verifique sua conexão e tente novamente. Se o problema persistir, acesse o dashboard para continuar.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={retryLoad}
                    className="btn-primary px-4 py-2 text-sm font-semibold"
                  >
                    Tentar novamente
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
                  >
                    Ir para dashboard
                  </button>
                </div>
              </section>
            ) : (
              <>
                <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Buscar por número do processo, autor ou réu..."
                        className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {(['todos', 'critico', 'atencao', 'normal'] as const).map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setFilter(option)}
                          className={[
                            'px-3 py-2 rounded-xl text-xs font-semibold border',
                            filter === option
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
                          ].join(' ')}
                        >
                          {option === 'todos' ? 'Todos' : statusLabel(option)}
                        </button>
                      ))}

                      <div className="min-w-0">
                        <label htmlFor="process-sort" className="sr-only">
                          Ordenar processos
                        </label>
                        <select
                          id="process-sort"
                          value={sortBy}
                          onChange={(event) => setSortBy(event.target.value as ProcessSort)}
                          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                        >
                          <option value="urgencia">Mais urgente</option>
                          <option value="movimentacao">Movimentação mais recente</option>
                          <option value="numero">Número do processo</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-3">Filtros e ordenação salvos neste dispositivo.</p>
                </section>

                <section className="space-y-3">
                  {filteredProcesses.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
                      <p className="text-sm font-semibold text-slate-800">Nenhum processo encontrado com os filtros atuais.</p>
                      <p className="text-sm text-slate-500 mt-1">
                        Limpe os filtros para voltar ao monitoramento completo ou retorne ao dashboard.
                      </p>
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setQuery('');
                            setFilter('todos');
                            setSortBy('urgencia');
                          }}
                          className="btn-primary px-4 py-2 text-sm font-semibold"
                        >
                          Limpar filtros
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate('/dashboard')}
                          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
                        >
                          Voltar ao dashboard
                        </button>
                      </div>
                    </div>
                  ) : (
                    filteredProcesses.map((process) => (
                      <article key={process.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
                        <div className="flex flex-col lg:flex-row lg:items-start gap-3 lg:gap-5">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h2 className="font-mono text-sm sm:text-base font-semibold text-slate-900 break-all">
                                {process.number} ({process.court})
                              </h2>
                              <span className={`text-[11px] font-semibold border rounded-full px-2 py-0.5 ${statusBadgeClasses(process.status)}`}>
                                {statusLabel(process.status)}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600">
                              Autor: <strong>{process.claimant}</strong> · Réu: <strong>{process.defendant}</strong>
                            </p>
                            <p className="text-xs text-slate-500 mt-1">{process.district}</p>
                            <p className="text-sm text-slate-500 mt-2">
                              Última movimentação: {process.latestMovementAt} · {process.latestMovementTitle}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => navigate(`/processos/${process.id}`)}
                            className="btn-primary px-4 py-2.5 text-sm font-semibold self-start"
                          >
                            Abrir processo
                          </button>
                        </div>
                      </article>
                    ))
                  )}
                </section>
              </>
            )}
          </>
        )}

        {processId && detailLoadState === 'loading' && (
          <section className="space-y-4" aria-busy="true">
            <article className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6 animate-pulse">
              <div className="h-5 w-64 rounded bg-slate-100" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                <div className="space-y-2">
                  <div className="h-3 w-16 rounded bg-slate-100" />
                  <div className="h-4 w-48 rounded bg-slate-100" />
                  <div className="h-4 w-52 rounded bg-slate-100" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-24 rounded bg-slate-100" />
                  <div className="h-4 w-64 rounded bg-slate-100" />
                </div>
              </div>
            </article>
            <article className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 animate-pulse">
              <div className="h-4 w-48 rounded bg-slate-100" />
              <div className="h-3 w-11/12 rounded bg-slate-100 mt-3" />
              <div className="h-3 w-9/12 rounded bg-slate-100 mt-2" />
            </article>
          </section>
        )}

        {processId && detailLoadState === 'error' && (
          <section className="bg-white rounded-2xl border border-amber-200 shadow-sm p-5">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-amber-800">
              <CircleAlert size={16} />
              Falha ao sincronizar os dados deste processo.
            </p>
            <p className="text-sm text-slate-600 mt-2">
              Tente novamente em instantes. Enquanto isso, você pode voltar para a lista e priorizar outros casos.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={retryLoad}
                className="btn-primary px-4 py-2 text-sm font-semibold"
              >
                Tentar novamente
              </button>
              <button
                type="button"
                onClick={() => navigate('/processos')}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
              >
                Voltar para lista
              </button>
            </div>
          </section>
        )}

        {processId && detailLoadState === 'ready' && !selectedProcess && (
          <section className="bg-white rounded-2xl border border-amber-200 shadow-sm p-5">
            <p className="inline-flex items-center gap-2 text-sm text-amber-800">
              <CircleAlert size={16} />
              Processo não encontrado para este identificador.
            </p>
            <button
              type="button"
              onClick={() => navigate('/processos')}
              className="mt-4 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-400"
            >
              Voltar para lista de processos
            </button>
          </section>
        )}

        {processId && detailLoadState === 'ready' && selectedProcess && (
          <>
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => navigate('/processos')}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                <ArrowLeft size={16} />
                Voltar para a lista
              </button>
              <button
                type="button"
                onClick={handleCopyProcessNumber}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-800"
              >
                <Copy size={14} />
                {copyStatus === 'copied' ? 'Número copiado' : 'Copiar número'}
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
              <div className="xl:col-span-8 space-y-4">
                <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
                  <h1 className="font-mono text-base sm:text-lg font-bold text-slate-900 break-all">
                    Processo: {selectedProcess.number} ({selectedProcess.court})
                  </h1>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Partes</p>
                      <p className="text-sm text-slate-800 font-semibold">Autor: {selectedProcess.claimant}</p>
                      <p className="text-sm text-slate-800 font-semibold">Réu: {selectedProcess.defendant}</p>
                    </div>

                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Vara / Comarca</p>
                      <p className="text-sm text-slate-700">{selectedProcess.district}</p>
                    </div>
                  </div>
                </section>

                <section className="space-y-3">
                  <h2 className="text-base font-bold text-slate-900">Histórico de movimentações</h2>
                  {movements.length === 0 ? (
                    <article className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                      <p className="text-sm font-semibold text-slate-800">Ainda não há movimentações para este processo.</p>
                      <p className="text-sm text-slate-500 mt-1">
                        Continue acompanhando: ao detectar novidade, a timeline será atualizada automaticamente.
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate('/processos')}
                        className="mt-4 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
                      >
                        Ver outros processos
                      </button>
                    </article>
                  ) : (
                    <div className="relative">
                      <span className="absolute left-1.5 top-0 bottom-0 w-px bg-slate-200" />
                      <div className="space-y-3">
                        {movements.map((movement, index) => {
                          const movementStateKey = `${selectedProcess.id}:${movement.id}`;
                          const isLatest = index === 0;
                          const isUrgent = isUrgentMovement(movement);
                          const isRead = Boolean(readMovements[movementStateKey]);
                          const note = movementNotes[movementStateKey];
                          const draftNote = noteDrafts[movementStateKey] ?? note ?? '';
                          const movementTask = movementTaskStatus[movementStateKey] ?? 'idle';
                          const dotClass = isLatest
                            ? 'bg-blue-600'
                            : isUrgent
                            ? 'bg-red-500'
                            : 'bg-slate-300';

                          return (
                            <article key={movement.id} className="relative pl-7">
                              <span className={`absolute left-0.5 top-5 h-3 w-3 rounded-full ring-4 ring-white ${dotClass}`} />
                              <div
                                className={[
                                  'rounded-2xl border shadow-sm p-4',
                                  isLatest
                                    ? 'bg-blue-50/60 border-blue-200'
                                    : isUrgent
                                    ? 'bg-red-50/40 border-red-200'
                                    : 'bg-white border-slate-100',
                                  isRead ? 'opacity-90' : '',
                                ].join(' ')}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className="font-mono text-xs font-semibold text-slate-500">{movement.datetime}</p>
                                      {isLatest && (
                                        <span className="text-[10px] font-bold uppercase tracking-wide text-blue-700 bg-blue-100 border border-blue-200 rounded-full px-2 py-0.5">
                                          Mais recente
                                        </span>
                                      )}
                                      {isUrgent && (
                                        <span className="text-[10px] font-bold uppercase tracking-wide text-red-700 bg-red-100 border border-red-200 rounded-full px-2 py-0.5">
                                          Urgente
                                        </span>
                                      )}
                                      {isRead && (
                                        <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-100 border border-emerald-200 rounded-full px-2 py-0.5">
                                          Lido
                                        </span>
                                      )}
                                    </div>
                                    <h3 className="text-sm font-semibold text-slate-900 mt-1">{movement.title}</h3>
                                    <p className="text-sm text-slate-600 mt-2">{movement.description}</p>
                                  </div>
                                  <a
                                    href={movement.sourceUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 whitespace-nowrap"
                                  >
                                    Ver original
                                    <ExternalLink size={12} />
                                  </a>
                                </div>

                                <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleCreateMovementTask(movement, movementStateKey)}
                                    disabled={movementTask === 'sending'}
                                    className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-60 disabled:cursor-not-allowed"
                                  >
                                    {movementTask === 'sending' ? 'Enviando...' : movementTask === 'sent' ? 'Tarefa criada' : 'Criar tarefa'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => toggleMovementRead(movementStateKey)}
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300"
                                  >
                                    {isRead ? 'Marcar como não lido' : 'Marcar como lido'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => toggleMovementNoteEditor(movementStateKey)}
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300"
                                  >
                                    {activeNoteMovementId === movementStateKey ? 'Fechar observação' : note ? 'Editar observação' : 'Anotar observação'}
                                  </button>
                                </div>

                                {note && activeNoteMovementId !== movementStateKey && (
                                  <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                                    <strong>Observação:</strong> {note}
                                  </p>
                                )}

                                {activeNoteMovementId === movementStateKey && (
                                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                                    <label htmlFor={`note-${movement.id}`} className="block text-xs font-semibold text-slate-700">
                                      Observação interna
                                    </label>
                                    <textarea
                                      id={`note-${movement.id}`}
                                      value={draftNote}
                                      onChange={(event) => handleMovementNoteDraft(movementStateKey, event.target.value)}
                                      rows={3}
                                      placeholder="Ex.: Confirmar quesitos com assistente técnico até amanhã."
                                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 resize-y"
                                    />
                                    <div className="mt-2 flex flex-wrap justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setActiveNoteMovementId(null)}
                                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-400"
                                      >
                                        Cancelar
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleSaveMovementNote(movementStateKey)}
                                        className="btn-primary px-3 py-1.5 text-xs font-semibold"
                                      >
                                        {draftNote.trim() ? 'Salvar observação' : 'Remover observação'}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </section>
              </div>

              <aside className="xl:col-span-4">
                <section className="bg-blue-50 rounded-2xl border border-blue-100 p-5 sticky top-4">
                  <h2 className="inline-flex items-center gap-2 text-base font-bold text-blue-900">
                    <Sparkles size={16} />
                    Análise Inteligente
                  </h2>

                  <div className="mt-4">
                    <p className="text-sm font-semibold text-blue-900">O que fazer agora?</p>
                    <p className="text-sm text-slate-700 mt-1">
                      O juiz abriu prazo para manifestação sobre o laudo pericial.
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <p className="text-sm font-semibold text-blue-900">Checklist sugerido</p>
                    {checklist.length === 0 ? (
                      <p className="text-sm text-slate-600 mt-3">
                        Ainda não há checklist sugerido para este processo.
                      </p>
                    ) : (
                      <div className="space-y-2 mt-3">
                        {checklist.map((item) => (
                          <label key={item} className="flex items-start gap-2.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(checkedChecklist[item])}
                              onChange={() => toggleChecklist(item)}
                              className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-blue-600"
                            />
                            <span className={`text-sm ${checkedChecklist[item] ? 'line-through text-slate-500' : 'text-slate-700'}`}>
                              {item}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-slate-500 mt-3">
                      Progresso: {checklistDone}/{checklistTotal} itens concluídos
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCreateTask}
                    disabled={taskStatus === 'sending' || checklist.length === 0}
                    className="mt-5 w-full btn-primary py-2.5 text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {taskStatus === 'sending' ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" aria-hidden="true" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <MessageCircle size={15} />
                        Criar tarefa no WhatsApp
                      </>
                    )}
                  </button>

                  {taskStatus === 'sent' && (
                    <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                      <CheckCircle2 size={14} />
                      Sugestão enviada para o WhatsApp.
                    </p>
                  )}
                </section>
              </aside>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
