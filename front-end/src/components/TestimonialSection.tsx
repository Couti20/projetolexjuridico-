export function TestimonialSection() {
  return (
    <section className="py-24 section-glass">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-full bg-slate-200 border-4 border-white shadow-xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop"
              alt="Advogada"
              width={96}
              height={96}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex-1 text-center md:text-left">
            <blockquote className="text-xl md:text-2xl font-medium italic text-slate-800 mb-4 leading-relaxed">
              "Não abro o e-SAJ há semanas. O Lex não só mitigou o risco dos prazos, como me devolveu a organização da rotina. O tempo que eu perdia procurando atualizações ou planilhando, agora uso faturando novos contratos."
            </blockquote>
            <div>
              <strong className="block text-blue-600 font-bold">Dra. Mariana Silva • Advocacia Cível</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
