import { motion } from 'motion/react';
import { Clock, ListTodo, CalendarCheck } from 'lucide-react';
import { Icon3D } from '../ui/Icon3D';
import type { ProblemItem } from '../types';

const PROBLEMS: ProblemItem[] = [
  {
    icon:  Clock,
    title: 'Desperdício de Tempo',
    desc:  'Extremas horas perdidas diariamente navegando em múltiplos portais lentos e instáveis do sistema judiciário.',
  },
  {
    icon:  ListTodo,
    title: 'Desorganização Diária',
    desc:  'Informações espalhadas em planilhas, e-mails e anotações, reduzindo a eficiência e gestão do escritório.',
  },
  {
    icon:  CalendarCheck,
    title: 'Ansiedade Constante',
    desc:  'O medo de perder um prazo fatal misturado com o caos operacional de tentar dar conta de todas as rotinas.',
  },
];

export function ProblemSection() {
  return (
    <section aria-labelledby="problem-heading" className="py-24 section-glass relative">
      <div className="max-w-3xl mx-auto text-center px-4 mb-16">
        <h2 id="problem-heading" className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
          O Caos e a Desorganização da Advocacia
        </h2>
        <p className="text-lg text-slate-600">
          Dados apontam que advogados perdem até 30% do tempo útil com burocracias e falta de
          organização. Você estudou para ser um estrategista jurídico, não um atualizador de páginas.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {PROBLEMS.map((item, i) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-8 group transition-all"
            >
              <Icon3D icon={item.icon} colorType="slate" />
              <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
              <p className="text-slate-600">{item.desc}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
