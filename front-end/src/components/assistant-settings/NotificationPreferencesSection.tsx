import { Bell, CheckCircle2, Clock3, Zap } from 'lucide-react';
import { ToggleSwitch } from './ToggleSwitch';
import type { NotificationPreferences, SaveStatus } from './types';

interface NotificationPreferencesSectionProps {
  notifications: NotificationPreferences;
  saveStatus: SaveStatus;
  onUpdateNotification: <K extends keyof NotificationPreferences>(key: K, value: NotificationPreferences[K]) => void;
}

export function NotificationPreferencesSection({
  notifications,
  saveStatus,
  onUpdateNotification,
}: NotificationPreferencesSectionProps) {
  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Preferencias de notificacao</h2>
          <p className="text-sm text-slate-500 mt-1">
            Ajuste prioridade, horario e nivel de automacao para reduzir ruido e manter foco.
          </p>
        </div>
        {saveStatus === 'saved' && (
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 size={14} />
            Salvo automaticamente
          </p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Alertas de prazos criticos (24h)</p>
              <p className="text-xs text-slate-500 mt-0.5">Disparo imediato para eventos com risco de perda de prazo.</p>
            </div>
            <ToggleSwitch
              checked={notifications.criticalAlerts24h}
              onChange={() => onUpdateNotification('criticalAlerts24h', !notifications.criticalAlerts24h)}
              ariaLabel="Ativar alertas de prazos criticos"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Resumo diario "O que fazer hoje"</p>
              <p className="text-xs text-slate-500 mt-0.5">Briefing de manha com prioridades do dia e orientacao de foco.</p>
            </div>
            <ToggleSwitch
              checked={notifications.dailySummaryMorning}
              onChange={() => onUpdateNotification('dailySummaryMorning', !notifications.dailySummaryMorning)}
              ariaLabel="Ativar resumo diario"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Sugestao automatica de tarefas (IA)</p>
              <p className="text-xs text-slate-500 mt-0.5">Gera proxima acao por movimentacao para acelerar sua execucao.</p>
            </div>
            <ToggleSwitch
              checked={notifications.aiTaskSuggestions}
              onChange={() => onUpdateNotification('aiTaskSuggestions', !notifications.aiTaskSuggestions)}
              ariaLabel="Ativar sugestao automatica de tarefas"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Relatorio de produtividade semanal</p>
              <p className="text-xs text-slate-500 mt-0.5">Panorama de carga, pendencias e gargalos para a proxima semana.</p>
            </div>
            <ToggleSwitch
              checked={notifications.weeklyProductivityReport}
              onChange={() => onUpdateNotification('weeklyProductivityReport', !notifications.weeklyProductivityReport)}
              ariaLabel="Ativar relatorio de produtividade semanal"
            />
          </div>
        </div>

        <aside className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Agendamento</p>
            <div className="mt-2">
              <label htmlFor="dailySummaryTime" className="text-sm font-medium text-slate-700">
                Horario do resumo diario
              </label>
              <select
                id="dailySummaryTime"
                value={notifications.dailySummaryTime}
                onChange={(event) => onUpdateNotification('dailySummaryTime', event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              >
                <option value="07:30">07:30</option>
                <option value="08:00">08:00</option>
                <option value="08:30">08:30</option>
                <option value="09:00">09:00</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900">Janela silenciosa</p>
              <ToggleSwitch
                checked={notifications.quietHoursEnabled}
                onChange={() => onUpdateNotification('quietHoursEnabled', !notifications.quietHoursEnabled)}
                ariaLabel="Ativar janela silenciosa"
              />
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="quietStart" className="text-xs font-medium text-slate-600">
                  Inicio
                </label>
                <input
                  id="quietStart"
                  type="time"
                  value={notifications.quietStart}
                  onChange={(event) => onUpdateNotification('quietStart', event.target.value)}
                  disabled={!notifications.quietHoursEnabled}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>
              <div>
                <label htmlFor="quietEnd" className="text-xs font-medium text-slate-600">
                  Fim
                </label>
                <input
                  id="quietEnd"
                  type="time"
                  value={notifications.quietEnd}
                  onChange={(event) => onUpdateNotification('quietEnd', event.target.value)}
                  disabled={!notifications.quietHoursEnabled}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Preview de entrega</p>
            <div className="mt-2 rounded-lg border border-blue-100 bg-blue-50 p-3">
              <p className="text-xs font-semibold text-blue-900 inline-flex items-center gap-1">
                <Bell size={12} />
                Hoje {notifications.dailySummaryTime}
              </p>
              <p className="text-xs text-blue-800 mt-1">
                2 prazos criticos, 1 sugestao de tarefa por IA e 3 atualizacoes processuais.
              </p>
            </div>
            <div className="mt-2 rounded-lg border border-amber-100 bg-amber-50 p-3">
              <p className="text-xs font-semibold text-amber-900 inline-flex items-center gap-1">
                <Clock3 size={12} />
                Prioridade de ruido
              </p>
              <p className="text-xs text-amber-800 mt-1">
                Alertas fora da janela silenciosa: {notifications.quietHoursEnabled ? 'sim' : 'nao aplicavel'}.
              </p>
            </div>
            <div className="mt-2 rounded-lg border border-emerald-100 bg-emerald-50 p-3">
              <p className="text-xs font-semibold text-emerald-900 inline-flex items-center gap-1">
                <Zap size={12} />
                Automacao
              </p>
              <p className="text-xs text-emerald-800 mt-1">
                Sugestoes IA {notifications.aiTaskSuggestions ? 'ativadas' : 'desativadas'} para acelerar seu fluxo.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
