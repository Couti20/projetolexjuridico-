/**
 * DashboardPage — painel principal do Lex.
 */

import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Sparkles, Target, AlertTriangle, Clock, TrendingUp, CircleAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { dashboardService } from '../services/dashboardService';

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value?: number | string }>;
  label?: string;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-xl shadow-xl">
      <p className="font-semibold mb-0.5">{label ?? ''}</p>
      <p>{payload[0].value} processos</p>
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();

  const overviewQuery = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => dashboardService.getOverview(),
  });

  const overview = overviewQuery.data;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard Principal</h1>
          <p className="text-sm text-slate-500 mt-0.5">Visão geral dos seus prazos e processos</p>
        </div>

        {overviewQuery.isPending && (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((item) => (
                <article key={item} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm animate-pulse">
                  <div className="h-3 w-24 rounded bg-slate-100" />
                  <div className="h-10 w-14 rounded bg-slate-100 mt-3" />
                  <div className="h-3 w-32 rounded bg-slate-100 mt-2" />
                </article>
              ))}
            </section>
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <article className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm animate-pulse">
                <div className="h-4 w-48 rounded bg-slate-100" />
                <div className="h-44 rounded bg-slate-100 mt-4" />
              </article>
              <article className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm animate-pulse">
                <div className="h-4 w-24 rounded bg-slate-100" />
                <div className="h-3 w-48 rounded bg-slate-100 mt-3" />
                <div className="h-3 w-40 rounded bg-slate-100 mt-2" />
              </article>
            </section>
          </>
        )}

        {overviewQuery.isError && (
          <section className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-amber-800">
              <CircleAlert size={16} />
              Não foi possível carregar as métricas do dashboard.
            </p>
            <p className="text-sm text-slate-600 mt-1">Tente novamente para atualizar os indicadores.</p>
            <button
              type="button"
              onClick={() => void overviewQuery.refetch()}
              className="mt-4 btn-primary px-4 py-2 text-sm font-semibold"
            >
              Tentar novamente
            </button>
          </section>
        )}

        {overviewQuery.isSuccess && overview && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-red-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold tracking-widest text-red-500 uppercase">Crítico (24h)</span>
                  <span className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center">
                    <AlertTriangle size={15} className="text-red-500" />
                  </span>
                </div>
                <p className="text-4xl font-bold text-slate-900">{String(overview.criticalCount24h).padStart(2, '0')}</p>
                <p className="text-xs text-slate-400 mt-1">prazos fatais hoje</p>
              </div>

              <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold tracking-widest text-amber-500 uppercase">Atenção (72h)</span>
                  <span className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
                    <Clock size={15} className="text-amber-500" />
                  </span>
                </div>
                <p className="text-4xl font-bold text-slate-900">{String(overview.attentionCount72h).padStart(2, '0')}</p>
                <p className="text-xs text-slate-400 mt-1">vencem em até 3 dias</p>
              </div>

              <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold tracking-widest text-blue-500 uppercase">Futuros</span>
                  <span className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
                    <TrendingUp size={15} className="text-blue-500" />
                  </span>
                </div>
                <p className="text-4xl font-bold text-slate-900">{overview.futureCount30d}</p>
                <p className="text-xs text-slate-400 mt-1">nos próximos 30 dias</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className="mb-4">
                  <h2 className="text-sm font-bold text-slate-800">Visualização de Carga da Semana</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Distribuição de prazos fatais nos próximos 7 dias</p>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={overview.weekLoad} barSize={28} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val, idx) =>
                        `${val} (${overview.weekLoad[idx]?.date ?? ''})`
                      }
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(37,99,235,0.05)', radius: 8 }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {overview.weekLoad.map((entry, index) => (
                        <Cell
                          key={entry.day}
                          fill={
                            entry.peak
                              ? '#ef4444'
                              : index === overview.todayIndex
                              ? '#2563eb'
                              : '#cbd5e1'
                          }
                          opacity={index > overview.todayIndex && !entry.peak ? 0.5 : 1}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                <div className="flex items-center gap-4 mt-3">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="w-3 h-3 rounded-sm bg-blue-600" /> Hoje
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="w-3 h-3 rounded-sm bg-red-500" /> Pico
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="w-3 h-3 rounded-sm bg-slate-300" /> Outros dias
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={16} className="text-blue-200" />
                    <span className="text-xs font-bold text-blue-100 uppercase tracking-wider">Insight da IA</span>
                  </div>
                  <p className="text-white text-sm leading-relaxed">{overview.aiInsight}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-blue-500">
                  <p className="text-blue-200 text-xs">Baseado nos seus {overview.activeProcessesCount} processos ativos</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Target size={17} className="text-blue-600" />
                <h2 className="text-sm font-bold text-slate-800">Módulo Próxima Tarefa 🎯</h2>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                Sugerimos focar na <span className="font-bold text-slate-900">{overview.nextTask.title}</span> agora.
              </p>
              <p className="text-xs text-slate-400 mt-1">Motivo: {overview.nextTask.reason}</p>
              <div className="flex items-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => navigate(`/processos/${overview.nextTask.processId}`)}
                  className="btn-primary px-4 py-2 text-xs font-semibold"
                >
                  Ver Processo
                </button>
                <button
                  type="button"
                  onClick={() => void overviewQuery.refetch()}
                  className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Atualizar sugestão
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
