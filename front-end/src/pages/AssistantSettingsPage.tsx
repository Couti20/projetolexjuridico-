import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock3,
  Link2,
  MessageCircle,
  Plus,
  RefreshCcw,
  ShieldAlert,
  Trash2,
  Unplug,
  Zap,
} from 'lucide-react';
import { AppLayout } from '../layouts/AppLayout';

interface OabEntry {
  id: string;
  uf: string;
  number: string;
}

interface NotificationPreferences {
  criticalAlerts24h: boolean;
  dailySummaryMorning: boolean;
  aiTaskSuggestions: boolean;
  weeklyProductivityReport: boolean;
  quietHoursEnabled: boolean;
  quietStart: string;
  quietEnd: string;
  dailySummaryTime: string;
}

interface StoredAssistantSettings {
  oabs?: OabEntry[];
  notifications?: NotificationPreferences;
  whatsAppStatus?: WhatsAppConnectionStatus;
  connectedDevice?: string;
}

type WhatsAppConnectionStatus = 'connected' | 'disconnected' | 'connecting';
type SaveStatus = 'idle' | 'saved';
type TestStatus = 'idle' | 'sending' | 'sent';

const STORAGE_KEY = 'lex-assistant-settings-v2';

const INITIAL_OABS: OabEntry[] = [{ id: 'oab-sp-123456', uf: 'SP', number: '123456' }];

const INITIAL_NOTIFICATIONS: NotificationPreferences = {
  criticalAlerts24h: true,
  dailySummaryMorning: true,
  aiTaskSuggestions: true,
  weeklyProductivityReport: false,
  quietHoursEnabled: false,
  quietStart: '22:00',
  quietEnd: '07:00',
  dailySummaryTime: '08:00',
};

function getStoredSettings(): StoredAssistantSettings {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};

    return parsed as StoredAssistantSettings;
  } catch (error) {
    console.error('Nao foi possivel restaurar configuracoes do assistente.', error);
    return {};
  }
}

function normalizeOabInput(value: string): OabEntry | null {
  const cleaned = value.trim().toUpperCase().replace(/\s+/g, ' ');
  const normalized = cleaned
    .replace(/^OAB\/?/, '')
    .replace(/[.\-]/g, '')
    .trim();

  const match = normalized.match(/^([A-Z]{2})\s*([0-9]{4,6})$/);
  if (!match) return null;

  return {
    id: `oab-${match[1].toLowerCase()}-${match[2]}`,
    uf: match[1],
    number: match[2],
  };
}

function formatOab(oab: OabEntry): string {
  const formattedNumber = oab.number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `OAB/${oab.uf} ${formattedNumber}`;
}

function finderValue(row: number, col: number, originRow: number, originCol: number): boolean {
  const localRow = row - originRow;
  const localCol = col - originCol;
  const outer = localRow === 0 || localRow === 6 || localCol === 0 || localCol === 6;
  const inner = localRow >= 2 && localRow <= 4 && localCol >= 2 && localCol <= 4;
  return outer || inner;
}

function buildQrCells(seed: number, size = 21): boolean[] {
  const cells: boolean[] = [];
  let state = seed * 9301 + 49297;

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const onTopLeft = row <= 6 && col <= 6;
      const onTopRight = row <= 6 && col >= size - 7;
      const onBottomLeft = row >= size - 7 && col <= 6;

      if (onTopLeft) {
        cells.push(finderValue(row, col, 0, 0));
        continue;
      }
      if (onTopRight) {
        cells.push(finderValue(row, col, 0, size - 7));
        continue;
      }
      if (onBottomLeft) {
        cells.push(finderValue(row, col, size - 7, 0));
        continue;
      }

      state = (state * 1103515245 + 12345) % 2147483648;
      cells.push((state % 9) < 4);
    }
  }

  return cells;
}

function Switch({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  onChange: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={ariaLabel}
      aria-checked={checked}
      onClick={onChange}
      className={[
        'relative h-6 w-11 rounded-full border transition-colors shrink-0',
        checked ? 'bg-blue-600 border-blue-600' : 'bg-slate-200 border-slate-300',
      ].join(' ')}
    >
      <span
        className={[
          'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5',
        ].join(' ')}
      />
    </button>
  );
}

export function AssistantSettingsPage() {
  const stored = useMemo(() => getStoredSettings(), []);

  const [oabs, setOabs] = useState<OabEntry[]>(stored.oabs ?? INITIAL_OABS);
  const [oabInput, setOabInput] = useState('');
  const [oabFeedback, setOabFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const [whatsAppStatus, setWhatsAppStatus] = useState<WhatsAppConnectionStatus>(stored.whatsAppStatus ?? 'connected');
  const [connectedDevice, setConnectedDevice] = useState(stored.connectedDevice ?? 'iPhone 15 do Dr. Joao');
  const [qrSeed, setQrSeed] = useState(11);
  const [qrExpiresAt, setQrExpiresAt] = useState(() => Date.now() + 2 * 60 * 1000);
  const [clockTick, setClockTick] = useState(Date.now());
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');

  const [notifications, setNotifications] = useState<NotificationPreferences>(
    stored.notifications ?? INITIAL_NOTIFICATIONS,
  );
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  useEffect(() => {
    const intervalId = window.setInterval(() => setClockTick(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        oabs,
        notifications,
        whatsAppStatus,
        connectedDevice,
      } satisfies StoredAssistantSettings),
    );
  }, [connectedDevice, notifications, oabs, whatsAppStatus]);

  const qrCells = useMemo(() => buildQrCells(qrSeed), [qrSeed]);
  const alertsEnabledCount = useMemo(
    () =>
      [
        notifications.criticalAlerts24h,
        notifications.dailySummaryMorning,
        notifications.aiTaskSuggestions,
        notifications.weeklyProductivityReport,
      ].filter(Boolean).length,
    [notifications],
  );

  const qrRemainingSeconds = Math.max(0, Math.ceil((qrExpiresAt - clockTick) / 1000));
  const qrCountdown = `${String(Math.floor(qrRemainingSeconds / 60)).padStart(2, '0')}:${String(
    qrRemainingSeconds % 60,
  ).padStart(2, '0')}`;

  function markSaved() {
    setSaveStatus('saved');
    window.setTimeout(() => setSaveStatus('idle'), 1600);
  }

  function updateNotification<K extends keyof NotificationPreferences>(key: K, value: NotificationPreferences[K]) {
    setNotifications((prev) => ({ ...prev, [key]: value }));
    markSaved();
  }

  function handleAddOab() {
    const tokens = oabInput
      .split(/[\n,;]+/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (tokens.length === 0) {
      setOabFeedback({ type: 'error', text: 'Digite ao menos uma OAB valida para adicionar.' });
      return;
    }

    const parsedEntries: OabEntry[] = [];
    const invalidInputs: string[] = [];

    for (const token of tokens) {
      const parsed = normalizeOabInput(token);
      if (!parsed) {
        invalidInputs.push(token);
      } else {
        parsedEntries.push(parsed);
      }
    }

    if (invalidInputs.length > 0) {
      setOabFeedback({
        type: 'error',
        text: `Formato invalido: ${invalidInputs[0]}. Exemplo aceito: OAB/SP 123456`,
      });
      return;
    }

    const existingIds = new Set(oabs.map((entry) => entry.id));
    const newEntries = parsedEntries.filter((entry) => !existingIds.has(entry.id));

    if (newEntries.length === 0) {
      setOabFeedback({ type: 'error', text: 'As OABs informadas ja estavam em monitoramento.' });
      return;
    }

    setOabs((prev) => [...prev, ...newEntries]);
    setOabInput('');
    setOabFeedback({
      type: 'success',
      text: `${newEntries.length} OAB adicionada${newEntries.length > 1 ? 's' : ''} com sucesso.`,
    });
    markSaved();
  }

  function handleRemoveOab(id: string) {
    setOabs((prev) => prev.filter((entry) => entry.id !== id));
    setOabFeedback({ type: 'success', text: 'OAB removida do monitoramento.' });
    markSaved();
  }

  function handleRefreshQr() {
    setQrSeed((prev) => prev + 1);
    setQrExpiresAt(Date.now() + 2 * 60 * 1000);
  }

  function handleDisconnectWhatsApp() {
    setWhatsAppStatus('disconnected');
    setConnectedDevice('');
    handleRefreshQr();
    markSaved();
  }

  function handleConnectWhatsApp() {
    setWhatsAppStatus('connecting');
    window.setTimeout(() => {
      setWhatsAppStatus('connected');
      setConnectedDevice('iPhone 15 do Dr. Joao');
      markSaved();
    }, 900);
  }

  function handleSendTestMessage() {
    if (whatsAppStatus !== 'connected') {
      setOabFeedback({ type: 'error', text: 'Conecte o WhatsApp antes de enviar notificacao de teste.' });
      return;
    }

    setTestStatus('sending');
    window.setTimeout(() => {
      setTestStatus('sent');
      window.setTimeout(() => setTestStatus('idle'), 1800);
    }, 800);
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-5">
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
                <p className="text-lg font-bold text-white mt-0.5">{oabs.length}</p>
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
                  {notifications.quietHoursEnabled ? `${notifications.quietStart} - ${notifications.quietEnd}` : 'Desativado'}
                </p>
              </div>
            </div>
          </div>
          <div className="absolute -right-14 -top-14 h-48 w-48 rounded-full bg-blue-400/20 blur-2xl" />
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Monitoramento de OAB</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Adicione uma ou mais OABs para acompanhar movimentacoes sem sair do PrazoAlert.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-1">
                <ShieldAlert size={13} />
                Ativo
              </span>
            </div>

            <div className="mt-4 space-y-2 max-h-56 overflow-y-auto pr-1">
              {oabs.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                  <p className="text-sm font-semibold text-slate-800">Nenhuma OAB em monitoramento.</p>
                  <p className="text-xs text-slate-500 mt-1">Adicione ao menos uma OAB para iniciar os alertas.</p>
                </div>
              ) : (
                oabs.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between gap-2"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{formatOab(entry)}</p>
                      <p className="text-xs text-slate-500">Monitoramento diario habilitado</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveOab(entry.id)}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                      Remover
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-3 rounded-xl border border-dashed border-blue-300 bg-blue-50/50 p-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={oabInput}
                  onChange={(event) => {
                    setOabInput(event.target.value);
                    setOabFeedback(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleAddOab();
                    }
                  }}
                  placeholder="Ex.: OAB/SP 123456 ou OAB/RJ 654321"
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={handleAddOab}
                  className="btn-primary inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold"
                >
                  <Plus size={14} />
                  Adicionar
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Dica: voce pode colar varias OABs separadas por virgula, ponto e virgula ou quebra de linha.
              </p>
              {oabFeedback && (
                <p className={`mt-2 text-xs font-semibold ${oabFeedback.type === 'error' ? 'text-red-600' : 'text-emerald-700'}`}>
                  {oabFeedback.text}
                </p>
              )}
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Integracao WhatsApp</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Conecte um dispositivo para receber alertas e checklists no fluxo do seu dia.
                </p>
              </div>
              <span
                className={[
                  'inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-1 border',
                  whatsAppStatus === 'connected'
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : whatsAppStatus === 'connecting'
                    ? 'text-amber-700 bg-amber-50 border-amber-200'
                    : 'text-slate-600 bg-slate-100 border-slate-200',
                ].join(' ')}
              >
                <MessageCircle size={13} />
                {whatsAppStatus === 'connected' ? 'Conectado' : whatsAppStatus === 'connecting' ? 'Conectando...' : 'Desconectado'}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-[176px_1fr] gap-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="w-[152px] h-[152px] rounded-lg bg-white border border-slate-200 p-2 mx-auto">
                  <div
                    className="grid gap-px"
                    style={{ gridTemplateColumns: 'repeat(21, minmax(0, 1fr))' }}
                  >
                    {qrCells.map((filled, index) => (
                      <span key={index} className={filled ? 'h-1.5 w-1.5 bg-slate-900' : 'h-1.5 w-1.5 bg-white'} />
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 text-center">QR de pareamento</p>
                {whatsAppStatus !== 'connected' && (
                  <p className="text-[11px] text-slate-500 mt-1 text-center">Expira em {qrCountdown}</p>
                )}
              </div>

              <div className="space-y-3">
                {whatsAppStatus === 'connected' ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                    <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800">
                      <CheckCircle2 size={14} />
                      Dispositivo conectado: {connectedDevice}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <p className="text-sm font-semibold text-slate-800">Como conectar</p>
                    <p className="text-xs text-slate-600 mt-1">
                      1) Abra o WhatsApp no celular. 2) Escaneie o QR acima. 3) Aguarde a confirmacao de conexao.
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {whatsAppStatus === 'connected' ? (
                    <button
                      type="button"
                      onClick={handleDisconnectWhatsApp}
                      className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Unplug size={14} />
                        Desconectar
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleConnectWhatsApp}
                      disabled={whatsAppStatus === 'connecting'}
                      className="btn-primary px-3 py-2 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Link2 size={14} />
                        {whatsAppStatus === 'connecting' ? 'Conectando...' : 'Conectar WhatsApp'}
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleRefreshQr}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <RefreshCcw size={14} />
                      Atualizar QR
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendTestMessage}
                    disabled={testStatus === 'sending'}
                    className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {testStatus === 'sending' ? 'Enviando teste...' : testStatus === 'sent' ? 'Teste enviado' : 'Enviar teste'}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

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
                <Switch
                  checked={notifications.criticalAlerts24h}
                  onChange={() => updateNotification('criticalAlerts24h', !notifications.criticalAlerts24h)}
                  ariaLabel="Ativar alertas de prazos criticos"
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Resumo diario "O que fazer hoje"</p>
                  <p className="text-xs text-slate-500 mt-0.5">Briefing de manha com prioridades do dia e orientacao de foco.</p>
                </div>
                <Switch
                  checked={notifications.dailySummaryMorning}
                  onChange={() => updateNotification('dailySummaryMorning', !notifications.dailySummaryMorning)}
                  ariaLabel="Ativar resumo diario"
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Sugestao automatica de tarefas (IA)</p>
                  <p className="text-xs text-slate-500 mt-0.5">Gera proxima acao por movimentacao para acelerar sua execucao.</p>
                </div>
                <Switch
                  checked={notifications.aiTaskSuggestions}
                  onChange={() => updateNotification('aiTaskSuggestions', !notifications.aiTaskSuggestions)}
                  ariaLabel="Ativar sugestao automatica de tarefas"
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Relatorio de produtividade semanal</p>
                  <p className="text-xs text-slate-500 mt-0.5">Panorama de carga, pendencias e gargalos para a proxima semana.</p>
                </div>
                <Switch
                  checked={notifications.weeklyProductivityReport}
                  onChange={() => updateNotification('weeklyProductivityReport', !notifications.weeklyProductivityReport)}
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
                    onChange={(event) => updateNotification('dailySummaryTime', event.target.value)}
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
                  <Switch
                    checked={notifications.quietHoursEnabled}
                    onChange={() => updateNotification('quietHoursEnabled', !notifications.quietHoursEnabled)}
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
                      onChange={(event) => updateNotification('quietStart', event.target.value)}
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
                      onChange={(event) => updateNotification('quietEnd', event.target.value)}
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
      </div>
    </AppLayout>
  );
}
