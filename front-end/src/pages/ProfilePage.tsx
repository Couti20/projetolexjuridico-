import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { CheckCircle2, Save, UserRound } from 'lucide-react';
import { AppLayout } from '../layouts/AppLayout';
import { InputField } from '../ui/InputField';

type SaveStatus = 'idle' | 'saving' | 'saved';

interface ProfileFormData {
  fullName: string;
  email: string;
  whatsapp: string;
  oab: string;
  officeName: string;
  primaryArea: string;
  dailyBriefing: boolean;
  criticalAlerts: boolean;
}

interface ProfileFormErrors {
  fullName?: string;
  email?: string;
  whatsapp?: string;
  oab?: string;
}

const INITIAL_PROFILE: ProfileFormData = {
  fullName: 'Dr. João Silva',
  email: 'joao.silva@lex.com.br',
  whatsapp: '(11) 99999-9999',
  oab: 'SP 123456',
  officeName: 'Silva Advocacia',
  primaryArea: 'Direito do Consumidor',
  dailyBriefing: true,
  criticalAlerts: true,
};

function validateProfile(data: ProfileFormData): ProfileFormErrors {
  const errors: ProfileFormErrors = {};

  if (!data.fullName.trim() || data.fullName.trim().split(' ').length < 2) {
    errors.fullName = 'Informe nome e sobrenome.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Informe um e-mail válido.';
  }

  const digits = data.whatsapp.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 13) {
    errors.whatsapp = 'Número inválido. Ex: (11) 99999-9999';
  }

  const normalizedOab = data.oab.trim().toUpperCase().replace(/[.\-]/g, '');
  if (!/^[A-Z]{2}\s*\d{4,6}$|^\d{4,6}\/[A-Z]{2}$/.test(normalizedOab)) {
    errors.oab = 'Formato inválido. Ex: SP 123456';
  }

  return errors;
}

export function ProfilePage() {
  const [initialProfile, setInitialProfile] = useState<ProfileFormData>(INITIAL_PROFILE);
  const [form, setForm] = useState<ProfileFormData>(INITIAL_PROFILE);
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initialProfile),
    [form, initialProfile],
  );

  function updateField<K extends keyof ProfileFormData>(field: K, value: ProfileFormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'fullName' || field === 'email' || field === 'whatsapp' || field === 'oab') {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function handleInputChange(field: keyof ProfileFormData) {
    return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const target = event.target as HTMLInputElement;
      const value =
        target.type === 'checkbox'
          ? (target.checked as ProfileFormData[typeof field])
          : (target.value as ProfileFormData[typeof field]);
      updateField(field, value);
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateProfile(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaveStatus('saving');
    await new Promise((resolve) => setTimeout(resolve, 900));
    setInitialProfile(form);
    setSaveStatus('saved');

    window.setTimeout(() => {
      setSaveStatus('idle');
    }, 2200);
  }

  function handleCancel() {
    setForm(initialProfile);
    setErrors({});
    setSaveStatus('idle');
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Meu perfil</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Atualize seus dados para manter notificações e monitoramento funcionando corretamente.
          </p>
        </div>

        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
              <UserRound size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Dados da conta</p>
              <p className="text-xs text-slate-500">Esses dados aparecem nas telas internas do sistema.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="pt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                id="fullName"
                label="Nome completo"
                value={form.fullName}
                onChange={handleInputChange('fullName')}
                error={errors.fullName}
                autoComplete="name"
                placeholder="Nome e sobrenome"
              />

              <InputField
                id="email"
                label="E-mail profissional"
                type="email"
                value={form.email}
                onChange={handleInputChange('email')}
                error={errors.email}
                autoComplete="email"
                placeholder="voce@escritorio.com.br"
              />

              <InputField
                id="whatsapp"
                label="WhatsApp"
                type="tel"
                value={form.whatsapp}
                onChange={handleInputChange('whatsapp')}
                error={errors.whatsapp}
                autoComplete="tel"
                placeholder="(11) 99999-9999"
              />

              <InputField
                id="oab"
                label="OAB principal"
                value={form.oab}
                onChange={handleInputChange('oab')}
                error={errors.oab}
                placeholder="SP 123456"
              />

              <InputField
                id="officeName"
                label="Nome do escritório"
                value={form.officeName}
                onChange={handleInputChange('officeName')}
                placeholder="Seu escritório (opcional)"
              />

              <div className="flex flex-col gap-1.5">
                <label htmlFor="primaryArea" className="text-sm font-medium text-slate-700">
                  Área principal de atuação
                </label>
                <select
                  id="primaryArea"
                  value={form.primaryArea}
                  onChange={handleInputChange('primaryArea')}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-all hover:border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                >
                  <option>Direito do Consumidor</option>
                  <option>Direito de Família</option>
                  <option>Direito do Trabalho (TRT)</option>
                  <option>Direito Civil</option>
                  <option>Tributário/Execuções</option>
                  <option>Direito Empresarial</option>
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.dailyBriefing}
                  onChange={handleInputChange('dailyBriefing')}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-blue-600"
                />
                <span className="text-sm text-slate-700">
                  Receber briefing diário no WhatsApp às 08:00.
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.criticalAlerts}
                  onChange={handleInputChange('criticalAlerts')}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-blue-600"
                />
                <span className="text-sm text-slate-700">
                  Receber alertas críticos imediatos no WhatsApp.
                </span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
              <div className="min-h-5">
                {saveStatus === 'saved' && (
                  <p className="inline-flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                    <CheckCircle2 size={16} />
                    Perfil atualizado com sucesso.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={!isDirty || saveStatus === 'saving'}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar alterações
                </button>
                <button
                  type="submit"
                  disabled={!isDirty || saveStatus === 'saving'}
                  className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" aria-hidden="true" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      Salvar alterações
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </section>
      </div>
    </AppLayout>
  );
}
