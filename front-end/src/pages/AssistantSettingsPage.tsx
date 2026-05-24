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

import { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '../layouts/AppLayout';
import { TrialFeatureGate } from '../components/TrialFeatureGate';
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
  WhatsAppConnectionStatus,
} from '../components/assistant-settings/types';

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface StoredAssistantSettings {
  notifications?: NotificationPreferences;
  whatsAppStatus?: WhatsAppConnectionStatus;
  connectedDevice?: string;
}

// ─── Constantes ──────────────────────────────────────────────────────────────

const STORAGE_KEY = 'lex-assistant-settings-v3';

const INITIAL_NOTIFICATIONS: NotificationPreferences = {
  criticalAlerts24h:        true,
  dailySummaryMorning:      true,
  aiTaskSuggestions:        true,
  weeklyProductivityReport: false,
  quietHoursEnabled:        false,
  quietStart:               '22:00',
  quietEnd:                 '07:00',
  dailySummaryTime:         '08:00',
  // compatibility fields expected by older NotificationPreferences shape
  maxDailyMessages: 12,
  templateCritical24h: 'Alerta crítico: prazo {prazo} no processo {processo}. Priorize esta ação agora.',
  templateAttention72h: 'Atenção: prazo em até 72h no processo {processo}. Revise documentos e estratégia.',
  templateDailySummary: 'Resumo diário: {resumo}',
};

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

// ─── Componente ──────────────────────────────────────────────────────────────

export function AssistantSettingsPage() {
  const { user } = useAuth();
  const stored   = useMemo(() => getStoredSettings(), []);

  const userOab = formatUserOab(user?.oab);

  const [whatsAppStatus,  setWhatsAppStatus]  = useState<WhatsAppConnectionStatus>(stored.whatsAppStatus  ?? 'disconnected');
  const [connectedDevice, setConnectedDevice] = useState(stored.connectedDevice ?? '');
  const [testStatus,      setTestStatus]      = useState<TestStatus>('idle');
  const [notifications,   setNotifications]   = useState<NotificationPreferences>(stored.notifications ?? INITIAL_NOTIFICATIONS);
  const [saveStatus,      setSaveStatus]      = useState<SaveStatus>('idle');

  // Persiste sempre que estado relevante muda
  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        notifications,
        whatsAppStatus,
        connectedDevice,
      } satisfies StoredAssistantSettings),
    );
  }, [connectedDevice, notifications, whatsAppStatus]);

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

  function handleSendTestMessage() {
    setTestStatus('sending');
    window.setTimeout(() => {
      setTestStatus('sent');
      window.setTimeout(() => setTestStatus('idle'), 1_800);
    }, 800);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const isTrialUser = Boolean(user?.usuarioTeste);

  return (
    <AppLayout>
      <TrialFeatureGate
        isTrialUser={isTrialUser}
        title="Configurações Bloqueadas"
        description="Assine um plano para configurar o assistente, notificações e WhatsApp"
      >
        <div className="max-w-4xl mx-auto space-y-6">

        {/* Cabeçalho */}
        <div>
          <h1 className="text-xl font-bold text-slate-900">Configurações do Assistente</h1>
          <p className="text-sm text-slate-500 mt-0.5">Personalize suas notificações e integração com WhatsApp</p>
        </div>

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
            lastStatusCheckLabel={''}
            deliveryHistory={[]}
            onRefreshStatus={() => {}}
            onSendTestMessage={handleSendTestMessage}
          />
        </div>

        <NotificationPreferencesSection
          notifications={notifications}
          saveStatus={saveStatus}
          onUpdateNotification={updateNotification}
        />
        </div>
      </TrialFeatureGate>
    </AppLayout>
  );
}
