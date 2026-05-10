/**
 * App.tsx — Entry point do roteamento.
 *
 * Usamos `createBrowserRouter` em `src/routes/router.tsx` e montamos
 * o provedor de rotas aqui com `RouterProvider`.
 */

import { RouterProvider } from 'react-router-dom';
import { router } from './routes/router';

export default function App() {
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
}
