/**
 * WhatsAppIntegrationSection
 *
 * Melhorias:
 * - Status de conexão em tempo quase real (inclui QR pendente/expirado/erro)
 * - Ação de atualização manual + timestamp da última verificação
 * - Envio de mensagem de teste com feedback de sucesso/erro
 * - Histórico de entregas com status e motivo
 */

import { AlertTriangle, CheckCircle2, Clock3, MessageCircle, RefreshCw, Send } from 'lucide-react';
import type { DeliveryHistoryItem, TestStatus, WhatsAppConnectionStatus } from './types';

interface WhatsAppIntegrationSectionProps {
  whatsAppStatus: WhatsAppConnectionStatus;
  connectedDevice: string;
  testStatus: TestStatus;
  lastStatusCheckLabel: string;
  deliveryHistory: DeliveryHistoryItem[];
  onRefreshStatus: () => void;
  onSendTestMessage: () => void;
}

function getStatusMeta(status: WhatsAppConnectionStatus) {
  if (status === 'connected') {
    return { label: 'Conectado', className: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  }
  if (status === 'connecting') {
    return { label: 'Conectando...', className: 'text-amber-700 bg-amber-50 border-amber-200' };
  }
  if (status === 'qr_pending') {
    return { label: 'Aguardando QR', className: 'text-blue-700 bg-blue-50 border-blue-200' };
  }
  if (status === 'qr_expired') {
    return { label: 'QR expirado', className: 'text-amber-700 bg-amber-50 border-amber-200' };
  }
  if (status === 'error') {
    return { label: 'Erro na conexão', className: 'text-red-700 bg-red-50 border-red-200' };
  }
  return { label: 'Desconectado', className: 'text-slate-600 bg-slate-100 border-slate-200' };
}

function getHistoryBadgeClass(status: DeliveryHistoryItem['status']): string {
  if (status === 'sent') return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (status === 'failed') return 'text-red-700 bg-red-50 border-red-200';
  return 'text-amber-700 bg-amber-50 border-amber-200';
}

function getHistoryStatusLabel(status: DeliveryHistoryItem['status']): string {
  if (status === 'sent') return 'Enviado';
  if (status === 'failed') return 'Falhou';
  return 'Pendente';
}

export function WhatsAppIntegrationSection({
  whatsAppStatus,
  connectedDevice,
  testStatus,
  lastStatusCheckLabel,
  deliveryHistory,
  onRefreshStatus,
  onSendTestMessage,
}: WhatsAppIntegrationSectionProps) {
  const statusMeta = getStatusMeta(whatsAppStatus);
  const canSendTest = whatsAppStatus === 'connected';

  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
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
            statusMeta.className,
          ].join(' ')}
        >
          <MessageCircle size={13} />
          {statusMeta.label}
        </span>
      </div>

      <div className="mt-4 space-y-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Status operacional</p>
            <p className="text-xs text-slate-600 mt-0.5">
              Última verificação: {lastStatusCheckLabel}
            </p>
            {whatsAppStatus === 'connected' && (
              <p className="text-xs text-emerald-700 mt-1 inline-flex items-center gap-1">
                <CheckCircle2 size={12} />
                Dispositivo ativo: {connectedDevice || 'Dispositivo principal'}
              </p>
            )}
            {whatsAppStatus === 'qr_pending' && (
              <p className="text-xs text-blue-700 mt-1">
                QR disponível por tempo limitado. Escaneie para concluir a conexão.
              </p>
            )}
            {whatsAppStatus === 'qr_expired' && (
              <p className="text-xs text-amber-700 mt-1 inline-flex items-center gap-1">
                <Clock3 size={12} />
                QR expirado. Atualize para gerar um novo.
              </p>
            )}
            {whatsAppStatus === 'error' && (
              <p className="text-xs text-red-700 mt-1 inline-flex items-center gap-1">
                <AlertTriangle size={12} />
                Falha de conexão com provedor. Tente novamente.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onRefreshStatus}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <RefreshCw size={13} />
            Atualizar status
          </button>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-blue-900">Validação rápida da integração</p>
            <p className="text-xs text-blue-800 mt-0.5">
              Envia uma mensagem de teste para confirmar entrega e latência.
            </p>
          </div>
          <button
            type="button"
            onClick={onSendTestMessage}
            disabled={!canSendTest || testStatus === 'sending'}
            className="inline-flex items-center gap-1 rounded-lg border border-blue-300 bg-white px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={13} />
            {testStatus === 'sending'
              ? 'Enviando...'
              : testStatus === 'sent'
              ? '✓ Teste enviado'
              : testStatus === 'failed'
              ? 'Falha no teste'
              : 'Enviar mensagem de teste'}
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-sm font-semibold text-slate-900">Histórico de entregas</p>
          <div className="mt-2 space-y-2">
            {deliveryHistory.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 flex items-start justify-between gap-2"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-900">{item.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.createdAtLabel}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">{item.detail}</p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getHistoryBadgeClass(item.status)}`}
                >
                  {getHistoryStatusLabel(item.status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
