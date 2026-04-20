/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
  Building2, 
  Scale, 
  ShieldCheck, 
  Clock, 
  MessageCircle, 
  CalendarCheck, 
  ChevronRight, 
  CheckCircle2, 
  ArrowRight,
  Menu,
  X,
  ListTodo,
  BarChart3
} from 'lucide-react';

const Icon3D = ({ icon: Icon, colorType = "blue" }: { icon: any, colorType?: "blue" | "slate" | "red" }) => {
  const colors = {
    blue: "from-blue-400 via-blue-500 to-blue-700 shadow-[inset_0px_-3px_8px_rgba(0,0,0,0.3),inset_0px_3px_8px_rgba(255,255,255,0.4),0_6px_15px_-3px_rgba(37,99,235,0.4)]",
    slate: "from-slate-600 via-slate-700 to-slate-900 shadow-[inset_0px_-3px_8px_rgba(0,0,0,0.4),inset_0px_3px_8px_rgba(255,255,255,0.2),0_6px_15px_-3px_rgba(15,23,42,0.4)]",
    red: "from-rose-400 via-rose-500 to-rose-700 shadow-[inset_0px_-3px_8px_rgba(0,0,0,0.3),inset_0px_3px_8px_rgba(255,255,255,0.4),0_6px_15px_-3px_rgba(225,29,72,0.4)]",
  };

  return (
    <div className="relative w-14 h-14 group perspective-1000 mb-6">
       {/* Drop Shadow Reflection */}
       <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-2 bg-slate-900/40 blur-[4px] rounded-full transition-all duration-300 group-hover:scale-75 group-hover:opacity-50"></div>
       
       {/* 3D Body */}
       <div className={`absolute inset-0 bg-gradient-to-br ${colors[colorType]} rounded-2xl transition-transform duration-300 group-hover:-translate-y-1.5 flex items-center justify-center overflow-hidden border border-white/20`}>
          {/* Glossy top reflection */}
          <div className="absolute top-0 inset-x-0 h-[45%] bg-gradient-to-b from-white/40 to-transparent rounded-t-2xl pointer-events-none"></div>
          {/* Inner bottom glow */}
          <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent rounded-b-2xl pointer-events-none"></div>
          
          {/* The Lucide Icon */}
          <Icon size={26} className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] relative z-10 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-y-12" strokeWidth={2.5} />
       </div>
    </div>
  );
}

const weekData = [
  { name: 'Seg', prazos: 4, fill: 'rgba(255,255,255,0.1)' },
  { name: 'Ter', prazos: 7, fill: 'rgba(255,255,255,0.2)' },
  { name: 'Qua', prazos: 15, isPico: true, fill: '#3B82F6' },
  { name: 'Qui', prazos: 6, fill: 'rgba(255,255,255,0.15)' },
  { name: 'Sex', prazos: 3, fill: 'rgba(255,255,255,0.08)' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 p-2 lg:p-3 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.5)] shrink-0 backdrop-blur-md">
        <p className="text-slate-400 text-[10px] mb-1 font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-white font-bold text-xs lg:text-sm whitespace-nowrap">
          <span className="text-blue-400 text-lg mr-1">{payload[0].value}</span> 
          prazos fatais
        </p>
      </div>
    );
  }
  return null;
};

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen text-slate-800 relative">
      
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'glass-panel py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 text-white p-2 rounded-xl">
                <Scale size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800">PrazoAlert</span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Recursos</a>
              <a href="#solution" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Como Funciona</a>
              <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Planos</a>
              <div className="flex items-center gap-4 ml-4">
                <a href="#security" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Segurança</a>
                <button className="btn-primary px-5 py-2.5 text-sm">
                  Teste Grátis
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600">
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 glass-panel border-none pt-24 px-4 pb-6 flex flex-col gap-6">
          <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-slate-800">Recursos</a>
          <a href="#solution" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-slate-800">Como Funciona</a>
          <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-slate-800">Planos</a>
          <div className="h-px bg-slate-200/50 my-2"></div>
          <a href="#security" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-slate-800">Segurança</a>
          <button className="btn-primary w-full py-3 rounded-xl text-lg font-semibold mt-4">
            Teste Grátis de 7 Dias
          </button>
        </div>
      )}

      {/* Hero Section */}
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
                Recupere 1 hora de foco por dia. <span className="text-blue-600">Deixe os tribunais no piloto automático.</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl">
                O PrazoAlert não monitora apenas seus prazos 24h por dia. Ele centraliza sua rotina, elimina o tempo perdido em portais lentos e traz organização inteligente para o seu dia a dia via WhatsApp.
              </p>
              
              <div className="flex flex-col gap-3 mt-8 max-w-lg">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="email" 
                    placeholder="Seu e-mail profissional..." 
                    className="flex-1 px-5 py-4 rounded-xl border border-slate-200/50 bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 shadow-inner"
                  />
                  <button className="btn-primary px-8 py-4 font-semibold flex items-center justify-center gap-2 transition-all whitespace-nowrap">
                    Testar Grátis <ArrowRight size={20} />
                  </button>
                </div>
                <div className="flex items-center flex-wrap gap-4 text-xs text-slate-500 font-medium ml-1">
                  <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-emerald-500"/> 7 dias grátis</span>
                  <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-emerald-500"/> Liberação imediata</span>
                </div>
              </div>
              
              <div className="mt-8 flex items-center gap-4 text-sm text-slate-500">
                <div className="flex -space-x-2">
                   <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64" alt="User" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                   <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64" alt="User" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                   <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64" alt="User" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
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
                transition={{ delay: 1.2, type: "spring" }}
                className="absolute right-0 sm:right-4 lg:-right-8 top-0 lg:top-12 z-30 bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-[0_20px_40px_rgba(37,99,235,0.15)] border border-blue-50 flex items-center gap-3 sm:gap-4 transform scale-90 sm:scale-100 origin-top-right"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                  <Clock size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 line-height-tight">Tempo recuperado</p>
                  <p className="text-lg sm:text-xl font-bold text-slate-900">+40h / mês</p>
                </div>
              </motion.div>

              {/* Dashboard Preview (CSS Abstract UI) */}
              <div className="absolute top-10 sm:top-12 lg:top-4 right-0 w-[95%] sm:w-[85%] lg:w-[500px] max-w-full glass-dark p-3 sm:p-5 z-10 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl transform lg:translate-x-12 lg:-translate-y-4">
                <div className="w-full h-full bg-slate-900/50 rounded-xl sm:rounded-2xl border border-slate-700/50 p-4 flex flex-col gap-4">
                   {/* Header fake */}
                   <div className="flex justify-between items-center pb-3 border-b border-slate-700/50">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center"><BarChart3 size={16} className="text-white"/></div>
                         <div className="w-24 h-4 bg-slate-700 rounded-md"></div>
                      </div>
                      <div className="flex gap-2">
                         <div className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700"></div>
                         <div className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700"></div>
                      </div>
                   </div>
                   {/* Panel Content fake */}
                   <div className="flex gap-4 h-[200px] sm:h-[240px]">
                      <div className="flex-1 border border-slate-700/50 rounded-xl bg-slate-800/30 p-3 sm:p-4 flex flex-col">
                         <div className="w-1/2 h-3 bg-slate-600 rounded-md mb-2"></div>
                         <div className="w-3/4 h-5 bg-white rounded-md mb-6"></div>
                         <div className="mt-auto flex items-end gap-2 h-24">
                            <div className="flex-1 bg-blue-500/80 rounded-t-md h-[40%]"></div>
                            <div className="flex-1 bg-blue-400 rounded-t-md h-[70%] relative"></div>
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

              {/* Phone Mockup with WhatsApp Alert */}
              <motion.div 
                initial={{ y: 100, opacity: 0, rotate: -5 }}
                animate={{ y: 0, opacity: 1, rotate: -5 }}
                transition={{ duration: 0.8, delay: 0.8, type: "spring", bounce: 0.4 }}
                className="absolute left-0 sm:left-4 lg:-left-2 xl:-left-8 -bottom-6 sm:bottom-0 lg:bottom-12 z-20 w-[220px] sm:w-[260px] h-[400px] sm:h-[480px] bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] p-1.5 sm:p-2 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-[4px] border-slate-800 transform origin-bottom-left"
              >
                {/* Screen */}
                <div className="relative w-full h-full bg-[#E5DDD5] rounded-[2rem] overflow-hidden flex flex-col">
                  {/* Status Bar / Notch */}
                  <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
                    <div className="w-24 h-5 bg-slate-900 rounded-b-xl"></div>
                  </div>
                  
                  {/* Push Notification (Banner sliding down and up) */}
                  <motion.div
                    animate={{ 
                      y: [-100, 8, 8, 8, -100],
                      opacity: [0, 1, 1, 1, 0],
                      scale: [0.95, 1, 1, 1, 0.95]
                    }}
                    transition={{ 
                      duration: 6, 
                      times: [0, 0.1, 0.8, 0.9, 1],
                      repeat: Infinity, 
                      repeatDelay: 1.5,
                      ease: "easeInOut"
                    }}
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
                      <p className="text-[11px] font-bold text-slate-800 leading-tight">PrazoAlert</p>
                      <p className="text-[10px] text-slate-600 leading-tight mt-0.5 line-clamp-2">🚨 <strong>Novo Andamento:</strong> Processo 0089... Prazo de manifestação aberto. Veja agora.</p>
                    </div>
                  </motion.div>

                  {/* WhatsApp Header */}
                  <div className="bg-[#075E54] pt-8 pb-3 px-4 flex items-center gap-3 shadow-md z-20">
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0">
                      <MessageCircle size={18} fill="#25D366" className="text-[#25D366]" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-sm leading-tight">PrazoAlert</h4>
                      <p className="text-emerald-100 text-[10px] leading-tight">online</p>
                    </div>
                  </div>
                  
                  {/* Chat Pattern Background (abstract) */}
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>

                  {/* Message Container */}
                  <div className="flex-1 p-3 flex flex-col justify-end pb-12 z-10">
                    {/* Animated Message Bubble */}
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0, x: -20 }}
                      animate={{ scale: 1, opacity: 1, x: 0 }}
                      transition={{ delay: 1.8, duration: 0.4, type: "spring" }}
                      className="bg-white rounded-tr-xl rounded-br-xl rounded-bl-xl p-3 shadow-sm relative self-start max-w-[95%]"
                    >
                      <p className="text-[13px] text-slate-800 leading-relaxed">
                        ⚖️ <strong>Briefing de Hoje (14/08)</strong><br/><br/>
                        Você tem 3 prazos vencendo hoje.<br/>
                        1. Apelação (Processo 0034...)<br/>
                        2. Réplica (Processo 1122...)<br/><br/>
                        Resumos na plataforma. Bom dia!
                      </p>
                      <div className="flex justify-end gap-1 mt-1 items-center">
                        <span className="text-[9px] text-slate-400">07:00</span>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Decorative Blur */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-400/30 rounded-full blur-[80px] -z-10"></div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-10 section-glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider text-center md:text-left shrink-0">
            Mais de 12 Tribunais Suportados:
          </p>
          <div className="relative flex overflow-x-hidden w-full opacity-60 grayscale [mask-image:_linear-gradient(to_right,transparent_0,_black_60px,_black_calc(100%-60px),transparent_100%)]">
            <div className="animate-marquee flex whitespace-nowrap items-center min-w-max">
              {[1, 2, 3].map((_, idx) => (
                <React.Fragment key={idx}>
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mx-8"><Building2 /> TJSP</h3>
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mx-8"><Building2 /> TRF</h3>
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mx-8"><Building2 /> TRT</h3>
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mx-8"><Building2 /> PJe</h3>
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mx-8"><Building2 /> E-PROC</h3>
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-[10px] sm:text-xs font-bold text-[#1E293B] opacity-80 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-md border border-emerald-500/20 shrink-0">
            <ShieldCheck size={14} className="text-emerald-500" />
            LGPD e Criptografia AES-256
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-24 section-glass relative">
        <div className="max-w-3xl mx-auto text-center px-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">O Caos e a Desorganização da Advocacia</h2>
          <p className="text-lg text-slate-600">
            Dados apontam que advogados perdem até 30% do tempo útil com burocracias e falta de organização. Você estudou para ser um estrategista jurídico, não um atualizador de páginas.
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Clock, title: "Desperdício de Tempo", desc: "Extremas horas perdidas diariamente navegando em múltiplos portais lentos e instáveis do sistema judiciário." },
              { icon: ListTodo, title: "Desorganização Diária", desc: "Informações espalhadas em planilhas, e-mails e anotações, reduzindo a eficiência e gestão do escritório." },
              { icon: CalendarCheck, title: "Ansiedade Constante", desc: "O medo de perder um prazo fatal misturado com o caos operacional de tentar dar conta de todas as rotinas." }
            ].map((item, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 className="glass-card p-8 group transition-all"
               >
                 <Icon3D icon={item.icon} colorType="slate" />
                 <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                 <p className="text-slate-600">{item.desc}</p>
               </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Solution (Features) */}
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

      {/* Visual Showcase (Bento Grid) */}
      <section id="solution" className="py-24 section-glass mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 md:flex justify-between items-end">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900">Beleza e eficiência em cada tela.</h2>
              <p className="text-slate-600 text-lg">Um dashboard planejado por advogados, para advogados. Sem poluição visual, apenas o que  importa.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
            {/* WhatsApp Visual */}
            <div className="rounded-3xl p-8 flex flex-col relative overflow-hidden group shadow-xl" style={{background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)'}}>
              <div className="w-12 h-12 mb-6 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-sm relative z-10">
                 <MessageCircle className="text-white" />
              </div>
              
              <div className="space-y-4 relative z-10 w-full max-w-sm ml-auto mr-0 md:mr-0">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-xl transform scale-95 opacity-80 transition-transform group-hover:-translate-y-1">
                  <p className="text-xs font-bold text-[#128C7E] mb-1">PrazoAlert • 2m atrás</p>
                  <p className="text-sm text-slate-800 leading-snug">
                    <b>Processo 0089221-10:</b> Publicação em Diário Oficial. Clique para ler o resumo.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-2xl transform transition-transform group-hover:-translate-y-1">
                  <p className="text-xs font-bold text-[#128C7E] mb-1">PrazoAlert • agora</p>
                  <p className="text-sm text-slate-800 leading-snug">
                    <b>Processo 1004523-22:</b> Movimentação em TJSP. Resumo: Prazo de 15 dias para réplica identificado. Deseja agendar?
                  </p>
                </div>
              </div>

              <div className="mt-auto pt-8 relative z-10">
                <h3 className="text-2xl font-bold text-white mb-2 shadow-sm">Processos na Palma da Mão</h3>
                <p className="text-white/90 text-sm max-w-xs drop-shadow-sm">Alertas em tempo real configuráveis para poupar minutos de atualizações manuais no dia a dia.</p>
              </div>
            </div>

            <div className="grid grid-rows-2 gap-6 h-full">
              {/* Minor Visual 1 */}
              <div className="glass-card p-8 relative overflow-hidden group">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                  <ListTodo size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Painel "Tarefas de Hoje"</h3>
                <p className="text-slate-600 text-sm">Seu briefing com demandas diárias enviado rigorosamente no seu horário favorito.</p>
              </div>

              {/* Minor Visual 2 (Dashboard Preview) */}
              <div className="rounded-3xl bg-slate-900 p-0 relative overflow-hidden shadow-xl group cursor-crosshair">
                 <div className="absolute inset-x-3 bottom-24 top-6 opacity-90 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-end pointer-events-auto z-10">
                    <div className="w-full h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weekData} margin={{ top: 10, right: 0, left: 0, bottom: -10 }}>
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }} 
                            dy={5} 
                          />
                          <Tooltip 
                            content={<CustomTooltip />} 
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            isAnimationActive={true}
                          />
                          <Bar dataKey="prazos" radius={[4, 4, 0, 0]}>
                            {weekData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                cursor="pointer"
                                fill={entry.fill} 
                                className="transition-all duration-300 hover:brightness-125"
                              />
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

      {/* Testimonial */}
      <section className="py-24 section-glass">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-full bg-slate-200 border-4 border-white shadow-xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop" 
                alt="Advogada" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <blockquote className="text-xl md:text-2xl font-medium italic text-slate-800 mb-4 leading-relaxed">
                "Não abro o e-SAJ há semanas. O PrazoAlert não só mitigou o risco dos prazos, como me devolveu a organização da rotina. O tempo que eu perdia procurando atualizações ou planilhando, agora uso faturando novos contratos."
              </blockquote>
              <div>
                <strong className="block text-blue-600 font-bold">Dra. Mariana Silva • Advocacia Cível</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Table */}
      <section id="pricing" className="py-24 section-glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">Investimento que se paga no primeiro prazo salvo</h2>
            <p className="text-lg text-slate-600">Escolha o plano ideal para a sua estrutura.</p>
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
              <button className="w-full py-4 rounded-xl font-semibold text-white btn-primary">
                Começar Teste Grátis
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
                <li className="flexItems-center gap-3 text-slate-300 flex"><CheckCircle2 className="text-blue-400 shrink-0" size={20} /> Dashboard de Demanda Semanal</li>
                <li className="flexItems-center gap-3 text-slate-300 flex"><CheckCircle2 className="text-blue-400 shrink-0" size={20} /> Múltiplos Usuários do Escritório</li>
              </ul>
              <button className="w-full py-4 rounded-xl font-semibold text-white btn-primary">
                Assinar Plano Office
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 section-glass">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center">Perguntas Frequentes</h2>
          <div className="space-y-6">
            <FaqItem 
              q="O PrazoAlert lê processos em segredo de justiça?"
              a="Não. Respeitando rigorosamente a LGPD e o sigilo profissional, nossa IA processa apenas andamentos públicos ou informações onde você forneceu o login via cofre de senhas criptografado (AES-256)."
            />
            <FaqItem 
              q="Como funciona o resumo com atividades programadas para 'Hoje'?"
              a="Você escolhe o melhor horário, como 07h00 da manhã. Todos os dias nesse horário, listamos no seu WhatsApp um compilado de atividades e prazos monitorados que necessitam da sua atenção específica naquele dia."
            />
            <FaqItem 
              q="Preciso instalar algum aplicativo novo?"
              a="Nenhum. Toda a interação e avisos ocorrem via WhatsApp e nosso site que é responsivo em qualquer dispositivo."
            />
          </div>
        </div>
      </section>

      {/* Trust & Compliance */}
      <section id="security" className="py-24 section-glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Conformidade e Segurança com Transparência</h2>
            <p className="text-slate-600 text-lg">
              Esta landing page apresenta nosso compromisso de privacidade e segurança para avaliação comercial. Os controles operacionais do software serão disponibilizados no ambiente autenticado do produto.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <article id="privacy" className="glass-card p-7">
              <p className="text-xs font-semibold tracking-wider uppercase text-blue-600 mb-3">Privacidade</p>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Política de Privacidade</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Definimos base legal, finalidade de uso de dados, retenção e direitos do titular, em linha com a LGPD.
              </p>
              <p className="text-xs text-slate-500">Última atualização: abril/2026</p>
            </article>

            <article className="glass-card p-7">
              <p className="text-xs font-semibold tracking-wider uppercase text-blue-600 mb-3">Segurança</p>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Compromisso de Segurança</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Proteção em trânsito com TLS, criptografia em repouso e controles de acesso com autenticação em dois fatores (2FA) para contas de usuários.
              </p>
              <p className="text-xs text-slate-500">Escopo inicial: dados de uso da plataforma e contatos de notificação.</p>
            </article>

            <article id="terms" className="glass-card p-7">
              <p className="text-xs font-semibold tracking-wider uppercase text-blue-600 mb-3">Legal</p>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Termos de Uso</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Regras comerciais, responsabilidades das partes e condições do período de teste gratuito.
              </p>
              <p className="text-xs text-slate-500">Canal para dúvidas: privacidade@prazoalert.com.br</p>
            </article>
          </div>
        </div>
      </section>

      {/* Footer */}
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

    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 glass-card transition-all group"
    >
      <Icon3D icon={Icon} colorType="blue" />
      <h3 className="text-2xl font-bold text-slate-900 mb-4">{title}</h3>
      <p className="text-slate-600 leading-relaxed text-sm md:text-base">{desc}</p>
    </motion.div>
  );
}

function FaqItem({ q, a }: { q: string, a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-panel rounded-2xl overflow-hidden transition-all">
      <button 
        onClick={() => setOpen(!open)} 
        className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none"
      >
        <span className="font-semibold text-slate-900 text-lg">{q}</span>
        <ChevronRight size={20} className={`text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="text-slate-600 leading-relaxed">{a}</p>
      </div>
    </div>
  );
}
