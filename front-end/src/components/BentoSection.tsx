import { MessageCircle, ListTodo } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { weekData } from '../data/weekData';
import { CustomTooltip } from './CustomTooltip';

export function BentoSection() {
  return (
    <section id="solution" className="py-24 section-glass mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 md:flex justify-between items-end">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900">Beleza e eficiência em cada tela.</h2>
            <p className="text-slate-600 text-lg">Um dashboard planejado por advogados, para advogados. Sem poluição visual, apenas o que importa.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
          {/* WhatsApp Visual */}
          <div className="rounded-3xl p-8 flex flex-col relative overflow-hidden group shadow-xl" style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)' }}>
            <div className="w-12 h-12 mb-6 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-sm relative z-10">
              <MessageCircle className="text-white" />
            </div>
            <div className="space-y-4 relative z-10 w-full max-w-sm ml-auto mr-0 md:mr-0">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-xl transform scale-95 opacity-80 transition-transform group-hover:-translate-y-1">
                <p className="text-xs font-bold text-[#128C7E] mb-1">PrazoAlert • 2m atrás</p>
                <p className="text-sm text-slate-800 leading-snug"><b>Processo 0089221-10:</b> Publicação em Diário Oficial. Clique para ler o resumo.</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-2xl transform transition-transform group-hover:-translate-y-1">
                <p className="text-xs font-bold text-[#128C7E] mb-1">PrazoAlert • agora</p>
                <p className="text-sm text-slate-800 leading-snug"><b>Processo 1004523-22:</b> Movimentação em TJSP. Resumo: Prazo de 15 dias para réplica identificado. Deseja agendar?</p>
              </div>
            </div>
            <div className="mt-auto pt-8 relative z-10">
              <h3 className="text-2xl font-bold text-white mb-2 shadow-sm">Processos na Palma da Mão</h3>
              <p className="text-white/90 text-sm max-w-xs drop-shadow-sm">Alertas em tempo real configuráveis para poupar minutos de atualizações manuais no dia a dia.</p>
            </div>
          </div>

          <div className="grid grid-rows-2 gap-6 h-full">
            <div className="glass-card p-8 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                <ListTodo size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Painel "Tarefas de Hoje"</h3>
              <p className="text-slate-600 text-sm">Seu briefing com demandas diárias enviado rigorosamente no seu horário favorito.</p>
            </div>

            <div className="rounded-3xl bg-slate-900 p-0 relative overflow-hidden shadow-xl group cursor-crosshair">
              <div className="absolute inset-x-3 bottom-24 top-6 opacity-90 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-end pointer-events-auto z-10">
                <div className="w-full h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weekData} margin={{ top: 10, right: 0, left: 0, bottom: -10 }}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }} dy={5} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} isAnimationActive={true} />
                      <Bar dataKey="prazos" radius={[4, 4, 0, 0]}>
                        {weekData.map((entry, index) => (
                          <Cell key={`cell-${index}`} cursor="pointer" fill={entry.fill} className="transition-all duration-300 hover:brightness-125" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="absolute bottom-6 left-6 right-6 pointer-events-none z-20">
                <h3 className="text-white font-bold mb-1 drop-shadow-md flex items-center gap-2">
                  Demanda da Semana
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                </h3>
                <p className="text-slate-400 text-xs">Passe o mouse no gráfico para detalhes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
