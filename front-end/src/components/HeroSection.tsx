import { type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Scale, Clock, MessageCircle, CheckCircle2, ArrowRight, BarChart3 } from 'lucide-react';

interface HeroSectionProps {
  leadEmail: string;
  setLeadEmail: (v: string) => void;
  leadSubmitted: boolean;
  setLeadSubmitted: (v: boolean) => void;
  handleLeadSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

export function HeroSection({ leadEmail, setLeadEmail, leadSubmitted, setLeadSubmitted, handleLeadSubmit }: HeroSectionProps) {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="badge-soft inline-flex items-center gap-2 mb-6 border border-blue-100/50">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              Seu Assistente de Prazos Pessoal
            </div>
            <h1 className="text-5xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-6 lg:pr-12 relative z-30">
              Recupere 1 hora de foco por dia.{' '}
              <span className="text-blue-600">Deixe os tribunais no piloto automático.</span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl">
              O Lex não monitora apenas seus prazos 24h por dia. Ele centraliza sua rotina, elimina o tempo perdido em portais lentos e traz organização inteligente para o seu dia a dia via WhatsApp.
            </p>

            <div className="flex flex-col gap-3 mt-8 max-w-lg">
              <form onSubmit={handleLeadSubmit} className="flex flex-col sm:flex-row gap-3">
                <label htmlFor="lead-email" className="sr-only">Seu e-mail profissional</label>
                <input
                  id="lead-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={leadEmail}
                  onChange={(e) => {
                    setLeadEmail(e.target.value);
                    if (leadSubmitted) setLeadSubmitted(false);
                  }}
                  placeholder="Seu e-mail profissional..."
                  className="flex-1 px-5 py-4 rounded-xl border border-slate-200/50 bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 shadow-inner"
                />
                <button type="submit" className="btn-primary px-8 py-4 font-semibold flex items-center justify-center gap-2 transition-all whitespace-nowrap">
                  Testar Grátis <ArrowRight size={20} />
                </button>
              </form>
              {leadSubmitted && (
                <p className="text-xs text-emerald-700 font-medium ml-1">
                  Recebemos seu e-mail. Em breve entraremos em contato.
                </p>
              )}
              <div className="flex items-center flex-wrap gap-4 text-xs text-slate-500 font-medium ml-1">
                <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-emerald-500" /> 7 dias grátis</span>
                <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-emerald-500" /> Liberação imediata</span>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-4 text-sm text-slate-500">
              <div className="flex -space-x-2">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64" alt="User" width={32} height={32} loading="lazy" decoding="async" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64" alt="User" width={32} height={32} loading="lazy" decoding="async" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64" alt="User" width={32} height={32} loading="lazy" decoding="async" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
              </div>
              <p>Junte-se a +2.000 advogados focados</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full h-[450px] sm:h-[500px] lg:h-[600px] mt-16 lg:mt-0 flex items-center justify-center lg:justify-end"
          >
            {/* Floating Impact Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, type: 'spring' }}
              className="absolute right-0 sm:right-4 lg:-right-8 top-0 lg:top-12 z-30 bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-[0_20px_40px_rgba(37,99,235,0.15)] border border-blue-50 flex items-center gap-3 sm:gap-4 transform scale-90 sm:scale-100 origin-top-right"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                <Clock size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500 leading-tight">Tempo recuperado</p>
                <p className="text-lg sm:text-xl font-bold text-slate-900">+40h / mês</p>
              </div>
            </motion.div>

            {/* Dashboard Preview */}
            <div className="absolute top-10 sm:top-12 lg:top-4 right-0 w-[95%] sm:w-[85%] lg:w-[500px] max-w-full glass-dark p-3 sm:p-5 z-10 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl transform lg:translate-x-12 lg:-translate-y-4">
              <div className="w-full h-full bg-slate-900/50 rounded-xl sm:rounded-2xl border border-slate-700/50 p-4 flex flex-col gap-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center"><BarChart3 size={16} className="text-white" /></div>
                    <div className="w-24 h-4 bg-slate-700 rounded-md"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700"></div>
                    <div className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700"></div>
                  </div>
                </div>
                <div className="flex gap-4 h-[200px] sm:h-[240px]">
                  <div className="flex-1 border border-slate-700/50 rounded-xl bg-slate-800/30 p-3 sm:p-4 flex flex-col">
                    <div className="w-1/2 h-3 bg-slate-600 rounded-md mb-2"></div>
                    <div className="w-3/4 h-5 bg-white rounded-md mb-6"></div>
                    <div className="mt-auto flex items-end gap-2 h-24">
                      <div className="flex-1 bg-blue-500/80 rounded-t-md h-[40%]"></div>
                      <div className="flex-1 bg-blue-400 rounded-t-md h-[70%]"></div>
                      <div className="flex-1 bg-blue-600 rounded-t-md h-[100%] shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
                      <div className="flex-1 bg-slate-600/50 rounded-t-md h-[50%]"></div>
                      <div className="flex-1 bg-slate-600/50 rounded-t-md h-[80%]"></div>
                      <div className="flex-1 bg-blue-500/80 rounded-t-md h-[60%]"></div>
                    </div>
                  </div>
                  <div className="w-1/3 flex flex-col gap-3">
                    <div className="flex-1 border border-slate-700/50 rounded-xl bg-slate-800/30 p-3 flex flex-col justify-center">
                      <div className="w-full h-2 bg-slate-600 rounded mb-2"></div>
                      <div className="w-2/3 h-4 bg-white rounded"></div>
                    </div>
                    <div className="flex-1 border border-slate-700/50 rounded-xl bg-slate-800/30 p-3 flex flex-col justify-center">
                      <div className="w-full h-2 bg-slate-600 rounded mb-2"></div>
                      <div className="w-1/2 h-4 bg-blue-400 rounded"></div>
                    </div>
                    <div className="flex-1 border border-emerald-900/50 rounded-xl bg-emerald-900/20 p-3 flex flex-col justify-center">
                      <div className="w-full h-2 bg-emerald-700/50 rounded mb-2"></div>
                      <div className="w-3/4 h-4 bg-emerald-400 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phone Mockup */}
            <motion.div
              initial={{ y: 100, opacity: 0, rotate: -5 }}
              animate={{ y: 0, opacity: 1, rotate: -5 }}
              transition={{ duration: 0.8, delay: 0.8, type: 'spring', bounce: 0.4 }}
              className="absolute left-0 sm:left-4 lg:-left-2 xl:-left-8 -bottom-6 sm:bottom-0 lg:bottom-12 z-20 w-[220px] sm:w-[260px] h-[400px] sm:h-[480px] bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] p-1.5 sm:p-2 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-[4px] border-slate-800 transform origin-bottom-left"
            >
              <div className="relative w-full h-full bg-[#E5DDD5] rounded-[2rem] overflow-hidden flex flex-col">
                <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
                  <div className="w-24 h-5 bg-slate-900 rounded-b-xl"></div>
                </div>
                <motion.div
                  animate={{
                    y: [-100, 8, 8, 8, -100],
                    opacity: [0, 1, 1, 1, 0],
                    scale: [0.95, 1, 1, 1, 0.95],
                  }}
                  transition={{ duration: 6, times: [0, 0.15, 0.75, 0.9, 1], repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
                  className="absolute top-0 left-2 right-2 bg-white/95 backdrop-blur-xl rounded-2xl p-2.5 shadow-2xl z-40 flex items-start gap-2.5 border border-slate-200"
                >
                  <div className="w-8 h-8 rounded-[10px] bg-[#25D366] flex items-center justify-center shrink-0 shadow-sm">
                    <MessageCircle size={18} fill="white" className="text-white" />
                  </div>
                  <div className="flex-1 mt-0.5">
                    <div className="flex justify-between items-center mb-0.5">
                      <h5 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">WhatsApp</h5>
                      <span className="text-[9px] text-slate-400">agora</span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-800 leading-tight">Lex</p>
                    <p className="text-[10px] text-slate-600 leading-tight mt-0.5 line-clamp-2">🚨 <strong>Novo Andamento:</strong> Processo 0089... Prazo de manifestação aberto. Veja agora.</p>
                  </div>
                </motion.div>
                <div className="bg-[#075E54] pt-8 pb-3 px-4 flex items-center gap-3 shadow-md z-20">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0">
                    <MessageCircle size={18} fill="#25D366" className="text-[#25D366]" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm leading-tight">Lex</h4>
                    <p className="text-emerald-100 text-[10px] leading-tight">online</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
                <div className="flex-1 p-3 flex flex-col justify-end pb-12 z-10">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0, x: -20 }}
                    animate={{ scale: 1, opacity: 1, x: 0 }}
                    transition={{ delay: 1.8, duration: 0.4, type: 'spring' }}
                    className="bg-white rounded-tr-xl rounded-br-xl rounded-bl-xl p-3 shadow-sm relative self-start max-w-[95%]"
                  >
                    <p className="text-[13px] text-slate-800 leading-relaxed">
                      ⚖️ <strong>Briefing de Hoje (14/08)</strong><br /><br />
                      Você tem 3 prazos vencendo hoje.<br />
                      1. Apelação (Processo 0034...)<br />
                      2. Réplica (Processo 1122...)<br /><br />
                      Resumos na plataforma. Bom dia!
                    </p>
                    <div className="flex justify-end gap-1 mt-1 items-center">
                      <span className="text-[9px] text-slate-400">07:00</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-400/30 rounded-full blur-[80px] -z-10"></div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
