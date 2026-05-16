export interface OabEntry {
  id: string;
  uf: string;
  number: string;
}

export interface NotificationPreferences {
  criticalAlerts24h: boolean;
  dailySummaryMorning: boolean;
  aiTaskSuggestions: boolean;
  weeklyProductivityReport: boolean;
  quietHoursEnabled: boolean;
  quietStart: string;
  quietEnd: string;
  dailySummaryTime: string;
  maxDailyMessages: number;
  templateCritical24h: string;
  templateAttention72h: string;
  templateDailySummary: string;
}

export type WhatsAppConnectionStatus =
  | 'connected'
  | 'disconnected'
  | 'connecting'
  | 'qr_pending'
  | 'qr_expired'
  | 'error';
export type SaveStatus = 'idle' | 'saved';
export type TestStatus = 'idle' | 'sending' | 'sent' | 'failed';

export type DeliveryStatus = 'sent' | 'failed' | 'pending';

export interface DeliveryHistoryItem {
  id: string;
  title: string;
  createdAtLabel: string;
  status: DeliveryStatus;
  detail: string;
}
