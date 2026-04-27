/**
 * Tipos do fluxo de configuração inicial (onboarding pós-login).
 */

export interface SetupFormData {
  oab: string;
  whatsapp: string;
}

export interface SetupFormErrors {
  oab?: string;
  whatsapp?: string;
}

export type SetupStatus = 'idle' | 'validating-oab' | 'oab-valid' | 'oab-invalid' | 'loading' | 'success' | 'error';
