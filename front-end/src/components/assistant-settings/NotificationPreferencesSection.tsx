/**
 * NotificationPreferencesSection
 *
 * Preferências de notificação via WhatsApp:
 * - 4 toggles de tipos de alerta
 * - Horário do resumo diário
 * - Janela silenciosa + limite diário
 * - Templates por tipo de alerta com preview em tempo real
 */

import { useMemo, useState } from 'react';
import { CheckCircle2, Clock3, MessageSquareText, Zap } from 'lucide-react';
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
  const [selectedTemplate, setSelectedTemplate] = useState<'critical' | 'attention' | 'summary'>('critical');

  const selectedTemplateField = useMemo(() => {
    if (selectedTemplate === 'critical') return 'templateCritical24h' as const;
    if (selectedTemplate === 'attention') return 'templateAttention72h' as const;
    return 'templateDailySummary' as const;
  }, [selectedTemplate]);

  const previewText = useMemo(() => {
    const base = notifications[selectedTemplateField] || '';
    return base
      .replace('{prazo}', '16/05 às 17:00')
      .replace('{processo}', '1002345-67.2023.8.26.0100')
      .replace('{resumo}', 'Você possui 2 prazos críticos, 1 alerta 72h e 3 movimentações novas.');
  }, [notifications, selectedTemplateField]);

  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
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

        <aside className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
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

          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900">Janela silenciosa</p>
              <ToggleSwitch
                checked={notifications.quietHoursEnabled}
                onChange={() => onUpdateNotification('quietHoursEnabled', !notifications.quietHoursEnabled)}
                ariaLabel="Ativar janela silenciosa"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Nenhuma notificação será enviada neste intervalo.
            </p>

            <div className="mt-2 grid grid-cols-2 gap-2">
              {(['quietStart', 'quietEnd'] as const).map((field) => (
                <div key={field}>
                  <label htmlFor={field} className="text-xs font-medium text-slate-600">
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

            <div className="mt-3">
              <label htmlFor="maxDailyMessages" className="text-xs font-medium text-slate-600">
                Limite diário de mensagens
              </label>
              <input
                id="maxDailyMessages"
                type="number"
                min={1}
                max={50}
                value={notifications.maxDailyMessages}
                onChange={(e) =>
                  onUpdateNotification(
                    'maxDailyMessages',
                    Math.min(50, Math.max(1, Number.parseInt(e.target.value || '1', 10))),
                  )
                }
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-shadow"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 space-y-2">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Templates por alerta</p>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedTemplate('critical')}
                className={`rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition-colors ${
                  selectedTemplate === 'critical'
                    ? 'border-blue-300 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Crítico 24h
              </button>
              <button
                type="button"
                onClick={() => setSelectedTemplate('attention')}
                className={`rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition-colors ${
                  selectedTemplate === 'attention'
                    ? 'border-blue-300 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Atenção 72h
              </button>
              <button
                type="button"
                onClick={() => setSelectedTemplate('summary')}
                className={`rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition-colors ${
                  selectedTemplate === 'summary'
                    ? 'border-blue-300 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Resumo diário
              </button>
            </div>

            <textarea
              value={notifications[selectedTemplateField]}
              onChange={(e) => onUpdateNotification(selectedTemplateField, e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-shadow resize-y"
            />
            <p className="text-[11px] text-slate-500">
              Variáveis disponíveis: {'{prazo}'}, {'{processo}'}, {'{resumo}'}.
            </p>

            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
              <p className="text-xs font-semibold text-blue-900 inline-flex items-center gap-1">
                <MessageSquareText size={12} />
                Preview da mensagem
              </p>
              <p className="text-xs text-blue-800 mt-1 whitespace-pre-wrap">{previewText}</p>
            </div>

            <div className="rounded-lg border border-amber-100 bg-amber-50 p-3">
              <p className="text-xs font-semibold text-amber-900 inline-flex items-center gap-1">
                <Clock3 size={12} />
                Prioridade de ruído
              </p>
              <p className="text-xs text-amber-800 mt-1">
                {notifications.quietHoursEnabled
                  ? `Silêncio de ${notifications.quietStart} às ${notifications.quietEnd} e limite de ${notifications.maxDailyMessages} mensagens/dia.`
                  : `Sem silêncio. Limite diário: ${notifications.maxDailyMessages} mensagens.`}
              </p>
            </div>

            <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
              <p className="text-xs font-semibold text-emerald-900 inline-flex items-center gap-1">
                <Zap size={12} />
                Automação
              </p>
              <p className="text-xs text-emerald-800 mt-1">
                Sugestões IA {notifications.aiTaskSuggestions ? 'ativadas' : 'desativadas'} para acelerar seu fluxo.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
