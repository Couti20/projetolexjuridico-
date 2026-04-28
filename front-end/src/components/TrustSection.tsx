export function TrustSection() {
  return (
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
            <p className="text-xs text-slate-500">Canal para dúvidas: privacidade@lex.com.br</p>
          </article>
        </div>
      </div>
    </section>
  );
}
