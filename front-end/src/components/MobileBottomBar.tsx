import { memo } from 'react';

interface MobileBottomBarProps {
  onNavigateSignUp: () => void;
  onNavigateLogin: () => void;
}

function MobileBottomBarContent({ onNavigateSignUp, onNavigateLogin }: MobileBottomBarProps) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 md:hidden border-t border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2">
        <button
          type="button"
          onClick={onNavigateLogin}
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-700"
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={onNavigateSignUp}
          className="btn-primary flex-[1.2] px-4 py-2.5 text-sm font-semibold"
        >
          Teste grátis
        </button>
      </div>
    </div>
  );
}

export const MobileBottomBar = memo(MobileBottomBarContent);
export default MobileBottomBar;
