import { CheckCircle2, Link2, MessageCircle, RefreshCcw, Unplug } from 'lucide-react';
import type { TestStatus, WhatsAppConnectionStatus } from './types';

interface WhatsAppIntegrationSectionProps {
  whatsAppStatus: WhatsAppConnectionStatus;
  connectedDevice: string;
  qrCells: boolean[];
  qrCountdown: string;
  testStatus: TestStatus;
  onDisconnectWhatsApp: () => void;
  onConnectWhatsApp: () => void;
  onRefreshQr: () => void;
  onSendTestMessage: () => void;
}

export function WhatsAppIntegrationSection({
  whatsAppStatus,
  connectedDevice,
  qrCells,
  qrCountdown,
  testStatus,
  onDisconnectWhatsApp,
  onConnectWhatsApp,
  onRefreshQr,
  onSendTestMessage,
}: WhatsAppIntegrationSectionProps) {
  return (
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
                onClick={onDisconnectWhatsApp}
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
                onClick={onConnectWhatsApp}
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
              onClick={onRefreshQr}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
            >
              <span className="inline-flex items-center gap-1.5">
                <RefreshCcw size={14} />
                Atualizar QR
              </span>
            </button>

            <button
              type="button"
              onClick={onSendTestMessage}
              disabled={testStatus === 'sending'}
              className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {testStatus === 'sending' ? 'Enviando teste...' : testStatus === 'sent' ? 'Teste enviado' : 'Enviar teste'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
