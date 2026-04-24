import { Scale, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 pt-16 pb-8 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                <Scale size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">PrazoAlert</span>
            </div>
            <p className="text-slate-400 max-w-sm">
              Automatizando a rotina jurídica no Brasil, recuperando horas vitais de escritórios focados em crescimento.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-xs">Produto</h4>
            <ul className="space-y-3 text-slate-400">
              <li><a href="#features" className="hover:text-blue-400 transition-colors">Funcionalidades</a></li>
              <li><a href="#pricing" className="hover:text-blue-400 transition-colors">Planos</a></li>
              <li><a href="#solution" className="hover:text-blue-400 transition-colors">Como Funciona</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-xs">Empresa</h4>
            <ul className="space-y-3 text-slate-400">
              <li><a href="#security" className="hover:text-blue-400 transition-colors">Conformidade</a></li>
              <li><a href="#terms" className="hover:text-blue-400 transition-colors">Termos de Uso</a></li>
              <li><a href="#privacy" className="hover:text-blue-400 transition-colors">Política de Privacidade</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500">© 2026 PrazoAlert SaaS. Todos os direitos reservados.</p>
          <div className="flex items-center gap-2 text-slate-500 bg-slate-800 px-4 py-2 rounded-full">
            <ShieldCheck size={16} /> LGPD | TLS | AES-256
          </div>
        </div>
      </div>
    </footer>
  );
}
