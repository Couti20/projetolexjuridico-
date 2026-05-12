import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function useAppNavigation() {
  const navigate = useNavigate();

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return {
    goHome: useCallback(() => {
      navigate('/');
      scrollToTop();
    }, [navigate, scrollToTop]),

    goSignUp: useCallback(() => {
      navigate('/cadastro');
      scrollToTop();
    }, [navigate, scrollToTop]),

    goLogin: useCallback(() => {
      navigate('/login');
      scrollToTop();
    }, [navigate, scrollToTop]),

    goSetup: useCallback(() => {
      navigate('/configuracao');
      scrollToTop();
    }, [navigate, scrollToTop]),

    goDashboard: useCallback(() => {
      navigate('/dashboard');
      scrollToTop();
    }, [navigate, scrollToTop]),
  };
}
