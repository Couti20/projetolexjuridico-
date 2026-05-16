/**
 * AssistantSettingsPage — Página de configurações do assistente WhatsApp.
 *
 * Responsabilidades:
 * - Gerenciar estado local de preferências de notificação e status do WhatsApp.
 * - Persistir configurações via localStorage (chave versionada).
 * - Orquestrar os sub-componentes sem lógica de UI neles.
 *
 * Nota: WhatsAppIntegrationSection usa a feature flag WHATSAPP_INTEGRATION_READY
 * para ocultar o QR/botões enquanto o back-end não estiver pronto.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppLayout } from '../layouts/AppLayout';
import { AssistantHeaderSummary } from '../components/assistant-settings/AssistantHeaderSummary';
import { OabMonitoringSection } from '../components/assistant-settings/OabMonitoringSection';
import { WhatsAppIntegrationSection } from '../components/assistant-settings/WhatsAppIntegrationSection';
import { NotificationPreferencesSection } from '../components/assistant-settings/NotificationPreferencesSection';
import { useAuth } from '../hooks/useAuth';
import type {
  NotificationPreferences,
  OabEntry,
  SaveStatus,
  TestStatus,
  DeliveryHistoryItem,
  WhatsAppConnectionStatus,
} from '../components/assistant-settings/types';

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface StoredAssistantSettings {
  notifications?: NotificationPreferences;
  whatsAppStatus?: WhatsAppConnectionStatus;
  connectedDevice?: string;
  deliveryHistory?: DeliveryHistoryItem[];
}

// ─── Constantes ──────────────────────────────────────────────────────────────

const STORAGE_KEY = 'lex-assistant-settings-v4';

const INITIAL_NOTIFICATIONS: NotificationPreferences = {
  criticalAlerts24h:        true,
  dailySummaryMorning:      true,
  aiTaskSuggestions:        true,
  weeklyProductivityReport: false,
  quietHoursEnabled:        false,
  quietStart:               '22:00',
  quietEnd:                 '07:00',
  dailySummaryTime:         '08:00',
  maxDailyMessages:         12,
  templateCritical24h:      'Alerta crítico: prazo {prazo} no processo {processo}. Priorize esta ação agora.',
  templateAttention72h:     'Atenção: prazo em até 72h no processo {processo}. Revise documentos e estratégia.',
  templateDailySummary:     'Resumo diário: {resumo}',
};

const INITIAL_DELIVERY_HISTORY: DeliveryHistoryItem[] = [
  {
    id: 'delivery-1',
    title: 'Resumo diário enviado',
    createdAtLabel: 'Hoje, 08:00',
    status: 'sent',
    detail: 'Entrega concluída para WhatsApp principal.',
  },
  {
    id: 'delivery-2',
    title: 'Alerta crítico 24h',
    createdAtLabel: 'Hoje, 11:42',
    status: 'sent',
    detail: 'Prazo urgente notificado com sucesso.',
  },
  {
    id: 'delivery-3',
    title: 'Relatório semanal',
    createdAtLabel: 'Ontem, 18:05',
    status: 'failed',
    detail: 'Falha temporária no provedor. Reenvio pendente.',
  },
];

const STATUS_SEQUENCE: WhatsAppConnectionStatus[] = [
  'connecting',
  'qr_pending',
  'connected',
  'connected',
  'connecting',
  'connected',
  'qr_expired',
  'connecting',
  'connected',
  'error',
  'connecting',
  'connected',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStoredSettings(): StoredAssistantSettings {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as StoredAssistantSettings;
  } catch {
    return {};
  }
}

/** Normaliza a OAB do perfil para exibição: OAB/SP 123.456 */
function formatUserOab(raw: string | undefined): string {
  if (!raw?.trim()) return '';
  const cleaned = raw.trim().toUpperCase().replace(/^OAB\/?/, '').trim();
  const match = cleaned.match(/^([A-Z]{2})[\s/]*(\d{4,6})$/);
  if (!match) return raw.trim().toUpperCase();
  const [, uf, number] = match;
  return `OAB/${uf} ${number.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

/** Compatibilidade com OabMonitoringSection (prop formatOab) */
function formatOabEntry(oab: OabEntry): string {
  return `OAB/${oab.uf} ${oab.number.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

function formatHistoryLabel(date: Date): string {
  return `Hoje, ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

function formatLastStatusCheckLabel(timestamp: number): string {
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (elapsedSeconds < 60) return `${elapsedSeconds}s atrás`;
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  return `${elapsedMinutes}min atrás`;
}

// ─── Componente ──────────────────────────────────────────────────────────────

export function AssistantSettingsPage() {
  const { user } = useAuth();
  const stored   = useMemo(() => getStoredSettings(), []);

  const userOab = formatUserOab(user?.oab);

  const [whatsAppStatus,  setWhatsAppStatus]  = useState<WhatsAppConnectionStatus>(stored.whatsAppStatus  ?? 'disconnected');
  const [connectedDevice, setConnectedDevice] = useState(stored.connectedDevice ?? '');
  const [testStatus,      setTestStatus]      = useState<TestStatus>('idle');
  const [notifications,   setNotifications]   = useState<NotificationPreferences>(stored.notifications ?? INITIAL_NOTIFICATIONS);
  const [deliveryHistory, setDeliveryHistory] = useState<DeliveryHistoryItem[]>(
    stored.deliveryHistory ?? INITIAL_DELIVERY_HISTORY,
  );
  const [statusCheckAt,   setStatusCheckAt]   = useState<number>(Date.now());
  const [saveStatus,      setSaveStatus]      = useState<SaveStatus>('idle');
  const statusStepRef = useRef(0);

  // Persiste sempre que estado relevante muda
  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        notifications,
        whatsAppStatus,
        connectedDevice,
        deliveryHistory,
      } satisfies StoredAssistantSettings),
    );
  }, [connectedDevice, deliveryHistory, notifications, whatsAppStatus]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  function markSaved() {
    setSaveStatus('saved');
    window.setTimeout(() => setSaveStatus('idle'), 1_600);
  }

  function updateNotification<K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K],
  ) {
    setNotifications((prev) => ({ ...prev, [key]: value }));
    markSaved();
  }

  const handleRefreshStatus = useCallback(() => {
    setStatusCheckAt(Date.now());
    const nextStep = (statusStepRef.current + 1) % STATUS_SEQUENCE.length;
    statusStepRef.current = nextStep;
    const nextStatus = STATUS_SEQUENCE[nextStep];
    setWhatsAppStatus(nextStatus);
    if (nextStatus === 'connected' && !connectedDevice) {
      setConnectedDevice('WhatsApp Web - Escritório');
    }
  }, [connectedDevice]);

  useEffect(() => {
    if (whatsAppStatus === 'disconnected') {
      handleRefreshStatus();
    }
  }, [handleRefreshStatus, whatsAppStatus]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      handleRefreshStatus();
    }, 30_000);
    return () => window.clearInterval(intervalId);
  }, [handleRefreshStatus]);

  function handleSendTestMessage() {
    setTestStatus('sending');
    window.setTimeout(() => {
      const success = whatsAppStatus === 'connected';
      setTestStatus(success ? 'sent' : 'failed');
      setDeliveryHistory((prev) => [
        {
          id: crypto.randomUUID(),
          title: 'Mensagem de teste',
          createdAtLabel: formatHistoryLabel(new Date()),
          status: success ? 'sent' : 'failed',
          detail: success
            ? 'Mensagem de validação entregue com sucesso.'
            : 'Falha ao enviar teste: conexão WhatsApp indisponível.',
        },
        ...prev,
      ]);
      window.setTimeout(() => setTestStatus('idle'), 1_800);
    }, 900);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-5">

        <AssistantHeaderSummary
          userOab={userOab}
          whatsAppStatus={whatsAppStatus}
          alertsEnabledCount={[
            notifications.criticalAlerts24h,
            notifications.dailySummaryMorning,
            notifications.aiTaskSuggestions,
            notifications.weeklyProductivityReport,
          ].filter(Boolean).length}
          quietHoursEnabled={notifications.quietHoursEnabled}
          quietStart={notifications.quietStart}
          quietEnd={notifications.quietEnd}
        />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <OabMonitoringSection
            userOab={userOab}
            formatOab={formatOabEntry}
          />

          <WhatsAppIntegrationSection
            whatsAppStatus={whatsAppStatus}
            connectedDevice={connectedDevice}
            testStatus={testStatus}
            lastStatusCheckLabel={formatLastStatusCheckLabel(statusCheckAt)}
            deliveryHistory={deliveryHistory}
            onRefreshStatus={handleRefreshStatus}
            onSendTestMessage={handleSendTestMessage}
          />
        </div>

        <NotificationPreferencesSection
          notifications={notifications}
          saveStatus={saveStatus}
          onUpdateNotification={updateNotification}
        />
      </div>
    </AppLayout>
  );
}
