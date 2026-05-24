/**
 * SettingsPage — Hub de configurações da conta.
 *
 * Centraliza: Perfil, Segurança, Plano & Faturamento e Ajuda.
 * Cada card navega para a página dedicada já existente.
 */

import { useNavigate } from 'react-router-dom';
import {
  User, Shield, CreditCard, HelpCircle,
  ChevronRight,
} from 'lucide-react';
import { AppLayout } from '../layouts/AppLayout';
import { TrialFeatureGate } from '../components/TrialFeatureGate';
import { useAuth } from '../hooks/useAuth';

const SETTINGS_ITEMS = [
  {
    icon: User,
    title: 'Perfil',
    description: 'Nome, e-mail, OAB e dados da conta',
    path: '/configuracoes/perfil',
    color: 'text-blue-400',
    bg: 'bg-blue-600/10',
  },
  {
    icon: Shield,
    title: 'Segurança',
    description: 'Alterar senha e proteção da conta',
    path: '/configuracoes/seguranca',
    color: 'text-emerald-400',
    bg: 'bg-emerald-600/10',
  },
  {
    icon: CreditCard,
    title: 'Plano & Faturamento',
    description: 'Seu plano atual, faturas e upgrade',
    path: '/configuracoes/plano-faturamento',
    color: 'text-amber-400',
    bg: 'bg-amber-600/10',
  },
  {
    icon: HelpCircle,
    title: 'Ajuda & Suporte',
    description: 'Central de ajuda, contato e tutoriais',
    path: '/configuracoes/ajuda',
    color: 'text-purple-400',
    bg: 'bg-purple-600/10',
  },
];

export function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTrialUser = Boolean(user?.usuarioTeste);

  return (
    <AppLayout>
      <TrialFeatureGate
        isTrialUser={isTrialUser}
        title="Configurações Bloqueadas"
        description="Assine um plano para acessar configurações da conta, plano e suporte"
      >
        <div className="max-w-3xl mx-auto space-y-6">

        {/* Cabeçalho */}
        <div>
          <h1 className="text-xl font-bold text-slate-900">Configurações</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gerencie sua conta e preferências</p>
        </div>

        {/* Card do usuário */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
            {user?.fullName
              ?.split(' ')
              .slice(0, 2)
              .map((n) => n[0] ?? '')
              .join('')
              .toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 truncate">{user?.fullName ?? '—'}</p>
            <p className="text-sm text-slate-500 truncate">{user?.email ?? '—'}</p>
            {user?.oab && (
              <p className="text-xs text-blue-600 font-medium mt-0.5">{user.oab}</p>
            )}
          </div>
        </div>

        {/* Lista de configurações */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {SETTINGS_ITEMS.map(({ icon: Icon, title, description, path, color, bg }) => (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors text-left"
            >
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon size={18} className={color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{description}</p>
              </div>
              <ChevronRight size={16} className="text-slate-400 shrink-0" />
            </button>
          ))}
        </div>

        </div>
      </TrialFeatureGate>
    </AppLayout>
  );
}
