import { CheckCircle2 } from 'lucide-react';

interface PricingSectionProps {
  onNavigateSignUp: () => void;
  onNavigateLogin: () => void;
}

export function PricingSection({ onNavigateSignUp, onNavigateLogin }: PricingSectionProps) {
  return (
    <section id="pricing" className="py-24 section-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">Investimento que se paga no primeiro prazo salvo</h2>
          <p className="text-lg text-slate-600">Escolha o plano ideal para a sua estrutura.</p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button type="button" onClick={onNavigateSignUp} className="btn-primary px-6 py-3 text-sm font-semibold rounded-xl">
              Teste grátis
            </button>
            <button
              type="button"
              onClick={onNavigateLogin}
              className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:text-slate-900 transition-colors"
            >
              Entrar
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Solo Plan */}
          <div className="glass-card p-8 group">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Solo <span className="text-sm font-normal text-slate-500 ml-2">/ Essencial</span></h3>
            <p className="text-slate-500 mb-6">Para advogados autônomos que buscam paz mental.</p>
            <div className="mb-8">
              <span className="text-4xl font-extrabold text-blue-600">R$ 149</span>
              <span className="text-slate-500">/mês</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-slate-700"><CheckCircle2 className="text-blue-500" size={20} /> Até 50 processos ativos</li>
              <li className="flex items-center gap-3 text-slate-700"><CheckCircle2 className="text-blue-500" size={20} /> Alertas via WhatsApp</li>
              <li className="flex items-center gap-3 text-slate-700"><CheckCircle2 className="text-blue-500" size={20} /> Monitoramento 1x ao dia</li>
            </ul>
            <button type="button" onClick={onNavigateSignUp} className="w-full py-4 rounded-xl font-semibold text-white btn-primary">
              Teste grátis
            </button>
          </div>

          {/* Office Plan */}
          <div className="glass-dark p-8 relative transform md:-translate-y-4">
            <div className="absolute top-0 right-8 -translate-y-1/2">
              <span className="bg-blue-600 text-white px-3 py-1 text-sm font-bold uppercase tracking-wider rounded-full shadow-lg">Mais Popular</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Office <span className="text-sm font-normal text-slate-400 ml-2">/ Equipes</span></h3>
            <p className="text-slate-400 mb-6">Controle operacional robusto comandando toda a sua operação técnica.</p>
            <div className="mb-8">
              <span className="text-4xl font-extrabold text-blue-400">R$ 499</span>
              <span className="text-slate-400">/mês</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 className="text-blue-400" size={20} /> Processos Ilimitados</li>
              <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 className="text-blue-400" size={20} /> Resumo Programado 'O que Fazer Hoje'</li>
              <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 className="text-blue-400 shrink-0" size={20} /> Dashboard de Demanda Semanal</li>
              <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 className="text-blue-400 shrink-0" size={20} /> Múltiplos Usuários do Escritório</li>
            </ul>
            <button type="button" onClick={onNavigateSignUp} className="w-full py-4 rounded-xl font-semibold text-white btn-primary">
              Teste grátis
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
