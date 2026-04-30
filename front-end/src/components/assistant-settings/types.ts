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
}

export type WhatsAppConnectionStatus = 'connected' | 'disconnected' | 'connecting';
export type SaveStatus = 'idle' | 'saved';
export type TestStatus = 'idle' | 'sending' | 'sent';
