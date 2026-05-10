import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface PrivateRouteProps {
  children: ReactNode;
  requireSetup?: boolean;
}

export function PrivateRoute({ children, requireSetup = true }: PrivateRouteProps) {
  const { isAuthenticated, isSetupCompleted, user } = useAuth();
  const location = useLocation();
  const isAdmin = Boolean(user?.isAdmin);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  if (requireSetup && !isAdmin && !isSetupCompleted) {
    return <Navigate to="/configuracao" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  return <>{children}</>;
}
