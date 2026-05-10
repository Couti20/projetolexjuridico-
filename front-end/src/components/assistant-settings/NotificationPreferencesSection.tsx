/**
 * NotificationPreferencesSection
 *
 * Preferências de notificação via WhatsApp:
 * - 4 toggles de tipos de alerta
 * - Horário do resumo diário (input time livre)
 * - Janela silenciosa com início e fim
 * - Preview em tempo real do que será entregue
 */

import { Bell, CheckCircle2, Clock3, Zap } from 'lucide-react';
import { ToggleSwitch } from './ToggleSwitch';
import type { NotificationPreferences, SaveStatus } from './types';

interface NotificationPreferencesSectionProps {
  notifications: NotificationPreferences;
  saveStatus: SaveStatus;
  onUpdateNotification: <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K],
  ) => void;
}

const ALERT_ITEMS = [
  {
    key: 'criticalAlerts24h' as const,
    title: 'Alertas de prazos críticos (24h)',
    description: 'Disparo imediato para eventos com risco de perda de prazo.',
  },
  {
    key: 'dailySummaryMorning' as const,
    title: 'Resumo diário "O que fazer hoje"',
    description: 'Briefing de manhã com prioridades do dia e orientação de foco.',
  },
  {
    key: 'aiTaskSuggestions' as const,
    title: 'Sugestão automática de tarefas (IA)',
    description: 'Gera próxima ação por movimentação para acelerar sua execução.',
  },
  {
    key: 'weeklyProductivityReport' as const,
    title: 'Relatório de produtividade semanal',
    description: 'Panorama de carga, pendências e gargalos para a próxima semana.',
  },
] satisfies { key: keyof NotificationPreferences; title: string; description: string }[];

export function NotificationPreferencesSection({
  notifications,
  saveStatus,
  onUpdateNotification,
}: NotificationPreferencesSectionProps) {
  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Preferências de notificação</h2>
          <p className="text-sm text-slate-500 mt-1">
            Ajuste prioridade, horário e nível de automação para reduzir ruído e manter foco.
          </p>
        </div>
        {saveStatus === 'saved' && (
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 shrink-0">
            <CheckCircle2 size={14} />
            Salvo automaticamente
          </p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* ── Toggles de alertas ── */}
        <div className="xl:col-span-2 space-y-2">
          {ALERT_ITEMS.map(({ key, title, description }) => (
            <div
              key={key}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-start justify-between gap-3"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">{title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{description}</p>
              </div>
              <ToggleSwitch
                checked={notifications[key] as boolean}
                onChange={() => onUpdateNotification(key, !notifications[key])}
                ariaLabel={`Ativar: ${title}`}
              />
            </div>
          ))}
        </div>

        {/* ── Painel lateral: agendamento + preview ── */}
        <aside className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">

          {/* Horário do resumo — input time livre */}
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Agendamento</p>
            <div className="mt-2">
              <label htmlFor="dailySummaryTime" className="text-sm font-medium text-slate-700">
                Horário do resumo diário
              </label>
              <input
                id="dailySummaryTime"
                type="time"
                value={notifications.dailySummaryTime}
                onChange={(e) => onUpdateNotification('dailySummaryTime', e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-shadow"
              />
            </div>
          </div>

          {/* Janela silenciosa */}
          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900">Janela silenciosa</p>
              <ToggleSwitch
                checked={notifications.quietHoursEnabled}
                onChange={() =>
                  onUpdateNotification('quietHoursEnabled', !notifications.quietHoursEnabled)
                }
                ariaLabel="Ativar janela silenciosa"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Nenhuma notificação será enviada neste intervalo.
            </p>

            <div className="mt-2 grid grid-cols-2 gap-2">
              {(['quietStart', 'quietEnd'] as const).map((field) => (
                <div key={field}>
                  <label
                    htmlFor={field}
                    className="text-xs font-medium text-slate-600"
                  >
                    {field === 'quietStart' ? 'Início' : 'Fim'}
                  </label>
                  <input
                    id={field}
                    type="time"
                    value={notifications[field]}
                    onChange={(e) => onUpdateNotification(field, e.target.value)}
                    disabled={!notifications.quietHoursEnabled}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 disabled:bg-slate-100 disabled:text-slate-400 transition-shadow"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Preview de entrega */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Preview de entrega</p>

            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
              <p className="text-xs font-semibold text-blue-900 inline-flex items-center gap-1">
                <Bell size={12} />
                Hoje às {notifications.dailySummaryTime}
              </p>
              <p className="text-xs text-blue-800 mt-1">
                2 prazos críticos, 1 sugestão por IA e 3 atualizações processuais.
              </p>
            </div>

            <div className="rounded-lg border border-amber-100 bg-amber-50 p-3">
              <p className="text-xs font-semibold text-amber-900 inline-flex items-center gap-1">
                <Clock3 size={12} />
                Prioridade de ruído
              </p>
              <p className="text-xs text-amber-800 mt-1">
                {notifications.quietHoursEnabled
                  ? `Silêncio de ${notifications.quietStart} às ${notifications.quietEnd}.`
                  : 'Janela silenciosa desativada.'}
              </p>
            </div>

            <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
              <p className="text-xs font-semibold text-emerald-900 inline-flex items-center gap-1">
                <Zap size={12} />
                Automação
              </p>
              <p className="text-xs text-emerald-800 mt-1">
                Sugestões IA{' '}
                {notifications.aiTaskSuggestions ? 'ativadas' : 'desativadas'} para acelerar seu fluxo.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
