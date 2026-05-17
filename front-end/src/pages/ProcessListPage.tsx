import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CircleAlert, Search, X } from 'lucide-react';
import { AppLayout } from '../layouts/AppLayout';
import { useProcessesData } from '../hooks/useProcessesData';
import type { ProcessStatus } from '../services/processService';
import {
  PROCESS_SORT_STORAGE_KEY,
  PROCESS_LIST_CONTEXT_STORAGE_KEY,
  type ProcessSort,
  STATUS_PRIORITY,
  parsePtBrDateTime,
  statusBadgeClasses,
  statusLabel,
} from './processes/processHelpers';

type ProcessFilter = 'todos' | ProcessStatus;

interface StoredProcessListContext {
  query: string;
  filter: ProcessFilter;
  sortBy: ProcessSort;
  page: number;
  savedAt: number;
}

const CONTEXT_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const ITEMS_PER_PAGE = 5;

function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function normalizeCompactSearch(value: string): string {
  return normalizeSearch(value).replace(/[^a-z0-9]/g, '');
}

function readStoredContext(): StoredProcessListContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(PROCESS_LIST_CONTEXT_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const candidate = parsed as Record<string, unknown>;

    const query = typeof candidate.query === 'string' ? candidate.query : '';
    const filter = candidate.filter;
    const sortBy = candidate.sortBy;
    const page = typeof candidate.page === 'number' ? Math.max(1, Math.floor(candidate.page)) : 1;
    const savedAt = typeof candidate.savedAt === 'number' ? candidate.savedAt : 0;

    const validFilter = filter === 'todos' || filter === 'critico' || filter === 'atencao' || filter === 'normal';
    const validSort = sortBy === 'urgencia' || sortBy === 'movimentacao' || sortBy === 'numero';
    if (!validFilter || !validSort || !savedAt) return null;

    if (Date.now() - savedAt > CONTEXT_TTL_MS) {
      window.localStorage.removeItem(PROCESS_LIST_CONTEXT_STORAGE_KEY);
      return null;
    }

    return {
      query,
      filter,
      sortBy,
      page,
      savedAt,
    } as StoredProcessListContext;
  } catch (error) {
    console.error('Não foi possível restaurar o contexto da lista de processos.', error);
    return null;
  }
}

export function ProcessListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { processes, loadState, reload } = useProcessesData();
  const storedContext = useMemo(() => readStoredContext(), []);
  const urlQuery = useMemo(() => {
    const value = new URLSearchParams(location.search).get('q');
    return value?.trim() ?? '';
  }, [location.search]);

  const [query, setQuery] = useState(urlQuery || storedContext?.query || '');
  const [filter, setFilter] = useState<ProcessFilter>(storedContext?.filter ?? 'todos');
  const [sortBy, setSortBy] = useState<ProcessSort>(() => {
    if (storedContext?.sortBy) return storedContext.sortBy;
    if (typeof window === 'undefined') return 'urgencia';
    const saved = window.localStorage.getItem(PROCESS_SORT_STORAGE_KEY);
    return saved === 'urgencia' || saved === 'movimentacao' || saved === 'numero' ? saved : 'urgencia';
  });
  const [page, setPage] = useState<number>(storedContext?.page ?? 1);

  useEffect(() => {
    window.localStorage.setItem(PROCESS_SORT_STORAGE_KEY, sortBy);
  }, [sortBy]);

  useEffect(() => {
    if (!urlQuery || urlQuery === query) return;
    setQuery(urlQuery);
    setPage(1);
  }, [query, urlQuery]);

  const filteredProcesses = useMemo(() => {
    const normalized = normalizeSearch(query.trim());
    const normalizedCompact = normalizeCompactSearch(query.trim());
    const matching = processes.filter((p) => {
      const matchesFilter = filter === 'todos' || p.status === filter;
      const searchableText = normalizeSearch([
        p.number,
        p.claimant,
        p.defendant,
        p.court,
        p.district,
        p.latestMovementTitle,
      ].join(' '));
      const searchableCompact = normalizeCompactSearch(p.number);
      const matchesSearch =
        !normalized ||
        searchableText.includes(normalized) ||
        (normalizedCompact.length > 0 && searchableCompact.includes(normalizedCompact));
      return matchesFilter && matchesSearch;
    });

    return [...matching].sort((a, b) => {
      if (sortBy === 'numero') {
        return a.number.localeCompare(b.number, 'pt-BR', { numeric: true, sensitivity: 'base' });
      }
      const dateDiff = parsePtBrDateTime(b.latestMovementAt) - parsePtBrDateTime(a.latestMovementAt);
      if (sortBy === 'movimentacao') return dateDiff;
      const urgencyDiff = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
      return urgencyDiff !== 0 ? urgencyDiff : dateDiff;
    });
  }, [filter, processes, query, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProcesses.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const searchSuggestions = useMemo(() => {
    const normalized = normalizeSearch(query.trim());
    if (!normalized) return [];

    const values = new Set<string>();
    for (const process of processes) {
      const candidates = [process.number, process.claimant, process.defendant];
      for (const candidate of candidates) {
        if (normalizeSearch(candidate).includes(normalized)) {
          values.add(candidate);
        }
      }
      if (values.size >= 8) break;
    }

    return Array.from(values).slice(0, 8);
  }, [processes, query]);

  const paginatedProcesses = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProcesses.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredProcesses]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const context: StoredProcessListContext = {
      query,
      filter,
      sortBy,
      page: currentPage,
      savedAt: Date.now(),
    };
    window.localStorage.setItem(PROCESS_LIST_CONTEXT_STORAGE_KEY, JSON.stringify(context));
  }, [currentPage, filter, query, sortBy]);

  const hasActiveFilter = filter !== 'todos' || query.trim() !== '';

  function clearAll() {
    setQuery('');
    setFilter('todos');
    setSortBy('urgencia');
    setPage(1);
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Meus processos</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Acompanhe movimentações e abra os detalhes com análise inteligente.
          </p>
        </div>

        {loadState === 'loading' ? (
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
        ) : loadState === 'error' ? (
          <section className="bg-white rounded-2xl border border-amber-200 shadow-sm p-6">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-amber-800">
              <CircleAlert size={16} />
              Não foi possível carregar os processos agora.
            </p>
            <p className="text-sm text-slate-600 mt-2">
              Verifique sua conexão e tente novamente.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={reload} className="btn-primary px-4 py-2 text-sm font-semibold">
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
                    list="process-search-suggestions"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Buscar por número do processo, autor ou réu..."
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                  <datalist id="process-search-suggestions">
                    {searchSuggestions.map((suggestion) => (
                      <option key={suggestion} value={suggestion} />
                    ))}
                  </datalist>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {(['todos', 'critico', 'atencao', 'normal'] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setFilter(option);
                        setPage(1);
                      }}
                      className={[
                        'px-3 py-2 rounded-xl text-xs font-semibold border transition-colors',
                        filter === option
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
                      ].join(' ')}
                    >
                      {option === 'todos' ? 'Todos' : statusLabel(option)}
                    </button>
                  ))}

                  <div className="min-w-0">
                    <label htmlFor="process-sort" className="sr-only">Ordenar processos</label>
                    <select
                      id="process-sort"
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value as ProcessSort);
                        setPage(1);
                      }}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    >
                      <option value="urgencia">Mais urgente</option>
                      <option value="movimentacao">Movimentação mais recente</option>
                      <option value="numero">Número do processo</option>
                    </select>
                  </div>

                  {hasActiveFilter && (
                    <button
                      type="button"
                      onClick={clearAll}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <X size={12} />
                      Limpar
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-3">
                {processes.length} processo{processes.length !== 1 ? 's' : ''} carregado{processes.length !== 1 ? 's' : ''}
                {hasActiveFilter && ` · ${filteredProcesses.length} exibido${filteredProcesses.length !== 1 ? 's' : ''} com filtro ativo`}
              </p>
            </section>

            <section className="space-y-3">
              {filteredProcesses.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
                  <p className="text-sm font-semibold text-slate-800">Nenhum processo encontrado com os filtros atuais.</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Limpe os filtros para ver todos os {processes.length} processos.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <button type="button" onClick={clearAll} className="btn-primary px-4 py-2 text-sm font-semibold">
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
                paginatedProcesses.map((process) => (
                  <article key={process.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-3 lg:gap-5">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h2 className="font-mono text-sm sm:text-base font-semibold text-slate-900 break-all">
                            {process.number}
                          </h2>
                          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            {process.court}
                          </span>
                          <span className={`text-[11px] font-semibold border rounded-full px-2 py-0.5 ${statusBadgeClasses(process.status)}`}>
                            {statusLabel(process.status)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">
                          Autor: <strong>{process.claimant}</strong> · Réu: <strong>{process.defendant}</strong>
                        </p>
                        <p className="text-xs text-slate-500 mt-1">{process.district}</p>
                        <p className="text-sm text-slate-500 mt-2">
                          Última mov.: {process.latestMovementAt} · {process.latestMovementTitle}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate(`/processos/${process.id}`)}
                        className="btn-primary px-4 py-2.5 text-sm font-semibold self-start shrink-0"
                      >
                        Abrir processo
                      </button>
                    </div>
                  </article>
                ))
              )}
            </section>

            {filteredProcesses.length > 0 && (
              <section className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-xs text-slate-500">
                  Página {currentPage} de {totalPages} · exibindo{' '}
                  {Math.min(filteredProcesses.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}–
                  {Math.min(filteredProcesses.length, currentPage * ITEMS_PER_PAGE)} de {filteredProcesses.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage <= 1}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-300"
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage >= totalPages}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-300"
                  >
                    Próxima
                  </button>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
