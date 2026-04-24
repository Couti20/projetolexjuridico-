import { Clock, ListTodo, MessageCircle, BarChart3 } from 'lucide-react';
import { FeatureCard } from '../ui/FeatureCard';

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 section-glass relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">A Solução que Trabalha Enquanto Você Advoga</h2>
          <p className="text-lg text-slate-600">
            Transforme caos em controle com nossos quatro pilares de automação jurídica inteligente.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          <FeatureCard
            icon={Clock}
            title="Monitoramento 24/7"
            desc="Conexão direta via API com os principais tribunais do país. Não perca nenhuma movimentação, mesmo em feriados ou finais de semana."
          />
          <FeatureCard
            icon={ListTodo}
            title="Resumo Programado 'Hoje'"
            desc="Escolha o melhor horário do seu dia e receba no WhatsApp um compilado limpo listando exatamente o que precisa ser feito hoje, sem distrações."
          />
          <FeatureCard
            icon={MessageCircle}
            title="Alertas no WhatsApp"
            desc="Receba tudo onde você já está. Elimine atualizações de página e logins demorados buscando por desdobramentos."
          />
          <FeatureCard
            icon={BarChart3}
            title="Dashboard de Demanda Semanal"
            desc="Analise a sua carga de trabalho antes dela chegar. Visualize os prazos distribuídos na semana para realizar uma gestão estratégica e sem gargalos."
          />
        </div>
      </div>
    </section>
  );
}
