import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Copy,
  ExternalLink,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { AppLayout } from '../layouts/AppLayout';
import type { ProcessMovement } from '../services/processService';
import { useProcessesData } from '../hooks/useProcessesData';
import {
  PROCESS_MOVEMENT_NOTES_STORAGE_KEY,
  PROCESS_MOVEMENT_READ_STORAGE_KEY,
  getStoredBooleanMap,
  getStoredStringMap,
  isUrgentMovement,
} from './processes/processHelpers';

type TaskStatus = 'idle' | 'sending' | 'sent';

export function ProcessDetailPage() {
  const navigate = useNavigate();
  const { processId } = useParams();
  const { processes, movementsByProcess, checklistByProcess, loadState, reload } = useProcessesData();

  const [checkedChecklist, setCheckedChecklist] = useState<Record<string, boolean>>({});
  const [readMovements, setReadMovements] = useState<Record<string, boolean>>(() => getStoredBooleanMap(PROCESS_MOVEMENT_READ_STORAGE_KEY));
  const [movementNotes, setMovementNotes] = useState<Record<string, string>>(() => getStoredStringMap(PROCESS_MOVEMENT_NOTES_STORAGE_KEY));
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [activeNoteMovementId, setActiveNoteMovementId] = useState<string | null>(null);
  const [movementTaskStatus, setMovementTaskStatus] = useState<Record<string, TaskStatus>>({});
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('idle');

  useEffect(() => {
    window.localStorage.setItem(PROCESS_MOVEMENT_READ_STORAGE_KEY, JSON.stringify(readMovements));
  }, [readMovements]);

  useEffect(() => {
    window.localStorage.setItem(PROCESS_MOVEMENT_NOTES_STORAGE_KEY, JSON.stringify(movementNotes));
  }, [movementNotes]);

  const selectedProcess = useMemo(
    () => processes.find((process) => process.id === processId) ?? null,
    [processId, processes],
  );

  const movements = selectedProcess ? movementsByProcess[selectedProcess.id] ?? [] : [];
  const checklist = selectedProcess ? checklistByProcess[selectedProcess.id] ?? [] : [];

  const checklistTotal = checklist.length;
  const checklistDone = checklist.filter((item) => checkedChecklist[item]).length;

  async function handleCopyProcessNumber() {
    if (!selectedProcess) return;
    try {
      await navigator.clipboard.writeText(selectedProcess.number);
      setCopyStatus('copied');
      window.setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (error) {
      console.error('Não foi possível copiar o número do processo.', error);
      setCopyStatus('idle');
    }
  }

  async function handleCreateTask() {
    if (!selectedProcess) return;
    setTaskStatus('sending');
    const pendingItems = checklist.filter((item) => !checkedChecklist[item]);
    const checklistLines = (pendingItems.length > 0 ? pendingItems : checklist)
      .map((item, index) => `${index + 1}. ${item}`)
      .join('\n');

    const message = encodeURIComponent(
      `Processo ${selectedProcess.number}\n\nChecklist sugerido:\n${checklistLines}`,
    );
    window.open(`https://wa.me/?text=${message}`, '_blank', 'noopener,noreferrer');

    await new Promise((resolve) => setTimeout(resolve, 700));
    setTaskStatus('sent');
    window.setTimeout(() => setTaskStatus('idle'), 2200);
  }

  function toggleChecklist(item: string) {
    setCheckedChecklist((prev) => ({ ...prev, [item]: !prev[item] }));
  }

  async function handleCreateMovementTask(movement: ProcessMovement, movementStateKey: string) {
    if (!selectedProcess) return;

    setMovementTaskStatus((prev) => ({ ...prev, [movementStateKey]: 'sending' }));

    const message = encodeURIComponent(
      `Processo ${selectedProcess.number}\nMovimentação: ${movement.title}\nData: ${movement.datetime}\n\nPróxima ação:\n- Revisar movimentação\n- Definir prazo interno\n- Delegar responsável`,
    );
    window.open(`https://wa.me/?text=${message}`, '_blank', 'noopener,noreferrer');

    await new Promise((resolve) => setTimeout(resolve, 700));
    setMovementTaskStatus((prev) => ({ ...prev, [movementStateKey]: 'sent' }));
    window.setTimeout(() => {
      setMovementTaskStatus((prev) => ({ ...prev, [movementStateKey]: 'idle' }));
    }, 2200);
  }

  function toggleMovementRead(movementId: string) {
    setReadMovements((prev) => ({ ...prev, [movementId]: !prev[movementId] }));
  }

  function toggleMovementNoteEditor(movementId: string) {
    setActiveNoteMovementId((prev) => (prev === movementId ? null : movementId));
    setNoteDrafts((prev) => ({
      ...prev,
      [movementId]: prev[movementId] ?? movementNotes[movementId] ?? '',
    }));
  }

  function handleMovementNoteDraft(movementId: string, value: string) {
    setNoteDrafts((prev) => ({ ...prev, [movementId]: value }));
  }

  function handleSaveMovementNote(movementId: string) {
    const note = (noteDrafts[movementId] ?? '').trim();

    if (!note) {
      setMovementNotes((prev) => {
        const next = { ...prev };
        delete next[movementId];
        return next;
      });
      setActiveNoteMovementId(null);
      return;
    }

    setMovementNotes((prev) => ({ ...prev, [movementId]: note }));
    setActiveNoteMovementId(null);
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-5">
        {loadState === 'loading' && (
          <section className="space-y-4" aria-busy="true">
            <article className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6 animate-pulse">
              <div className="h-5 w-64 rounded bg-slate-100" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                <div className="space-y-2">
                  <div className="h-3 w-16 rounded bg-slate-100" />
                  <div className="h-4 w-48 rounded bg-slate-100" />
                  <div className="h-4 w-52 rounded bg-slate-100" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-24 rounded bg-slate-100" />
                  <div className="h-4 w-64 rounded bg-slate-100" />
                </div>
              </div>
            </article>
            <article className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 animate-pulse">
              <div className="h-4 w-48 rounded bg-slate-100" />
              <div className="h-3 w-11/12 rounded bg-slate-100 mt-3" />
              <div className="h-3 w-9/12 rounded bg-slate-100 mt-2" />
            </article>
          </section>
        )}

        {loadState === 'error' && (
          <section className="bg-white rounded-2xl border border-amber-200 shadow-sm p-5">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-amber-800">
              <CircleAlert size={16} />
              Falha ao sincronizar os dados deste processo.
            </p>
            <p className="text-sm text-slate-600 mt-2">
              Tente novamente em instantes. Enquanto isso, você pode voltar para a lista e priorizar outros casos.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={reload}
                className="btn-primary px-4 py-2 text-sm font-semibold"
              >
                Tentar novamente
              </button>
              <button
                type="button"
                onClick={() => navigate('/processos')}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
              >
                Voltar para lista
              </button>
            </div>
          </section>
        )}

        {loadState === 'ready' && !selectedProcess && (
          <section className="bg-white rounded-2xl border border-amber-200 shadow-sm p-5">
            <p className="inline-flex items-center gap-2 text-sm text-amber-800">
              <CircleAlert size={16} />
              Processo não encontrado para este identificador.
            </p>
            <button
              type="button"
              onClick={() => navigate('/processos')}
              className="mt-4 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-400"
            >
              Voltar para lista de processos
            </button>
          </section>
        )}

        {loadState === 'ready' && selectedProcess && (
          <>
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => navigate('/processos')}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                <ArrowLeft size={16} />
                Voltar para a lista
              </button>
              <button
                type="button"
                onClick={handleCopyProcessNumber}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-800"
              >
                <Copy size={14} />
                {copyStatus === 'copied' ? 'Número copiado' : 'Copiar número'}
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
              <div className="xl:col-span-8 space-y-4">
                <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
                  <h1 className="font-mono text-base sm:text-lg font-bold text-slate-900 break-all">
                    Processo: {selectedProcess.number} ({selectedProcess.court})
                  </h1>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Partes</p>
                      <p className="text-sm text-slate-800 font-semibold">Autor: {selectedProcess.claimant}</p>
                      <p className="text-sm text-slate-800 font-semibold">Réu: {selectedProcess.defendant}</p>
                    </div>

                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Vara / Comarca</p>
                      <p className="text-sm text-slate-700">{selectedProcess.district}</p>
                    </div>
                  </div>
                </section>

                <section className="space-y-3">
                  <h2 className="text-base font-bold text-slate-900">Histórico de movimentações</h2>
                  {movements.length === 0 ? (
                    <article className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                      <p className="text-sm font-semibold text-slate-800">Ainda não há movimentações para este processo.</p>
                      <p className="text-sm text-slate-500 mt-1">
                        Continue acompanhando: ao detectar novidade, a timeline será atualizada automaticamente.
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate('/processos')}
                        className="mt-4 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
                      >
                        Ver outros processos
                      </button>
                    </article>
                  ) : (
                    <div className="relative">
                      <span className="absolute left-1.5 top-0 bottom-0 w-px bg-slate-200" />
                      <div className="space-y-3">
                        {movements.map((movement, index) => {
                          const movementStateKey = `${selectedProcess.id}:${movement.id}`;
                          const isLatest = index === 0;
                          const isUrgent = isUrgentMovement(movement);
                          const isRead = Boolean(readMovements[movementStateKey]);
                          const note = movementNotes[movementStateKey];
                          const draftNote = noteDrafts[movementStateKey] ?? note ?? '';
                          const movementTask = movementTaskStatus[movementStateKey] ?? 'idle';
                          const dotClass = isLatest
                            ? 'bg-blue-600'
                            : isUrgent
                            ? 'bg-red-500'
                            : 'bg-slate-300';

                          return (
                            <article key={movement.id} className="relative pl-7">
                              <span className={`absolute left-0.5 top-5 h-3 w-3 rounded-full ring-4 ring-white ${dotClass}`} />
                              <div
                                className={[
                                  'rounded-2xl border shadow-sm p-4',
                                  isLatest
                                    ? 'bg-blue-50/60 border-blue-200'
                                    : isUrgent
                                    ? 'bg-red-50/40 border-red-200'
                                    : 'bg-white border-slate-100',
                                  isRead ? 'opacity-90' : '',
                                ].join(' ')}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className="font-mono text-xs font-semibold text-slate-500">{movement.datetime}</p>
                                      {isLatest && (
                                        <span className="text-[10px] font-bold uppercase tracking-wide text-blue-700 bg-blue-100 border border-blue-200 rounded-full px-2 py-0.5">
                                          Mais recente
                                        </span>
                                      )}
                                      {isUrgent && (
                                        <span className="text-[10px] font-bold uppercase tracking-wide text-red-700 bg-red-100 border border-red-200 rounded-full px-2 py-0.5">
                                          Urgente
                                        </span>
                                      )}
                                      {isRead && (
                                        <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-100 border border-emerald-200 rounded-full px-2 py-0.5">
                                          Lido
                                        </span>
                                      )}
                                    </div>
                                    <h3 className="text-sm font-semibold text-slate-900 mt-1">{movement.title}</h3>
                                    <p className="text-sm text-slate-600 mt-2">{movement.description}</p>
                                  </div>
                                  <a
                                    href={movement.sourceUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 whitespace-nowrap"
                                  >
                                    Ver original
                                    <ExternalLink size={12} />
                                  </a>
                                </div>

                                <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleCreateMovementTask(movement, movementStateKey)}
                                    disabled={movementTask === 'sending'}
                                    className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-60 disabled:cursor-not-allowed"
                                  >
                                    {movementTask === 'sending' ? 'Enviando...' : movementTask === 'sent' ? 'Tarefa criada' : 'Criar tarefa'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => toggleMovementRead(movementStateKey)}
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300"
                                  >
                                    {isRead ? 'Marcar como não lido' : 'Marcar como lido'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => toggleMovementNoteEditor(movementStateKey)}
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300"
                                  >
                                    {activeNoteMovementId === movementStateKey ? 'Fechar observação' : note ? 'Editar observação' : 'Anotar observação'}
                                  </button>
                                </div>

                                {note && activeNoteMovementId !== movementStateKey && (
                                  <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                                    <strong>Observação:</strong> {note}
                                  </p>
                                )}

                                {activeNoteMovementId === movementStateKey && (
                                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                                    <label htmlFor={`note-${movement.id}`} className="block text-xs font-semibold text-slate-700">
                                      Observação interna
                                    </label>
                                    <textarea
                                      id={`note-${movement.id}`}
                                      value={draftNote}
                                      onChange={(event) => handleMovementNoteDraft(movementStateKey, event.target.value)}
                                      rows={3}
                                      placeholder="Ex.: Confirmar quesitos com assistente técnico até amanhã."
                                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 resize-y"
                                    />
                                    <div className="mt-2 flex flex-wrap justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setActiveNoteMovementId(null)}
                                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-400"
                                      >
                                        Cancelar
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleSaveMovementNote(movementStateKey)}
                                        className="btn-primary px-3 py-1.5 text-xs font-semibold"
                                      >
                                        {draftNote.trim() ? 'Salvar observação' : 'Remover observação'}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </section>
              </div>

              <aside className="xl:col-span-4">
                <section className="bg-blue-50 rounded-2xl border border-blue-100 p-5 sticky top-4">
                  <h2 className="inline-flex items-center gap-2 text-base font-bold text-blue-900">
                    <Sparkles size={16} />
                    Análise Inteligente
                  </h2>

                  <div className="mt-4">
                    <p className="text-sm font-semibold text-blue-900">O que fazer agora?</p>
                    <p className="text-sm text-slate-700 mt-1">
                      O juiz abriu prazo para manifestação sobre o laudo pericial.
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <p className="text-sm font-semibold text-blue-900">Checklist sugerido</p>
                    {checklist.length === 0 ? (
                      <p className="text-sm text-slate-600 mt-3">
                        Ainda não há checklist sugerido para este processo.
                      </p>
                    ) : (
                      <div className="space-y-2 mt-3">
                        {checklist.map((item) => (
                          <label key={item} className="flex items-start gap-2.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(checkedChecklist[item])}
                              onChange={() => toggleChecklist(item)}
                              className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-blue-600"
                            />
                            <span className={`text-sm ${checkedChecklist[item] ? 'line-through text-slate-500' : 'text-slate-700'}`}>
                              {item}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-slate-500 mt-3">
                      Progresso: {checklistDone}/{checklistTotal} itens concluídos
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCreateTask}
                    disabled={taskStatus === 'sending' || checklist.length === 0}
                    className="mt-5 w-full btn-primary py-2.5 text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {taskStatus === 'sending' ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" aria-hidden="true" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <MessageCircle size={15} />
                        Criar tarefa no WhatsApp
                      </>
                    )}
                  </button>

                  {taskStatus === 'sent' && (
                    <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                      <CheckCircle2 size={14} />
                      Sugestão enviada para o WhatsApp.
                    </p>
                  )}
                </section>
              </aside>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
