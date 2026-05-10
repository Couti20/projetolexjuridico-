/**
 * useApiStatus — hook que conecta ao stream de status da API do Escavador
 * e expõe o estado atual para o Header do AppLayout.
 *
 * Conecta automaticamente ao montar e desconecta ao desmontar.
 * Compatível com React StrictMode (double-invoke do useEffect).
 */

import { useEffect, useState } from 'react';
import { connectMockStream, type ApiStatus } from '../services/apiStatusService';

export function useApiStatus(): ApiStatus {
  const [status, setStatus] = useState<ApiStatus>('checking');

  useEffect(() => {
    const handle = connectMockStream(setStatus);
    return () => handle.disconnect();
  }, []);

  return status;
}
