import { useEffect, useRef, useState } from 'react';
import { Bell, MessageCircle, X } from 'lucide-react';
import type { DayTask, TaskPriority } from '../services/taskService';

interface Props {
  onClose: () => void;
  onAdd: (task: DayTask) => void;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function buildDueText(date: string, time: string): string {
  const [year, month, day] = date.split('-');
  const base = `${day}/${month}/${year}`;
  return time ? `${base} às ${time}` : base;
}

function buildDueAt(date: string, time: string): number | null {
  if (!date) return null;
  const iso = time ? `${date}T${time}:00` : `${date}T23:59:59`;
  const ms = new Date(iso).getTime();
  return isNaN(ms) ? null : ms;
}

/**
 * Schedules a browser Notification for the task at the chosen date+time.
 * Falls back silently if the browser blocks permission.
 */
function scheduleSystemNotification(title: string, fireAt: number): void {
  const delay = fireAt - Date.now();
  if (delay <= 0) return;

  const request = () => {
    window.setTimeout(() => {
      try {
        // eslint-disable-next-line no-new
        new Notification(`⚖️ Lex: ${title}`, {
          body: 'Lembrete de tarefa agendada.',
          icon: '/favicon.ico',
        });
      } catch (_) { /* silent */ }
    }, delay);
  };

  if (Notification.permission === 'granted') {
    request();
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') request();
    });
  }
}

/**
 * Opens WhatsApp with a pre-filled reminder message.
 * Uses the lawyer's own number from localStorage if available.
 */
function openWhatsAppReminder(title: string, dueText: string): void {
  const phone = window.localStorage.getItem('lex-whatsapp-phone') ?? '';
  const message = encodeURIComponent(`⚖️ *Lembrete Lex*\n📋 ${title}\n🗓️ ${dueText}`);
  const url = phone
    ? `https://wa.me/${phone}?text=${message}`
    : `https://wa.me/?text=${message}`;
  window.open(url, '_blank', 'noopener');
}

export function AddTaskModal({ onClose, onAdd }: Props) {
  const titleRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayIso());
  const [time, setTime] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('normal');
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(false);
  const [notifySystem, setNotifySystem] = useState(false);
  const [error, setError] = useState('');

  // Auto-focus title on mount
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (trimmed.length < 4) {
      setError('Descreva a tarefa com pelo menos 4 caracteres.');
      titleRef.current?.focus();
      return;
    }

    const dueAt = buildDueAt(date, time);
    const dueText = date ? buildDueText(date, time) : 'Sem prazo definido';

    const newTask: DayTask = {
      id: `task-${Date.now()}`,
      title: trimmed,
      context: 'Tarefa adicionada manualmente',
      dueText,
      dueAt,
      type: 'rotina',
      priority,
      status: 'pending',
      focusMinutes: 6,
      scheduledDate: date || undefined,
      scheduledTime: time || undefined,
      notifyWhatsApp,
      notifySystem,
    };

    // Schedule notifications only when date+time are both set
    if (date && time && dueAt) {
      if (notifySystem) scheduleSystemNotification(trimmed, dueAt);
      if (notifyWhatsApp) openWhatsAppReminder(trimmed, dueText);
    }

    onAdd(newTask);
    onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
          <h2 id="modal-title" className="text-base font-bold text-slate-900">Nova Tarefa</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Fechar modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="px-5 py-4 space-y-4">

            {/* Title */}
            <div>
              <label htmlFor="task-title" className="block text-xs font-semibold text-slate-700 mb-1">
                Título <span className="text-rose-500">*</span>
              </label>
              <input
                ref={titleRef}
                id="task-title"
                type="text"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setError(''); }}
                placeholder="Ex: Protocolar petição intermediária"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
              {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
            </div>

            {/* Date + Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="task-date" className="block text-xs font-semibold text-slate-700 mb-1">Data</label>
                <input
                  id="task-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
              <div>
                <label htmlFor="task-time" className="block text-xs font-semibold text-slate-700 mb-1">
                  Hora <span className="text-slate-400 font-normal">(opcional)</span>
                </label>
                <input
                  id="task-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="task-priority" className="block text-xs font-semibold text-slate-700 mb-1">Prioridade</label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              >
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </div>

            {/* Notifications — only active when time is set */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 space-y-2">
              <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <Bell size={13} />
                Notificar via
                {!time && <span className="text-slate-400 font-normal ml-1">(defina a hora para ativar)</span>}
              </p>
              <label className={`flex items-center gap-2.5 cursor-pointer ${!time ? 'opacity-40' : ''}`}>
                <input
                  type="checkbox"
                  checked={notifySystem}
                  disabled={!time}
                  onChange={(e) => setNotifySystem(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                />
                <span className="text-sm text-slate-700 font-medium">Sistema (notificação no painel)</span>
              </label>
              <label className={`flex items-center gap-2.5 cursor-pointer ${!time ? 'opacity-40' : ''}`}>
                <input
                  type="checkbox"
                  checked={notifyWhatsApp}
                  disabled={!time}
                  onChange={(e) => setNotifyWhatsApp(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-emerald-600"
                />
                <span className="inline-flex items-center gap-1.5 text-sm text-slate-700 font-medium">
                  <MessageCircle size={14} className="text-emerald-600" />
                  WhatsApp
                </span>
              </label>
            </div>

          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-5 pb-5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary rounded-lg px-5 py-2 text-sm font-semibold"
            >
              Salvar tarefa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
