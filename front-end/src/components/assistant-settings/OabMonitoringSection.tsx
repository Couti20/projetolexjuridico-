import { Plus, ShieldAlert, Trash2 } from 'lucide-react';
import type { OabEntry } from './types';

interface OabFeedback {
  type: 'error' | 'success';
  text: string;
}

interface OabMonitoringSectionProps {
  oabs: OabEntry[];
  oabInput: string;
  oabFeedback: OabFeedback | null;
  onOabInputChange: (value: string) => void;
  onAddOab: () => void;
  onRemoveOab: (id: string) => void;
  formatOab: (oab: OabEntry) => string;
}

export function OabMonitoringSection({
  oabs,
  oabInput,
  oabFeedback,
  onOabInputChange,
  onAddOab,
  onRemoveOab,
  formatOab,
}: OabMonitoringSectionProps) {
  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Monitoramento de OAB</h2>
          <p className="text-sm text-slate-500 mt-1">
            Adicione uma ou mais OABs para acompanhar movimentacoes sem sair do PrazoAlert.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-1">
          <ShieldAlert size={13} />
          Ativo
        </span>
      </div>

      <div className="mt-4 space-y-2 max-h-56 overflow-y-auto pr-1">
        {oabs.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
            <p className="text-sm font-semibold text-slate-800">Nenhuma OAB em monitoramento.</p>
            <p className="text-xs text-slate-500 mt-1">Adicione ao menos uma OAB para iniciar os alertas.</p>
          </div>
        ) : (
          oabs.map((entry) => (
            <div
              key={entry.id}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between gap-2"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">{formatOab(entry)}</p>
                <p className="text-xs text-slate-500">Monitoramento diario habilitado</p>
              </div>
              <button
                type="button"
                onClick={() => onRemoveOab(entry.id)}
                className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700"
              >
                <Trash2 size={14} />
                Remover
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-3 rounded-xl border border-dashed border-blue-300 bg-blue-50/50 p-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={oabInput}
            onChange={(event) => onOabInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                onAddOab();
              }
            }}
            placeholder="Ex.: OAB/SP 123456 ou OAB/RJ 654321"
            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          />
          <button
            type="button"
            onClick={onAddOab}
            className="btn-primary inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold"
          >
            <Plus size={14} />
            Adicionar
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Dica: voce pode colar varias OABs separadas por virgula, ponto e virgula ou quebra de linha.
        </p>
        {oabFeedback && (
          <p className={`mt-2 text-xs font-semibold ${oabFeedback.type === 'error' ? 'text-red-600' : 'text-emerald-700'}`}>
            {oabFeedback.text}
          </p>
        )}
      </div>
    </section>
  );
}
