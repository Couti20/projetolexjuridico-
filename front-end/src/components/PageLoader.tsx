/**
 * PageLoader — fallback de Suspense para lazy loading de páginas.
 * Exibido enquanto o chunk da página está sendo baixado.
 */
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        <span className="text-sm text-slate-500">Carregando...</span>
      </div>
    </div>
  );
}
