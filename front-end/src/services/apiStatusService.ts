/**
 * apiStatusService.ts — Mock de SSE/WebSocket para o status da API do Escavador.
 *
 * Simula um stream de eventos Server-Sent Events (SSE) que altera o apiStatus
 * no Header do AppLayout. Quando o back-end estiver pronto, substitua
 * connectMockStream por uma conexão real com EventSource ou WebSocket.
 *
 * Uso:
 *   const { status, connect, disconnect } = useApiStatus();
 *
 * O hook useApiStatus (abaixo) é a interface pública para os componentes.
 */

export type ApiStatus = 'connected' | 'disconnected' | 'checking';

type StatusListener = (status: ApiStatus) => void;

interface StreamHandle {
  disconnect: () => void;
}

/**
 * connectMockStream — simula ciclos de conexão/desconexão da API do Escavador.
 *
 * Sequência padrão:
 *   0s  → checking
 *   1s  → connected
 *   30s → checking  (simula re-verificação periódica)
 *   31s → connected ou disconnected (10% de chance de falha)
 *
 * TODO: substituir por EventSource real:
 *   const es = new EventSource(`${import.meta.env.VITE_API_URL}/status/stream`);
 *   es.addEventListener('status', (e) => listener(e.data as ApiStatus));
 */
export function connectMockStream(listener: StatusListener): StreamHandle {
  const timers: ReturnType<typeof setTimeout>[] = [];

  function schedule(status: ApiStatus, delayMs: number) {
    timers.push(setTimeout(() => listener(status), delayMs));
  }

  // Ciclo inicial
  schedule('checking', 0);
  schedule('connected', 1_000);

  // Re-verificação periódica a cada 30s
  const interval = setInterval(() => {
    listener('checking');
    timers.push(
      setTimeout(() => {
        const disconnected = Math.random() < 0.1; // 10% de chance de falha
        listener(disconnected ? 'disconnected' : 'connected');
      }, 1_200),
    );
  }, 30_000);

  return {
    disconnect: () => {
      timers.forEach(clearTimeout);
      clearInterval(interval);
      listener('disconnected');
    },
  };
}
