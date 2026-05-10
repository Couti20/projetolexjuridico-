import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface PrivateRouteProps {
  children: ReactNode;
  requireSetup?: boolean;
}

export function PrivateRoute({ children, requireSetup = true }: PrivateRouteProps) {
  const { isAuthenticated, isSetupCompleted } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  if (requireSetup && !isSetupCompleted) {
    return <Navigate to="/configuracao" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  return <>{children}</>;
}
