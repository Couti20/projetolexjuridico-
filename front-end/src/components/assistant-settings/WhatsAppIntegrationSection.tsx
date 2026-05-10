/**
 * WhatsAppIntegrationSection
 *
 * Estado atual:
 * - A integração real com WhatsApp ainda não está implementada no back-end.
 * - O QR code e os botões de conexão exibem um aviso "Em breve" honesto.
 * - Quando a integração estiver pronta, basta remover o bloco COMING_SOON
 *   e descomentar o fluxo real abaixo dele.
 */

import { CheckCircle2, Clock4, MessageCircle, Rocket } from 'lucide-react';
import type { TestStatus, WhatsAppConnectionStatus } from './types';

interface WhatsAppIntegrationSectionProps {
  whatsAppStatus: WhatsAppConnectionStatus;
  connectedDevice: string;
  testStatus: TestStatus;
  onSendTestMessage: () => void;
}

// ─── Feature flag ────────────────────────────────────────────────────────────
// Altere para `true` quando o back-end de integração WhatsApp estiver pronto.
const WHATSAPP_INTEGRATION_READY = false;
// ─────────────────────────────────────────────────────────────────────────────

export function WhatsAppIntegrationSection({
  whatsAppStatus,
  connectedDevice,
  testStatus,
  onSendTestMessage,
}: WhatsAppIntegrationSectionProps) {
  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">

      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Integração WhatsApp</h2>
          <p className="text-sm text-slate-500 mt-1">
            Conecte um dispositivo para receber alertas e checklists no fluxo do seu dia.
          </p>
        </div>

        <span
          className={[
            'inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-1 border shrink-0',
            !WHATSAPP_INTEGRATION_READY
              ? 'text-amber-700 bg-amber-50 border-amber-200'
              : whatsAppStatus === 'connected'
              ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
              : whatsAppStatus === 'connecting'
              ? 'text-amber-700 bg-amber-50 border-amber-200'
              : 'text-slate-600 bg-slate-100 border-slate-200',
          ].join(' ')}
        >
          <MessageCircle size={13} />
          {!WHATSAPP_INTEGRATION_READY
            ? 'Em breve'
            : whatsAppStatus === 'connected'
            ? 'Conectado'
            : whatsAppStatus === 'connecting'
            ? 'Conectando...'
            : 'Desconectado'}
        </span>
      </div>

      {/* ── Em breve ────────────────────────────────────────────────────────── */}
      {!WHATSAPP_INTEGRATION_READY && (
        <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <Rocket size={22} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Integração em desenvolvimento</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Em breve você poderá escanear o QR code e receber alertas de prazos
              e resumos diários diretamente no seu WhatsApp.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5">
            <Clock4 size={12} />
            Disponível em breve
          </div>
        </div>
      )}

      {/* ── Integração real (ativa quando WHATSAPP_INTEGRATION_READY = true) ── */}
      {WHATSAPP_INTEGRATION_READY && (
        <div className="mt-4 space-y-3">
          {whatsAppStatus === 'connected' ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800">
                <CheckCircle2 size={14} />
                Dispositivo conectado: {connectedDevice}
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-sm font-semibold text-slate-800">Como conectar</p>
              <ol className="text-xs text-slate-600 mt-1 space-y-0.5 list-decimal list-inside">
                <li>Abra o WhatsApp no celular.</li>
                <li>Toque em Dispositivos conectados → Conectar dispositivo.</li>
                <li>Escaneie o QR abaixo e aguarde a confirmação.</li>
              </ol>
            </div>
          )}

          {/* Botão de teste — só aparece quando conectado */}
          {whatsAppStatus === 'connected' && (
            <button
              type="button"
              onClick={onSendTestMessage}
              disabled={testStatus === 'sending'}
              className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {testStatus === 'sending'
                ? 'Enviando teste…'
                : testStatus === 'sent'
                ? '✓ Teste enviado'
                : 'Enviar mensagem de teste'}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
