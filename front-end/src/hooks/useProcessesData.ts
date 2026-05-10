import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  const dataQuery = useQuery({
    queryKey: ['processes', 'dataset'],
    queryFn: async () => {
      const [processes, movementsByProcess, checklistByProcess] = await Promise.all([
        processService.listProcesses(),
        processService.listMovementsMap(),
        processService.listChecklistMap(),
      ]);

      return {
        processes,
        movementsByProcess,
        checklistByProcess,
      };
    },
  });

  const loadState: ProcessesLoadState = dataQuery.isPending ? 'loading' : dataQuery.isError ? 'error' : 'ready';

  const reload = useCallback(() => {
    void dataQuery.refetch();
  }, [dataQuery.refetch]);

  return {
    processes: dataQuery.data?.processes ?? [],
    movementsByProcess: dataQuery.data?.movementsByProcess ?? {},
    checklistByProcess: dataQuery.data?.checklistByProcess ?? {},
    loadState,
    reload,
  };
}
