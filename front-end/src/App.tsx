/**
 * App.tsx — Roteador Principal
 *
 * Componente root que encapsula BrowserRouter e AppRoutes.
 * Toda a lógica de roteamento foi centralizada em routes/index.tsx.
 *
 * Antes: 160+ linhas
 * Depois: ~10 linhas ✅
 */

import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
