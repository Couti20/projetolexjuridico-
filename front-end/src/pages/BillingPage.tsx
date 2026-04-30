import { useState } from 'react';
import { BadgeCheck, CreditCard, Download, ReceiptText, Sparkles } from 'lucide-react';
import { AppLayout } from '../layouts/AppLayout';

interface Invoice {
  id: string;
  competence: string;
  amount: string;
  dueDate: string;
  status: 'paid' | 'pending';
}

const INVOICES: Invoice[] = [
  { id: 'INV-2026-04', competence: 'Abr/2026', amount: 'R$ 149,00', dueDate: '10/04/2026', status: 'paid' },
  { id: 'INV-2026-03', competence: 'Mar/2026', amount: 'R$ 149,00', dueDate: '10/03/2026', status: 'paid' },
  { id: 'INV-2026-05', competence: 'Mai/2026', amount: 'R$ 149,00', dueDate: '10/05/2026', status: 'pending' },
];

export function BillingPage() {
  const [autoRenew, setAutoRenew] = useState(true);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Plano e faturamento</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Gerencie seu plano, forma de pagamento e histórico de cobranças.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="text-xs uppercase tracking-wider text-blue-600 font-semibold">Plano atual</p>
                <h2 className="text-lg font-bold text-slate-900 mt-1">Solo / Essencial</h2>
                <p className="text-sm text-slate-500">Ideal para advogados autônomos.</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                <BadgeCheck size={14} />
                Assinatura ativa
              </span>
            </div>

            <div className="flex items-end gap-1 mb-5">
              <p className="text-3xl font-bold text-slate-900">R$ 149</p>
              <p className="text-sm text-slate-500 pb-1">/mês</p>
            </div>

            <ul className="space-y-2 text-sm text-slate-700 mb-6">
              <li>Até 50 processos ativos</li>
              <li>Alertas no WhatsApp</li>
              <li>Monitoramento diário automático</li>
            </ul>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                className="btn-primary px-4 py-2.5 text-sm font-semibold inline-flex items-center justify-center gap-2"
              >
                <Sparkles size={15} />
                Fazer upgrade para Office
              </button>
              <button
                type="button"
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:border-slate-400"
              >
                Falar com suporte comercial
              </button>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Resumo da cobrança</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Próximo vencimento</span>
                <span className="font-medium text-slate-800">10/05/2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Forma de pagamento</span>
                <span className="font-medium text-slate-800">Cartão final 4482</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className="text-emerald-700 font-semibold">Em dia</span>
              </div>
            </div>

            <label className="mt-5 flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRenew}
                onChange={(event) => setAutoRenew(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-blue-600"
              />
              <span className="text-sm text-slate-700">
                Renovação automática {autoRenew ? 'ativada' : 'desativada'}.
              </span>
            </label>

            <button
              type="button"
              className="mt-5 w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:border-slate-400"
            >
              Atualizar forma de pagamento
            </button>
          </section>
        </div>

        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <ReceiptText size={16} className="text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">Histórico de faturas</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="py-2.5 font-semibold">Competência</th>
                  <th className="py-2.5 font-semibold">ID</th>
                  <th className="py-2.5 font-semibold">Valor</th>
                  <th className="py-2.5 font-semibold">Vencimento</th>
                  <th className="py-2.5 font-semibold">Status</th>
                  <th className="py-2.5 font-semibold text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {INVOICES.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-slate-50 text-sm text-slate-700">
                    <td className="py-3">{invoice.competence}</td>
                    <td className="py-3 text-slate-500">{invoice.id}</td>
                    <td className="py-3 font-medium">{invoice.amount}</td>
                    <td className="py-3">{invoice.dueDate}</td>
                    <td className="py-3">
                      {invoice.status === 'paid' ? (
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1 text-xs font-semibold">
                          Pago
                        </span>
                      ) : (
                        <span className="text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1 text-xs font-semibold">
                          Pendente
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        disabled={invoice.status !== 'paid'}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 disabled:text-slate-300 disabled:cursor-not-allowed"
                      >
                        <Download size={13} />
                        Baixar PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800 flex items-start gap-2">
            <CreditCard size={14} className="shrink-0 mt-0.5" />
            <p>
              Para troca de plano ou ajuste de cobrança retroativa, use o suporte comercial no botão acima.
            </p>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
