import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock3, ListChecks, Sparkles, TimerReset } from 'lucide-react';
import { AppLayout } from '../layouts/AppLayout';
import { taskService, type DayTask, type TaskPriority } from '../services/taskService';

type TaskFilter = 'todas' | 'pendentes' | 'concluidas';
type TaskSort = 'prioridade' | 'prazo' | 'nome';

const STORAGE_TASKS_KEY = 'lex-daily-tasks-items';
const STORAGE_FILTER_KEY = 'lex-daily-tasks-filter';
const STORAGE_SORT_KEY = 'lex-daily-tasks-sort';

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  critica: 0,
  alta: 1,
  normal: 2,
};


function getStoredFilter(): TaskFilter {
  if (typeof window === 'undefined') return 'todas';
  const raw = window.localStorage.getItem(STORAGE_FILTER_KEY);
  return raw === 'todas' || raw === 'pendentes' || raw === 'concluidas' ? raw : 'todas';
}

function getStoredSort(): TaskSort {
  if (typeof window === 'undefined') return 'prioridade';
  const raw = window.localStorage.getItem(STORAGE_SORT_KEY);
  return raw === 'prioridade' || raw === 'prazo' || raw === 'nome' ? raw : 'prioridade';
}

function isTaskSnoozed(task: DayTask, nowMs: number): boolean {
  return typeof task.snoozedUntil === 'number' && task.snoozedUntil > nowMs;
}

function priorityBadge(priority: TaskPriority): string {
  if (priority === 'critica') return 'Critica';
  if (priority === 'alta') return 'Alta';
  return 'Normal';
}

function formatSnoozeTime(value: number): string {
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

export function DailyTasksPage() {
  const [tasks, setTasks] = useState<DayTask[]>([]);
  const [tasksLoadState, setTasksLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [reloadKey, setReloadKey] = useState(0);
  const [filter, setFilter] = useState<TaskFilter>(() => getStoredFilter());
  const [sortBy, setSortBy] = useState<TaskSort>(() => getStoredSort());
  const [quickTask, setQuickTask] = useState('');
  const [feedback, setFeedback] = useState<string>('');
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    let cancelled = false;

    const loadTasks = async () => {
      setTasksLoadState('loading');
      try {
        const defaultTasks = await taskService.listDailyTasks();
        if (cancelled) return;

        const storedRaw = typeof window === 'undefined' ? null : window.localStorage.getItem(STORAGE_TASKS_KEY);
        const hydratedTasks = taskService.parseStoredTasks(storedRaw, defaultTasks);

        setTasks(hydratedTasks);
        setTasksLoadState('ready');
      } catch (error) {
        if (cancelled) return;
        console.error('Nao foi possivel carregar tarefas do dia via service.', error);
        setTasksLoadState('error');
      }
    };

    loadTasks();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  useEffect(() => {
    if (tasksLoadState !== 'ready') return;
    window.localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(tasks));
  }, [tasks, tasksLoadState]);

  useEffect(() => {
    if (tasksLoadState === 'error') {
      setTasks([]);
    }
  }, [tasksLoadState]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_FILTER_KEY, filter);
  }, [filter]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_SORT_KEY, sortBy);
  }, [sortBy]);

  useEffect(() => {
    const intervalId = window.setInterval(() => setNowMs(Date.now()), 30000);
    return () => window.clearInterval(intervalId);
  }, []);

  const criticalTask = useMemo(() => {
    return tasks
      .filter((task) => task.status === 'pending' && !isTaskSnoozed(task, nowMs))
      .sort((a, b) => {
        const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        if (a.dueAt === null && b.dueAt === null) return 0;
        if (a.dueAt === null) return 1;
        if (b.dueAt === null) return -1;
        return a.dueAt - b.dueAt;
      })[0] ?? null;
  }, [nowMs, tasks]);

  const visibleTasks = useMemo(() => {
    const filtered = tasks.filter((task) => {
      if (filter === 'pendentes') return task.status === 'pending';
      if (filter === 'concluidas') return task.status === 'done';
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'nome') return a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' });

      if (sortBy === 'prazo') {
        if (a.dueAt === null && b.dueAt === null) return 0;
        if (a.dueAt === null) return 1;
        if (b.dueAt === null) return -1;
        return a.dueAt - b.dueAt;
      }

      if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
      const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      if (a.dueAt === null && b.dueAt === null) return 0;
      if (a.dueAt === null) return 1;
      if (b.dueAt === null) return -1;
      return a.dueAt - b.dueAt;
    });
  }, [filter, sortBy, tasks]);

  const remainingTasks = useMemo(() => {
    if (!criticalTask) return visibleTasks;
    return visibleTasks.filter((task) => task.id !== criticalTask.id);
  }, [criticalTask, visibleTasks]);

  const totalCount = tasks.length;
  const doneCount = tasks.filter((task) => task.status === 'done').length;
  const recoveredMinutes = tasks.filter((task) => task.status === 'done').reduce((sum, task) => sum + task.focusMinutes, 0);
  const focusGoal = 60;
  const progressPercent = Math.min(100, Math.round((recoveredMinutes / focusGoal) * 100));

  function showFeedback(message: string) {
    setFeedback(message);
    window.setTimeout(() => setFeedback(''), 2200);
  }

  function completeTask(taskId: string) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, status: 'done', snoozedUntil: undefined, dueText: task.type === 'prazo' ? task.dueText : 'Concluido' }
          : task,
      ),
    );
    showFeedback('Tarefa concluida com sucesso.');
  }

  function reopenTask(taskId: string) {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status: 'pending' } : task)));
    showFeedback('Tarefa reaberta.');
  }

  function postponeTask(taskId: string, hours = 1) {
    const snoozeUntil = Date.now() + hours * 60 * 60 * 1000;
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, snoozedUntil: snoozeUntil } : task)));
    showFeedback(`Tarefa adiada por ${hours}h.`);
  }

  function addQuickTask() {
    const title = quickTask.trim();
    if (title.length < 4) {
      showFeedback('Descreva a tarefa com pelo menos 4 caracteres.');
      return;
    }

    const newTask: DayTask = {
      id: `task-${Date.now()}`,
      title,
      context: 'Tarefa rapida adicionada manualmente',
      dueText: 'Hoje',
      dueAt: null,
      type: 'rotina',
      priority: 'normal',
      status: 'pending',
      focusMinutes: 6,
    };

    setTasks((prev) => [newTask, ...prev]);
    setQuickTask('');
    setFilter('todas');
    showFeedback('Tarefa adicionada ao planejamento de hoje.');
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-5">
        {tasksLoadState === 'loading' && (
          <>
            <section className="rounded-2xl border border-slate-100 bg-white shadow-sm p-5 sm:p-6 animate-pulse" aria-busy="true">
              <div className="h-6 w-52 rounded bg-slate-100" />
              <div className="h-4 w-80 rounded bg-slate-100 mt-2" />
              <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5">
                    <div className="h-3 w-20 rounded bg-slate-100" />
                    <div className="h-5 w-12 rounded bg-slate-100 mt-2" />
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded-2xl border border-slate-100 bg-white shadow-sm p-5 sm:p-6 animate-pulse">
              <div className="h-5 w-44 rounded bg-slate-100" />
              <div className="h-4 w-2/3 rounded bg-slate-100 mt-3" />
              <div className="h-10 w-44 rounded-xl bg-slate-100 mt-4" />
            </section>
          </>
        )}

        {tasksLoadState === 'error' && (
          <section className="rounded-2xl border border-amber-200 bg-white shadow-sm p-5 sm:p-6">
            <p className="text-sm font-semibold text-amber-800">Nao foi possivel carregar as tarefas do dia agora.</p>
            <p className="text-sm text-slate-600 mt-1">Tente novamente para atualizar seu planejamento.</p>
            <button
              type="button"
              onClick={() => setReloadKey((prev) => prev + 1)}
              className="mt-4 btn-primary px-4 py-2 text-sm font-semibold"
            >
              Tentar novamente
            </button>
          </section>
        )}

        {tasksLoadState === 'ready' && (
          <>
        <section className="rounded-2xl border border-slate-100 bg-white shadow-sm p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Planejamento de hoje</h1>
              <p className="text-sm text-slate-500 mt-1">Otimizando sua rotina para ganhar tempo com foco no que vence primeiro.</p>
            </div>
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-3 py-1.5">
              <CalendarDays size={14} />
              {new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(new Date())}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">Total do dia</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{totalCount}</p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">Concluidas</p>
              <p className="text-lg font-bold text-emerald-700 mt-0.5">{doneCount}</p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">Pendentes</p>
              <p className="text-lg font-bold text-amber-700 mt-0.5">{totalCount - doneCount}</p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">Foco recuperado</p>
              <p className="text-lg font-bold text-blue-700 mt-0.5">{recoveredMinutes} min</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-blue-200 bg-blue-50 shadow-sm p-5 sm:p-6">
          <p className="text-xs font-extrabold uppercase tracking-wide text-blue-700">Proxima tarefa critica</p>
          {criticalTask ? (
            <>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">{criticalTask.title}</h2>
              <p className="text-sm text-slate-700 mt-1">
                {criticalTask.context} · {criticalTask.dueText}. IA recomenda iniciar agora para reduzir risco de atraso.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => completeTask(criticalTask.id)}
                  className="btn-primary inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold"
                >
                  <CheckCircle2 size={15} />
                  Concluir
                </button>
                <button
                  type="button"
                  onClick={() => postponeTask(criticalTask.id, 1)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 size={15} />
                    Adiar 1h
                  </span>
                </button>
              </div>
            </>
          ) : (
            <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800">
                <CheckCircle2 size={15} />
                Nenhuma tarefa critica pendente no momento.
              </p>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white shadow-sm p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <h2 className="text-base font-bold text-slate-900">Restante do dia</h2>

            <div className="flex flex-wrap items-center gap-2">
              {(['todas', 'pendentes', 'concluidas'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFilter(option)}
                  className={[
                    'px-3 py-2 rounded-xl text-xs font-semibold border',
                    filter === option
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
                  ].join(' ')}
                >
                  {option === 'todas' ? 'Todas' : option === 'pendentes' ? 'Pendentes' : 'Concluidas'}
                </button>
              ))}

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as TaskSort)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              >
                <option value="prioridade">Ordenar por prioridade</option>
                <option value="prazo">Ordenar por prazo</option>
                <option value="nome">Ordenar por nome</option>
              </select>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={quickTask}
                onChange={(event) => setQuickTask(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addQuickTask();
                  }
                }}
                placeholder="Adicionar tarefa rapida para hoje..."
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
              <button
                type="button"
                onClick={addQuickTask}
                className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
              >
                Adicionar
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-2.5">
            {remainingTasks.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
                <p className="text-sm font-semibold text-slate-800">Nenhuma tarefa nesta visualizacao.</p>
                <p className="text-xs text-slate-500 mt-1">Altere o filtro ou adicione uma nova tarefa para continuar.</p>
              </div>
            ) : (
              remainingTasks.map((task) => {
                const snoozed = isTaskSnoozed(task, nowMs);
                const done = task.status === 'done';
                return (
                  <article
                    key={task.id}
                    className={[
                      'rounded-xl border px-4 py-3',
                      done ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200',
                    ].join(' ')}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                      <label className="inline-flex items-start gap-3 flex-1 cursor-pointer min-w-0">
                        <input
                          type="checkbox"
                          checked={done}
                          onChange={() => (done ? reopenTask(task.id) : completeTask(task.id))}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-blue-600"
                        />
                        <span className="min-w-0">
                          <span className={`block text-sm font-semibold ${done ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                            {task.title}
                          </span>
                          <span className="block text-xs text-slate-500 mt-0.5">{task.context}</span>
                          {snoozed && (
                            <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                              <TimerReset size={12} />
                              Adiada ate {formatSnoozeTime(task.snoozedUntil as number)}
                            </span>
                          )}
                        </span>
                      </label>

                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={[
                            'text-[11px] font-semibold border rounded-full px-2 py-0.5',
                            task.type === 'prazo'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200',
                          ].join(' ')}
                        >
                          {task.type === 'prazo' ? task.dueText : 'Rotina'}
                        </span>
                        <span
                          className={[
                            'text-[11px] font-semibold border rounded-full px-2 py-0.5',
                            task.priority === 'critica'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : task.priority === 'alta'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200',
                          ].join(' ')}
                        >
                          {priorityBadge(task.priority)}
                        </span>
                        {!done && (
                          <button
                            type="button"
                            onClick={() => postponeTask(task.id, 1)}
                            className="text-xs font-semibold text-slate-600 hover:text-slate-800"
                          >
                            Adiar 1h
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 inline-flex items-center gap-2">
                <Sparkles size={16} className="text-blue-600" />
                Produtividade de hoje
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Voce ja recuperou {recoveredMinutes} minutos de foco eliminando tarefas manuais.
              </p>
            </div>

            <div className="w-full max-w-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1.5">
                <span className="inline-flex items-center gap-1">
                  <ListChecks size={13} />
                  Meta diaria
                </span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
                <span
                  className="block h-full rounded-full bg-blue-600 transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {feedback && (
          <p className="text-sm font-medium text-blue-700 inline-flex items-center gap-1.5">
            <CheckCircle2 size={15} />
            {feedback}
          </p>
        )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
