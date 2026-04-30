import { useMemo, useState, type FormEvent } from 'react';
import { AlertTriangle, CheckCircle2, KeyRound, Laptop, LogOut, ShieldCheck, Smartphone, Trash2 } from 'lucide-react';
import { AppLayout } from '../layouts/AppLayout';
import { PasswordInput } from '../ui/PasswordInput';

type SaveStatus = 'idle' | 'saving' | 'saved';
type DangerStatus = 'idle' | 'submitting' | 'requested';

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordFormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface SessionItem {
  id: string;
  device: string;
  location: string;
  lastActivity: string;
  current: boolean;
}

const INITIAL_PASSWORD_FORM: PasswordFormData = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const INITIAL_SESSIONS: SessionItem[] = [
  { id: 's1', device: 'Chrome · Windows', location: 'São Paulo, BR', lastActivity: 'Agora mesmo', current: true },
  { id: 's2', device: 'Safari · iPhone', location: 'São Paulo, BR', lastActivity: 'há 2 horas', current: false },
];

function validatePasswordForm(data: PasswordFormData): PasswordFormErrors {
  const errors: PasswordFormErrors = {};

  if (!data.currentPassword) {
    errors.currentPassword = 'Informe sua senha atual.';
  }

  if (data.newPassword.length < 8) {
    errors.newPassword = 'A nova senha precisa ter no mínimo 8 caracteres.';
  } else if (!/[A-Z]/.test(data.newPassword)) {
    errors.newPassword = 'Inclua ao menos 1 letra maiúscula.';
  } else if (!/[0-9]/.test(data.newPassword)) {
    errors.newPassword = 'Inclua ao menos 1 número.';
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = 'Confirme sua nova senha.';
  } else if (data.newPassword !== data.confirmPassword) {
    errors.confirmPassword = 'As senhas não coincidem.';
  }

  return errors;
}

export function SecurityPage() {
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>(INITIAL_PASSWORD_FORM);
  const [passwordErrors, setPasswordErrors] = useState<PasswordFormErrors>({});
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginAlertsEnabled, setLoginAlertsEnabled] = useState(true);
  const [sessions, setSessions] = useState<SessionItem[]>(INITIAL_SESSIONS);
  const [dangerPhrase, setDangerPhrase] = useState('');
  const [dangerPassword, setDangerPassword] = useState('');
  const [dangerStatus, setDangerStatus] = useState<DangerStatus>('idle');

  const hasOtherSessions = useMemo(
    () => sessions.some((session) => !session.current),
    [sessions],
  );
  const canRequestClosure =
    dangerPhrase.trim().toUpperCase() === 'ENCERRAR' &&
    dangerPassword.length >= 6 &&
    dangerStatus !== 'submitting';

  function updatePasswordField<K extends keyof PasswordFormData>(field: K, value: PasswordFormData[K]) {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    setPasswordErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validatePasswordForm(passwordForm);

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setSaveStatus('saving');
    await new Promise((resolve) => setTimeout(resolve, 900));
    setSaveStatus('saved');
    setPasswordForm(INITIAL_PASSWORD_FORM);

    window.setTimeout(() => {
      setSaveStatus('idle');
    }, 2200);
  }

  function handleCloseOtherSessions() {
    setSessions((prev) => prev.filter((session) => session.current));
  }

  async function handleAccountClosureRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canRequestClosure) return;

    setDangerStatus('submitting');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setDangerStatus('requested');
    setDangerPhrase('');
    setDangerPassword('');
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Segurança</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Proteja seu acesso com boas práticas de senha, verificação e controle de sessões.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-5">
              <KeyRound size={17} className="text-blue-600" />
              <h2 className="text-sm font-semibold text-slate-900">Alterar senha</h2>
            </div>

            <form onSubmit={handlePasswordSubmit} noValidate className="space-y-4">
              <PasswordInput
                id="currentPassword"
                label="Senha atual"
                autoComplete="current-password"
                value={passwordForm.currentPassword}
                onChange={(event) => updatePasswordField('currentPassword', event.target.value)}
                error={passwordErrors.currentPassword}
                placeholder="Digite sua senha atual"
              />
              <PasswordInput
                id="newPassword"
                label="Nova senha"
                autoComplete="new-password"
                value={passwordForm.newPassword}
                onChange={(event) => updatePasswordField('newPassword', event.target.value)}
                error={passwordErrors.newPassword}
                placeholder="Mínimo 8 caracteres, 1 maiúscula e 1 número"
              />
              <PasswordInput
                id="confirmPassword"
                label="Confirmar nova senha"
                autoComplete="new-password"
                value={passwordForm.confirmPassword}
                onChange={(event) => updatePasswordField('confirmPassword', event.target.value)}
                error={passwordErrors.confirmPassword}
                placeholder="Repita a nova senha"
              />

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                <div className="min-h-5">
                  {saveStatus === 'saved' && (
                    <p className="inline-flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                      <CheckCircle2 size={16} />
                      Senha atualizada com sucesso.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={saveStatus === 'saving'}
                  className="btn-primary inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" aria-hidden="true" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar nova senha'
                  )}
                </button>
              </div>
            </form>
          </section>

          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={16} className="text-slate-600" />
              <h2 className="text-sm font-semibold text-slate-900">Proteções da conta</h2>
            </div>

            <div className="space-y-4 text-sm text-slate-700">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={twoFactorEnabled}
                  onChange={(event) => setTwoFactorEnabled(event.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-blue-600"
                />
                <span>Ativar verificação em duas etapas (2FA).</span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={loginAlertsEnabled}
                  onChange={(event) => setLoginAlertsEnabled(event.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-blue-600"
                />
                <span>Receber alerta por e-mail ao detectar novo login.</span>
              </label>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Quando o backend estiver conectado, esta seção aplicará as políticas em tempo real.
            </p>
          </section>
        </div>

        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Sessões ativas</h2>
            <button
              type="button"
              onClick={handleCloseOtherSessions}
              disabled={!hasOtherSessions}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 disabled:text-slate-300 disabled:cursor-not-allowed"
            >
              <LogOut size={13} />
              Encerrar outras sessões
            </button>
          </div>

          <div className="space-y-2.5">
            {sessions.map((session) => (
              <div key={session.id} className="rounded-xl border border-slate-100 px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                    {session.device.toLowerCase().includes('iphone') ? <Smartphone size={15} /> : <Laptop size={15} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{session.device}</p>
                    <p className="text-xs text-slate-500">{session.location} • {session.lastActivity}</p>
                  </div>
                </div>

                {session.current ? (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
                    Sessão atual
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-slate-500">Ativa</span>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-red-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-start gap-2 mb-4">
            <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-semibold text-red-700">Zona de perigo</h2>
              <p className="text-xs text-slate-600 mt-1">
                O encerramento da conta é permanente. Dados operacionais podem ser mantidos apenas pelo prazo legal aplicável.
              </p>
            </div>
          </div>

          {dangerStatus === 'requested' ? (
            <p className="inline-flex items-center gap-1.5 text-sm text-emerald-700 font-medium">
              <CheckCircle2 size={16} />
              Solicitação de encerramento registrada. Nosso time enviará a confirmação final por e-mail.
            </p>
          ) : (
            <form onSubmit={handleAccountClosureRequest} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="closureConfirmText" className="text-sm font-medium text-slate-700">
                  Digite <strong>ENCERRAR</strong> para confirmar
                </label>
                <input
                  id="closureConfirmText"
                  type="text"
                  value={dangerPhrase}
                  onChange={(event) => setDangerPhrase(event.target.value)}
                  placeholder="ENCERRAR"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <PasswordInput
                id="closurePassword"
                label="Sua senha atual"
                autoComplete="current-password"
                value={dangerPassword}
                onChange={(event) => setDangerPassword(event.target.value)}
                placeholder="Digite sua senha para confirmar"
              />

              <button
                type="submit"
                disabled={!canRequestClosure}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {dangerStatus === 'submitting' ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" aria-hidden="true" />
                    Enviando solicitação...
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    Encerrar conta permanentemente
                  </>
                )}
              </button>
            </form>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
