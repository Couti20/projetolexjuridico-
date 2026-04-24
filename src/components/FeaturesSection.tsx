import { Clock, ListTodo, MessageCircle, BarChart3 } from 'lucide-react';
import { FeatureCard } from '../ui/FeatureCard';
import type { FeatureItem } from '../types';

const FEATURES: FeatureItem[] = [
  {
    icon:  Clock,
    title: 'Monitoramento 24/7',
    desc:  'Conexão direta via API com os principais tribunais do país. Não perca nenhuma movimentação, mesmo em feriados ou finais de semana.',
  },
  {
    icon:  ListTodo,
    title: "Resumo Programado 'Hoje'",
    desc:  'Escolha o melhor horário do seu dia e receba no WhatsApp um compilado limpo listando exatamente o que precisa ser feito hoje, sem distrações.',
  },
  {
    icon:  MessageCircle,
    title: 'Alertas no WhatsApp',
    desc:  'Receba tudo onde você já está. Elimine atualizações de página e logins demorados buscando por desdobramentos.',
  },
  {
    icon:  BarChart3,
    title: 'Dashboard de Demanda Semanal',
    desc:  'Analise a sua carga de trabalho antes dela chegar. Visualize os prazos distribuídos na semana para realizar uma gestão estratégica e sem gargalos.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" aria-labelledby="features-heading" className="py-24 section-glass relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center max-w-3xl mx-auto mb-20">
          <h2 id="features-heading" className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">
            A Solução que Trabalha Enquanto Você Advoga
          </h2>
          <p className="text-lg text-slate-600">
            Transforme caos em controle com nossos quatro pilares de automação jurídica inteligente.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} />
          ))}
        </div>
      </div>
    </section>
  );
}
