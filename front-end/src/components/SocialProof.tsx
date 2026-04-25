import React from 'react';
import { Building2, ShieldCheck } from 'lucide-react';

export function SocialProof() {
  return (
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
  );
}
