import { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '../layouts/AppLayout';
import { AssistantHeaderSummary } from '../components/assistant-settings/AssistantHeaderSummary';
import { OabMonitoringSection } from '../components/assistant-settings/OabMonitoringSection';
import { WhatsAppIntegrationSection } from '../components/assistant-settings/WhatsAppIntegrationSection';
import { NotificationPreferencesSection } from '../components/assistant-settings/NotificationPreferencesSection';
import type {
  NotificationPreferences,
  OabEntry,
  SaveStatus,
  TestStatus,
  WhatsAppConnectionStatus,
} from '../components/assistant-settings/types';

interface StoredAssistantSettings {
  oabs?: OabEntry[];
  notifications?: NotificationPreferences;
  whatsAppStatus?: WhatsAppConnectionStatus;
  connectedDevice?: string;
}

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
        <AssistantHeaderSummary
          oabCount={oabs.length}
          whatsAppStatus={whatsAppStatus}
          alertsEnabledCount={alertsEnabledCount}
          quietHoursEnabled={notifications.quietHoursEnabled}
          quietStart={notifications.quietStart}
          quietEnd={notifications.quietEnd}
        />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <OabMonitoringSection
            oabs={oabs}
            oabInput={oabInput}
            oabFeedback={oabFeedback}
            onOabInputChange={(value) => {
              setOabInput(value);
              setOabFeedback(null);
            }}
            onAddOab={handleAddOab}
            onRemoveOab={handleRemoveOab}
            formatOab={formatOab}
          />

          <WhatsAppIntegrationSection
            whatsAppStatus={whatsAppStatus}
            connectedDevice={connectedDevice}
            qrCells={qrCells}
            qrCountdown={qrCountdown}
            testStatus={testStatus}
            onDisconnectWhatsApp={handleDisconnectWhatsApp}
            onConnectWhatsApp={handleConnectWhatsApp}
            onRefreshQr={handleRefreshQr}
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
