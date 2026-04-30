import type { WhatsAppConnectionStatus } from './types';

interface AssistantHeaderSummaryProps {
  oabCount: number;
  whatsAppStatus: WhatsAppConnectionStatus;
  alertsEnabledCount: number;
  quietHoursEnabled: boolean;
  quietStart: string;
  quietEnd: string;
}

export function AssistantHeaderSummary({
  oabCount,
  whatsAppStatus,
  alertsEnabledCount,
  quietHoursEnabled,
  quietStart,
  quietEnd,
}: AssistantHeaderSummaryProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 p-5 sm:p-6">
      <div className="relative z-10">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Configuracoes do assistente</h1>
        <p className="text-sm text-blue-100 mt-1 max-w-3xl">
          Centralize monitoramento de OAB, conexao do WhatsApp e preferencias de notificacao para manter sua rotina
          juridica organizada e sem perda de prazo.
        </p>

        <div className="mt-4 grid grid-cols-2 xl:grid-cols-4 gap-2.5">
          <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-wide text-blue-100/80 font-semibold">OABs ativas</p>
            <p className="text-lg font-bold text-white mt-0.5">{oabCount}</p>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-wide text-blue-100/80 font-semibold">WhatsApp</p>
            <p className="text-sm font-semibold text-white mt-1">
              {whatsAppStatus === 'connected'
                ? 'Conectado'
                : whatsAppStatus === 'connecting'
                ? 'Conectando...'
                : 'Desconectado'}
            </p>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-wide text-blue-100/80 font-semibold">Alertas ativos</p>
            <p className="text-lg font-bold text-white mt-0.5">{alertsEnabledCount}/4</p>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-wide text-blue-100/80 font-semibold">Silencioso</p>
            <p className="text-sm font-semibold text-white mt-1">
              {quietHoursEnabled ? `${quietStart} - ${quietEnd}` : 'Desativado'}
            </p>
          </div>
        </div>
      </div>
      <div className="absolute -right-14 -top-14 h-48 w-48 rounded-full bg-blue-400/20 blur-2xl" />
    </section>
  );
}
