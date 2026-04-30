import { useCallback, useEffect, useState } from 'react';
import { processService, type ProcessItem, type ProcessMovement } from '../services/processService';

export type ProcessesLoadState = 'loading' | 'ready' | 'error';

interface UseProcessesDataResult {
  processes: ProcessItem[];
  movementsByProcess: Record<string, ProcessMovement[]>;
  checklistByProcess: Record<string, string[]>;
  loadState: ProcessesLoadState;
  reload: () => void;
}

export function useProcessesData(): UseProcessesDataResult {
  const [processes, setProcesses] = useState<ProcessItem[]>([]);
  const [movementsByProcess, setMovementsByProcess] = useState<Record<string, ProcessMovement[]>>({});
  const [checklistByProcess, setChecklistByProcess] = useState<Record<string, string[]>>({});
  const [loadState, setLoadState] = useState<ProcessesLoadState>('loading');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoadState('loading');

      try {
        const [loadedProcesses, loadedMovements, loadedChecklist] = await Promise.all([
          processService.listProcesses(),
          processService.listMovementsMap(),
          processService.listChecklistMap(),
        ]);

        if (cancelled) return;

        setProcesses(loadedProcesses);
        setMovementsByProcess(loadedMovements);
        setChecklistByProcess(loadedChecklist);
        setLoadState('ready');
      } catch (error) {
        if (cancelled) return;
        console.error('Não foi possível carregar dados dos processos.', error);
        setLoadState('error');
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = useCallback(() => {
    setReloadKey((prev) => prev + 1);
  }, []);

  return {
    processes,
    movementsByProcess,
    checklistByProcess,
    loadState,
    reload,
  };
}
