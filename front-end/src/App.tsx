/**
 * App.tsx — Entry point do roteamento.
 *
 * Migrado de <BrowserRouter> + <Routes> JSX soltos
 * para createBrowserRouter (React Router v6 data API).
 *
 * A configuração completa das rotas está em src/routes/router.tsx.
 * Aqui apenas montamos o RouterProvider.
 */

import { RouterProvider } from 'react-router-dom';
import { router } from './routes/router';

export default function App() {
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
}
