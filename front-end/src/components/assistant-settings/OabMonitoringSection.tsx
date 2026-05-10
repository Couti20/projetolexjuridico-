/**
 * OabMonitoringSection — exibe a OAB única do usuário autenticado.
 *
 * A OAB não pode ser alterada aqui; ela vem do perfil do usuário (AuthContext).
 * Para atualizar a OAB o usuário deve ir em Configurações > Perfil.
 */

import { ShieldCheck, ShieldAlert } from 'lucide-react';
import type { OabEntry } from './types';

interface OabMonitoringSectionProps {
  /** OAB do usuário autenticado, já formatada (ex: OAB/SP 123.456) */
  userOab: string | undefined;
  formatOab: (oab: OabEntry) => string;
}

export function OabMonitoringSection({
  userOab,
}: OabMonitoringSectionProps) {
  const hasOab = Boolean(userOab?.trim());

  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Monitoramento de OAB</h2>
          <p className="text-sm text-slate-500 mt-1">
            Sua OAB está sendo monitorada automaticamente pelo assistente.
          </p>
        </div>
        <span
          className={[
            'inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-1 border',
            hasOab
              ? 'text-blue-700 bg-blue-50 border-blue-200'
              : 'text-amber-700 bg-amber-50 border-amber-200',
          ].join(' ')}
        >
          {hasOab ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />}
          {hasOab ? 'Ativo' : 'Pendente'}
        </span>
      </div>

      {/* OAB do usuário */}
      <div className="mt-4">
        {hasOab ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <ShieldCheck size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{userOab}</p>
              <p className="text-xs text-slate-500 mt-0.5">Monitoramento diário habilitado</p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
            <p className="text-sm font-semibold text-slate-800">Nenhuma OAB cadastrada.</p>
            <p className="text-xs text-slate-500 mt-1">
              Acesse{' '}
              <a
                href="/configuracoes/perfil"
                className="text-blue-600 hover:underline font-medium"
              >
                Configurações &rsaquo; Perfil
              </a>{' '}
              para informar sua OAB.
            </p>
          </div>
        )}
      </div>

      {/* Nota informativa */}
      {hasOab && (
        <p className="mt-3 text-xs text-slate-400">
          Para alterar sua OAB, acesse{' '}
          <a
            href="/configuracoes/perfil"
            className="text-blue-500 hover:underline"
          >
            Configurações &rsaquo; Perfil
          </a>.
        </p>
      )}
    </section>
  );
}
