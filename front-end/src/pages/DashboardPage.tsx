/**
 * DashboardPage — painel principal do Lex.
 *
 * Seções:
 *   1. Cards de métricas (Crítico / Atenção / Futuros)
 *   2. Gráfico de Carga Semanal (Recharts BarChart)
 *   3. Insight de IA
 *   4. Módulo Próxima Tarefa
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Sparkles, Target, AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';

// ── Dados mock — substituir por chamada à API ─────────────────
const WEEK_DATA = [
  { day: 'SEG', date: 18, count: 18, peak: false },
  { day: 'TER', date: 19, count: 19, peak: false },
  { day: 'QUA', date: 20, count: 29, peak: true  },
  { day: 'QUI', date: 21, count: 14, peak: false },
  { day: 'SEX', date: 22, count: 11, peak: false },
  { day: 'SAB', date: 23, count: 4,  peak: false },
  { day: 'DOM', date: 24, count: 2,  peak: false },
];

const TODAY_INDEX = 0; // SEG = hoje (mock)

// ── Tooltip customizado do gráfico ────────────────────────────
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

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Título */}
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard Principal</h1>
          <p className="text-sm text-slate-500 mt-0.5">Visão geral dos seus prazos e processos</p>
        </div>

        {/* ── Cards de métricas ────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Crítico */}
          <div className="bg-white rounded-2xl border border-red-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold tracking-widest text-red-500 uppercase">Crítico (24h)</span>
              <span className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center">
                <AlertTriangle size={15} className="text-red-500" />
              </span>
            </div>
            <p className="text-4xl font-bold text-slate-900">03</p>
            <p className="text-xs text-slate-400 mt-1">prazos fatais hoje</p>
          </div>

          {/* Atenção */}
          <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold tracking-widest text-amber-500 uppercase">Atenção (72h)</span>
              <span className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
                <Clock size={15} className="text-amber-500" />
              </span>
            </div>
            <p className="text-4xl font-bold text-slate-900">12</p>
            <p className="text-xs text-slate-400 mt-1">vencem em até 3 dias</p>
          </div>

          {/* Futuros */}
          <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold tracking-widest text-blue-500 uppercase">Futuros</span>
              <span className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
                <TrendingUp size={15} className="text-blue-500" />
              </span>
            </div>
            <p className="text-4xl font-bold text-slate-900">45</p>
            <p className="text-xs text-slate-400 mt-1">nos próximos 30 dias</p>
          </div>
        </div>

        {/* ── Gráfico + Insight IA ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Gráfico de carga semanal */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-sm font-bold text-slate-800">Visualização de Carga da Semana</h2>
              <p className="text-xs text-slate-400 mt-0.5">Distribuição de prazos fatais nos próximos 7 dias</p>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={WEEK_DATA} barSize={28} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val, idx) =>
                    `${val} (${WEEK_DATA[idx]?.date})`
                  }
                />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(37,99,235,0.05)', radius: 8 }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {WEEK_DATA.map((entry, index) => (
                    <Cell
                      key={entry.day}
                      fill={
                        entry.peak
                          ? '#ef4444'
                          : index === TODAY_INDEX
                          ? '#2563eb'
                          : '#cbd5e1'
                      }
                      opacity={index > TODAY_INDEX && !entry.peak ? 0.5 : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Legenda */}
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

          {/* Insight de IA */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-blue-200" />
                <span className="text-xs font-bold text-blue-100 uppercase tracking-wider">Insight da IA</span>
              </div>
              <p className="text-white text-sm leading-relaxed">
                <strong>Quarta-feira</strong> será seu dia mais carregado. Tente antecipar{' '}
                <strong>2 prazos hoje</strong> para equilibrar a carga da semana.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-500">
              <p className="text-blue-200 text-xs">Baseado nos seus 45 processos ativos</p>
            </div>
          </div>
        </div>

        {/* ── Módulo Próxima Tarefa ────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Target size={17} className="text-blue-600" />
            <h2 className="text-sm font-bold text-slate-800">Módulo Próxima Tarefa 🎯</h2>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">
            Sugerimos focar na{' '}
            <span className="font-bold text-slate-900">Réplica do Processo 1002345-67</span>{' '}
            agora.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Motivo: É o prazo mais complexo da sua semana (Pico na Quarta).
          </p>
          <div className="flex items-center gap-3 mt-4">
            <button
              type="button"
              onClick={() => navigate('/processos/1002345-67-2023-8-26-0100')}
              className="btn-primary px-4 py-2 text-xs font-semibold"
            >
              Ver Processo
            </button>
            <button
              type="button"
              className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
            >
              Sugerir outro
            </button>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
