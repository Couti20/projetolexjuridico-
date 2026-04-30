import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleAlert, Search } from 'lucide-react';
import { AppLayout } from '../layouts/AppLayout';
import { useProcessesData } from '../hooks/useProcessesData';
import type { ProcessStatus } from '../services/processService';
import {
  PROCESS_FILTER_STORAGE_KEY,
  PROCESS_SORT_STORAGE_KEY,
  type ProcessSort,
  STATUS_PRIORITY,
  parsePtBrDateTime,
  statusBadgeClasses,
  statusLabel,
} from './processes/processHelpers';

export function ProcessListPage() {
  const navigate = useNavigate();
  const { processes, loadState, reload } = useProcessesData();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'todos' | ProcessStatus>(() => {
    if (typeof window === 'undefined') return 'todos';
    const savedFilter = window.localStorage.getItem(PROCESS_FILTER_STORAGE_KEY);
    return savedFilter === 'todos' || savedFilter === 'critico' || savedFilter === 'atencao' || savedFilter === 'normal'
      ? savedFilter
      : 'todos';
  });
  const [sortBy, setSortBy] = useState<ProcessSort>(() => {
    if (typeof window === 'undefined') return 'urgencia';
    const savedSort = window.localStorage.getItem(PROCESS_SORT_STORAGE_KEY);
    return savedSort === 'urgencia' || savedSort === 'movimentacao' || savedSort === 'numero'
      ? savedSort
      : 'urgencia';
  });

  useEffect(() => {
    window.localStorage.setItem(PROCESS_FILTER_STORAGE_KEY, filter);
  }, [filter]);

  useEffect(() => {
    window.localStorage.setItem(PROCESS_SORT_STORAGE_KEY, sortBy);
  }, [sortBy]);

  const filteredProcesses = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const matchingProcesses = processes.filter((process) => {
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
  }, [filter, processes, query, sortBy]);

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
              Verifique sua conexão e tente novamente. Se o problema persistir, acesse o dashboard para continuar.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={reload}
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
      </div>
    </AppLayout>
  );
}
